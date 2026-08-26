import type { CounterBackend } from './counter-controller'

type QueryResult<T> = PromiseLike<{ data: T | null; error: Error | null }>

type SupabaseLike = {
  from(table: string): {
    select(columns: string): {
      eq(column: string, value: number): {
        single(): QueryResult<{ value: number }>
      }
    }
  }
  rpc(name: string, args?: { amount: 1 | -1 }): QueryResult<number>
}

function valueOrThrow<T>(result: { data: T | null; error: Error | null }): T {
  if (result.error) throw result.error
  if (result.data === null) throw new Error('Database returned no counter value')
  return result.data
}

export class SupabaseCounterBackend implements CounterBackend {
  private readonly client: SupabaseLike

  constructor(client: unknown) {
    this.client = client as SupabaseLike
  }

  async load() {
    const result = await this.client
      .from('counter_state')
      .select('value')
      .eq('id', 1)
      .single()

    return valueOrThrow(result).value
  }

  async change(delta: 1 | -1) {
    return valueOrThrow(await this.client.rpc('increment_counter', { amount: delta }))
  }

  async reset() {
    return valueOrThrow(await this.client.rpc('reset_counter'))
  }
}
