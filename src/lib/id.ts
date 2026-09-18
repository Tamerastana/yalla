export function uid(prefix = ''): string {
  const rand = Math.random().toString(36).slice(2, 10)
  const time = Date.now().toString(36)
  return prefix ? `${prefix}_${time}${rand}` : `${time}${rand}`
}

/**
 * NOT real cryptography. This demo has no server, so there is nothing to
 * keep a proper bcrypt/argon2 hash secret from — it would live in the same
 * browser storage as the "hash". A production build must move auth to a
 * real backend (Supabase Auth, Firebase Auth, etc.) instead of hashing
 * client-side.
 */
export function mockHash(input: string): string {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16)
}
