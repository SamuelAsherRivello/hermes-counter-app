export interface CounterBackend {
  load(): Promise<number>
  change(delta: 1 | -1): Promise<number>
  reset(): Promise<number>
}

export class CounterController {
  constructor(private readonly backend: CounterBackend) {}

  load() {
    return this.backend.load()
  }

  increment() {
    return this.backend.change(1)
  }

  decrement() {
    return this.backend.change(-1)
  }

  reset() {
    return this.backend.reset()
  }
}
