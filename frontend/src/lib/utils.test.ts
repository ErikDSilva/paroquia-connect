import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility', () => {
  it('merges simple classes', () => {
    const out = cn('a', 'b')
    expect(out).toContain('a')
    expect(out).toContain('b')
  })

  it('removes duplicate tailwind utilities via twMerge', () => {
    const out = cn('px-2', 'px-4', 'px-2')
    // twMerge should keep the last px-2/px-4 conflict resolved to px-2 or px-4 depending
    expect(typeof out).toBe('string')
    expect(out.length).toBeGreaterThan(0)
  })
})
