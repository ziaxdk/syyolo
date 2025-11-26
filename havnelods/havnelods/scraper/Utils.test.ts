import { assert, expect, test } from 'vitest'
import { handleTemplateValue } from './Utils'

test('with no template key', () => {
    const kv = new Map<string, string>()
    kv.set('test', 'test')

    const res = handleTemplateValue(kv, 'foobar')
    expect(res).toBe("foobar")
})


test('with template key', () => {
    const kv = new Map<string, string>()
    kv.set('test', 'test')

    const res = handleTemplateValue(kv, 'foobar{test}')
    expect(res).toBe("foobartest")
})

test('with template key not exists', () => {
    const kv = new Map<string, string>()
    kv.set('test', 'test')

    const res = handleTemplateValue(kv, 'foobar{test2}')
    expect(res).toBe("foobarundefined")
})
