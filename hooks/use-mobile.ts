import * as React from "react"

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches
}

/**
 * Server render (and the first client paint before hydration) reports desktop.
 * `useSyncExternalStore` is the supported way to read a browser media query: it
 * subscribes in a callback instead of calling setState inside an effect, which
 * eslint-config-next 16 now rejects (`react-hooks/set-state-in-effect`).
 */
function getServerSnapshot() {
  return false
}

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
