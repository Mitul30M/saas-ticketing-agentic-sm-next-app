"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface PollingOptions<T> {
  /** Fixed interval, or a function of the latest data (e.g. 2 s while triaging). */
  intervalMs: number | ((data: T | undefined) => number);
  initialData?: T;
  /**
   * Whether the interval should fetch. A function is re-evaluated against the
   * latest data, so a ticket that leaves a terminal state after a manual
   * refresh resumes polling. Manual `refresh()` always works.
   */
  enabled?: boolean | ((data: T | undefined) => boolean);
}

export interface PollingResult<T> {
  data: T | undefined;
  error: Error | null;
  isRefreshing: boolean;
  failures: number;
  updatedAt: number | null;
  refresh: () => void;
}

/**
 * One polling owner per page. Runs immediately, then on an interval; pauses
 * while the tab is hidden, refreshes on return, aborts the previous request on
 * every tick and on unmount, and keeps the last good data when a refresh fails.
 */
export function usePolling<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  { intervalMs, initialData, enabled = true }: PollingOptions<T>
): PollingResult<T> {
  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [failures, setFailures] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  const fetcherRef = useRef(fetcher);
  const dataRef = useRef<T | undefined>(initialData);
  const controllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef(intervalMs);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  // Keep the loop stable even when callers pass inline functions (the ticket
  // detail does, to change cadence with status). Restarting the effect on every
  // render would turn a refresh into a request storm.
  useEffect(() => {
    intervalRef.current = intervalMs;
    enabledRef.current = enabled;
  }, [intervalMs, enabled]);

  const run = useCallback(async () => {
    controllerRef.current?.abort();
    const current = new AbortController();
    controllerRef.current = current;
    setIsRefreshing(true);
    try {
      const next = await fetcherRef.current(current.signal);
      if (current.signal.aborted) return;
      dataRef.current = next;
      setData(next);
      setError(null);
      setFailures(0);
      setUpdatedAt(Date.now());
    } catch (cause) {
      if (current.signal.aborted) return;
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      setError(cause instanceof Error ? cause : new Error("Request failed"));
      setFailures((count) => count + 1);
    } finally {
      if (!current.signal.aborted) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const shouldFetch = () => {
      const setting = enabledRef.current;
      return typeof setting === "function" ? setting(dataRef.current) : setting;
    };

    const delay = () => {
      const setting = intervalRef.current;
      return typeof setting === "function" ? setting(dataRef.current) : setting;
    };

    const loop = async () => {
      if (shouldFetch() && document.visibilityState === "visible") await run();
      if (!cancelled) timer = setTimeout(loop, delay());
    };

    void loop();

    const onVisibility = () => {
      if (shouldFetch() && document.visibilityState === "visible") void run();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      controllerRef.current?.abort();
    };
  }, [run]);

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const refresh = useCallback(() => {
    void run();
  }, [run]);

  return { data, error, isRefreshing, failures, updatedAt, refresh };
}
