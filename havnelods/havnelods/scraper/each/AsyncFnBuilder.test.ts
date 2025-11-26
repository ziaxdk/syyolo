import { assert, expect, test } from 'vitest'
import { handleTemplateValue, stringToMapSource } from '../Utils'
import ExecBuilder from '../ExecBuilder'
import Builder from '../Builder'
import { getFromMap } from '../TestUtils'
import AsyncFnBuilder, { IAsyncFn } from './AsyncFnBuilder'
import { EachBuilderActions } from '../Types'

test('handled', async () => {
    const fn: IAsyncFn = (kv) => Promise.resolve(EachBuilderActions.handled)
    const builder = new AsyncFnBuilder(fn)
    const kv = stringToMapSource('foobar')
    const res = await builder.run(kv)
    expect(res).toBe(EachBuilderActions.handled)
    // expect(getFromMap(kv)).toBe('foobar')
})

test('set prop', async () => {
    const fn: IAsyncFn = (kv) => {
        kv.set('fn', 'fn')
        return Promise.resolve(EachBuilderActions.handled)
    }
    const builder = new AsyncFnBuilder(fn)
    const kv = stringToMapSource('foobar')
    const res = await builder.run(kv)
    expect(res).toBe(EachBuilderActions.handled)
    expect(getFromMap(kv, 'fn')).toBe('fn')
})
