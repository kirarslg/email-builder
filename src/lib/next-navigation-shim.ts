/**
 * Shim for `next/navigation` — onborda imports `useRouter` from it but only
 * uses it if step has `nextRoute`/`prevRoute` (we never set those). Returning
 * a no-op router satisfies the import without pulling Next.js into the project.
 */
export function useRouter() {
  return {
    push: (_url: string) => {},
    replace: (_url: string) => {},
    back: () => {},
    forward: () => {},
    refresh: () => {},
    prefetch: (_url: string) => {},
  }
}
