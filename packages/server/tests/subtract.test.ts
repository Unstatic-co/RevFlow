import { test, expect } from '@jest/globals'

function subtract(a: number, b: number) {
    return a - b
}

test('subtract', () => {
    expect(subtract(3, 2)).toBe(1)
})
