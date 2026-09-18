import { useSyncExternalStore } from 'react'
import { getVersion, subscribe } from './storage'

/**
 * Re-renders the calling component whenever the mock database changes.
 * Components read data via plain repo.* function calls (not selectors),
 * so this just needs to force a re-render on any write.
 */
export function useDbVersion(): number {
  return useSyncExternalStore(subscribe, getVersion, getVersion)
}
