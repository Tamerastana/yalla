function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/**
 * Overlays saved content on top of the built-in defaults, so that any field
 * added to the site later still has a value even if the saved copy predates it.
 */
export function mergeContent<T>(base: T, over: unknown): T {
  if (over === undefined || over === null) return base
  if (Array.isArray(base)) {
    if (!Array.isArray(over)) return base
    return over.map((item, i) => mergeContent(base[i] ?? base[0], item)) as T
  }
  if (isPlainObject(base)) {
    if (!isPlainObject(over)) return base
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(base)) out[k] = mergeContent(base[k], over[k])
    return out as T
  }
  return typeof over === typeof base ? (over as T) : base
}
