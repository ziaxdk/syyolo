import { assert, expect, test } from 'vitest'
import { handleTemplateValue, stringToMapSource } from './Utils'
import ExecBuilder from './ExecBuilder'
import Builder from './Builder'
import { getFromMap } from './TestUtils'

test('default', async () => {
    const builder = new ExecBuilder(new Builder())
    builder.stop()
    const kv = stringToMapSource('foobar')
    await builder.run(kv)
    expect(getFromMap(kv)).toBe('foobar')
})

test('generateId', async () => {
    const builder = new ExecBuilder(new Builder())
    builder.generateId()
    builder.stop()
    const kv = stringToMapSource('foobar')
    await builder.run(kv)
    expect(getFromMap(kv, 'id')).not.toBeFalsy()
})

test('generateId - length', async () => {
    const builder = new ExecBuilder(new Builder())
    builder.generateId('id', 32)
    builder.stop()
    const kv = stringToMapSource('foobar')
    await builder.run(kv)
    expect(getFromMap(kv, 'id')).not.toBeFalsy()
    expect(getFromMap(kv, 'id')?.length).toBe(32)
})

test('templateProp - overwrite', async () => {
    const builder = new ExecBuilder(new Builder())
    builder.templateProp('__source', 'test', true)
    builder.stop()
    const kv = stringToMapSource('foobar')
    await builder.run(kv)
    expect(getFromMap(kv)).toBe('test')
})


