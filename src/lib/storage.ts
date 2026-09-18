/**
 * Mock "database" persisted to localStorage.
 *
 * This stands in for a real backend (e.g. Postgres + Supabase Auth) so the
 * whole product can be demoed without infrastructure. Every read/write goes
 * through this single module, so swapping it for real HTTP calls later only
 * touches this file plus the *Repo functions in lib/repo.ts — components and
 * pages never touch localStorage directly.
 */

const DB_KEY = 'yalla:db:v1'

export interface Tables {
  users: Record<string, import('../types').User>
  events: Record<string, import('../types').SportEvent>
  registrations: Record<string, import('../types').Registration>
  friendships: Record<string, import('../types').Friendship>
  points: Record<string, import('../types').PointsEntry>
  rewards: Record<string, import('../types').Reward>
  redemptions: Record<string, import('../types').Redemption>
}

export type TableName = keyof Tables

function emptyDb(): Tables {
  return {
    users: {},
    events: {},
    registrations: {},
    friendships: {},
    points: {},
    rewards: {},
    redemptions: {},
  }
}

let cache: Tables | null = null
let version = 0
const listeners = new Set<() => void>()

export function getVersion() {
  return version
}

function read(): Tables {
  if (cache) return cache
  let next: Tables
  try {
    const raw = localStorage.getItem(DB_KEY)
    next = raw ? { ...emptyDb(), ...JSON.parse(raw) } : emptyDb()
  } catch {
    next = emptyDb()
  }
  cache = next
  return next
}

function write(db: Tables) {
  cache = db
  version++
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch {
    // storage full / unavailable — demo continues in-memory
  }
  for (const l of listeners) l()
}

export function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getTable<T extends TableName>(name: T): Tables[T] {
  return read()[name]
}

export function all<T extends TableName>(name: T): Tables[T][keyof Tables[T]][] {
  return Object.values(getTable(name)) as Tables[T][keyof Tables[T]][]
}

export function getById<T extends TableName>(name: T, id: string): Tables[T][string] | undefined {
  return getTable(name)[id] as Tables[T][string] | undefined
}

export function put<T extends TableName>(name: T, id: string, value: Tables[T][string]) {
  const db = read()
  db[name] = { ...db[name], [id]: value } as Tables[T]
  write({ ...db })
  return value
}

export function remove<T extends TableName>(name: T, id: string) {
  const db = read()
  const next = { ...db[name] }
  delete next[id]
  db[name] = next as Tables[T]
  write({ ...db })
}

export function resetDb() {
  write(emptyDb())
}

export function isEmpty() {
  const db = read()
  return Object.keys(db.users).length === 0 && Object.keys(db.events).length === 0
}

export function bulkSeed(seed: Partial<Tables>) {
  const db = read()
  const next: Tables = { ...db }
  for (const key of Object.keys(seed) as TableName[]) {
    next[key] = { ...db[key], ...seed[key] } as never
  }
  write(next)
}
