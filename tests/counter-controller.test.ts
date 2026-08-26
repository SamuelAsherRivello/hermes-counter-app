import { describe, expect, it } from 'vitest'
import { CounterController, type CounterBackend } from '../src/counter-controller'

class FakeBackend implements CounterBackend {
  value = 0

  async load() {
    return this.value
  }

  async change(delta: 1 | -1) {
    this.value += delta
    return this.value
  }

  async reset() {
    this.value = 0
    return this.value
  }
}

describe('CounterController', () => {
  it('loads the persisted value', async () => {
    const backend = new FakeBackend()
    backend.value = 12
    const controller = new CounterController(backend)

    await expect(controller.load()).resolves.toBe(12)
  })

  it('increments atomically through the backend', async () => {
    const controller = new CounterController(new FakeBackend())

    await expect(controller.increment()).resolves.toBe(1)
  })

  it('decrements atomically through the backend', async () => {
    const controller = new CounterController(new FakeBackend())

    await expect(controller.decrement()).resolves.toBe(-1)
  })

  it('resets the persisted value', async () => {
    const backend = new FakeBackend()
    backend.value = 9
    const controller = new CounterController(backend)

    await expect(controller.reset()).resolves.toBe(0)
  })
})
