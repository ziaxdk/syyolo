import { assert, expect, test } from 'vitest'
import SourceBuilder from './SourceBuilder.ts'
import Builder from '../Builder.ts'

test('fromArray', async () => {
    const b = new SourceBuilder(new Builder())
    b.fromArray(['a', 'b', 'c'])
    const res = await b.run()
    expect(res).toContain('a')
    expect(res).toContain('b')
    expect(res).toContain('c')
    expect(res).toHaveLength(3)
})


