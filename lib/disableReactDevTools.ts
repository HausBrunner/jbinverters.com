// lib/disableReactDevTools.ts

export function disableReactDevTools() {
  if (typeof window === "undefined") return; // SSR guard

  const devTools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (devTools) {
    for (const key in devTools) {
      // Replace functions with no-ops and objects with null
      devTools[key] =
        typeof devTools[key] === "function" ? () => {} : null;
    }
  }
}
