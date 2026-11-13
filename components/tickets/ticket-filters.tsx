"use client";

import { useEffect, useState } from "react";
import { RefreshCwIcon, SearchIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  hasActiveFilters,
  QUEUES,
  TICKET_TABS,
  type TabKey,
  type TicketFilters,
} from "@/lib/ticket-filters";
import { queue as queueMeta } from "@/lib/status";

export function TicketFiltersBar({
  filters,
  onTabChange,
  onQueueChange,
  onSearchChange,
  onClear,
  onRefresh,
}: {
  filters: TicketFilters;
  onTabChange: (tab: TabKey) => void;
  onQueueChange: (queue: string) => void;
  onSearchChange: (query: string) => void;
  onClear: () => void;
  onRefresh: () => void;
}) {
  const [query, setQuery] = useState(filters.q);

  useEffect(() => {
    if (query === filters.q) return;
    const timer = setTimeout(() => onSearchChange(query), 300);
    return () => clearTimeout(timer);
  }, [query, filters.q, onSearchChange]);

  return (
    <div className="flex flex-col gap-3">
      <Tabs
        value={filters.tab}
        onValueChange={(value) => onTabChange(value as TabKey)}
        className="gap-0"
      >
        <TabsList variant="line" className="w-full justify-start overflow-x-auto">
          {TICKET_TABS.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="flex-none">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <InputGroup className="w-full sm:max-w-xs">
          <InputGroupAddon>
            <SearchIcon aria-hidden />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search subject or body"
            aria-label="Search tickets by subject or body"
          />
          {query.length > 0 && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  onSearchChange("");
                }}
              >
                <XIcon aria-hidden />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>

        <Select value={filters.queue ?? "all"} onValueChange={(value) => onQueueChange(String(value))}>
          <SelectTrigger size="sm" className="w-full sm:w-40" aria-label="Filter by queue">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Queue</SelectLabel>
              <SelectItem value="all">All queues</SelectItem>
              {QUEUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {queueMeta(value)?.label ?? value}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {hasActiveFilters(filters) && (
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="sm:ml-auto"
          aria-label="Refresh ticket list"
        >
          <RefreshCwIcon data-icon="inline-start" />
          Refresh
        </Button>
      </div>
    </div>
  );
}
