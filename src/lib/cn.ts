import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * clsx + tailwind-merge: lets a caller's className override a component's
 * own default utility classes (e.g. bg-*, w-*, hidden/flex) regardless of
 * class order, which plain clsx can't guarantee since Tailwind's generated
 * CSS order — not the order classes appear in the attribute — decides which
 * conflicting utility wins.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
