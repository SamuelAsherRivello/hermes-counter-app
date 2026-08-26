'use client'

import { useEffect, useMemo, useState } from 'react'
import { CounterController } from '../src/counter-controller'
import { SupabaseCounterBackend } from '../src/supabase-counter-backend'
import { supabase } from '../src/supabase'

export default function CounterPage() {
  const controller = useMemo(
    () => new CounterController(new SupabaseCounterBackend(supabase)),
    [],
  )
  const [value, setValue] = useState<number | null>(null)
  const [busy, setBusy] = useState(true)
  const [status, setStatus] = useState('Connecting…')

  useEffect(() => {
    controller.load()
      .then((persistedValue) => {
        setValue(persistedValue)
        setStatus('Synced across devices')
      })
      .catch((error: Error) => setStatus(error.message))
      .finally(() => setBusy(false))

    const channel = supabase
      .channel('shared-counter')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'counter_state', filter: 'id=eq.1' },
        (payload) => {
          setValue(Number(payload.new.value))
          setStatus('Live sync connected')
        },
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [controller])

  async function run(action: () => Promise<number>) {
    setBusy(true)
    setStatus('Saving…')
    try {
      setValue(await action())
      setStatus('Synced across devices')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="counter-card" aria-labelledby="title">
      <p className="eyebrow">LIVE DATABASE DEMO</p>
      <h1 id="title">Shared Counter</h1>
      <p className="subtitle">Every device sees the same value.</p>

      <output className="counter" aria-live="polite">
        {value ?? '—'}
      </output>

      <div className="controls" aria-label="Counter controls">
        <button
          className="round-button"
          type="button"
          aria-label="Decrease counter"
          disabled={busy}
          onClick={() => run(() => controller.decrement())}
        >
          −
        </button>
        <button
          className="round-button primary"
          type="button"
          aria-label="Increase counter"
          disabled={busy}
          onClick={() => run(() => controller.increment())}
        >
          +
        </button>
      </div>

      <button
        className="reset-button"
        type="button"
        disabled={busy}
        onClick={() => run(() => controller.reset())}
      >
        Reset database
      </button>
      <p className="status" role="status">{status}</p>
    </main>
  )
}
