import { describe, expect, it, vi } from 'vitest'
import { SupabaseCounterBackend } from '../src/supabase-counter-backend'

describe('SupabaseCounterBackend', () => {
  it('loads the singleton counter row', async () => {
    const single = vi.fn().mockResolvedValue({ data: { value: 7 }, error: null })
    const eq = vi.fn().mockReturnValue({ single })
    const select = vi.fn().mockReturnValue({ eq })
    const from = vi.fn().mockReturnValue({ select })
    const rpc = vi.fn()
    const backend = new SupabaseCounterBackend({ from, rpc })

    await expect(backend.load()).resolves.toBe(7)
    expect(from).toHaveBeenCalledWith('counter_state')
    expect(eq).toHaveBeenCalledWith('id', 1)
  })

  it('changes the value through the atomic RPC', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: 3, error: null })
    const backend = new SupabaseCounterBackend({ from: vi.fn(), rpc })

    await expect(backend.change(1)).resolves.toBe(3)
    expect(rpc).toHaveBeenCalledWith('increment_counter', { amount: 1 })
  })

  it('resets through the database RPC', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: 0, error: null })
    const backend = new SupabaseCounterBackend({ from: vi.fn(), rpc })

    await expect(backend.reset()).resolves.toBe(0)
    expect(rpc).toHaveBeenCalledWith('reset_counter')
  })

  it('surfaces database errors', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: new Error('offline') })
    const backend = new SupabaseCounterBackend({ from: vi.fn(), rpc })

    await expect(backend.change(-1)).rejects.toThrow('offline')
  })
})
