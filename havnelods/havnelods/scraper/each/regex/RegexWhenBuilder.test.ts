import { assert, expect, test } from 'vitest'
import RegexWhenBuilder from './RegexWhenBuilder.ts'
import RegexWhenGroupNameIsBuilder from './RegexSwitchGroupNameBuilder.ts'

test('set constant', () => {
    const kv = new Map<string, string>()
    kv.set('groupName', 'groupNameValue')

    const c = new RegexWhenBuilder({} as RegexWhenGroupNameIsBuilder, "groupName", "groupNameValue", false)
    c.set('new', 'new')
    c.run(kv)

    expect(kv.has('groupName')).toBe(true)
    expect(kv.has('new')).toBe(true)
})

test('set template', () => {
    const kv = new Map<string, string>()
    kv.set('groupName', 'groupNameValue')

    const c = new RegexWhenBuilder({} as RegexWhenGroupNameIsBuilder, "groupName", "groupNameValue", false)
    c.set('new', 'new_{groupName}_new')
    c.run(kv)

    expect(kv.has('groupName')).toBe(true)
    expect(kv.has('new')).toBe(true)
    expect(kv.get('new')).toBe('new_groupNameValue_new')
})

// test('skip', () => {
//     const kv = new Map<string, string>()
//     kv.set('groupName', 'groupNameValue')

//     const c = new RegexWhenBuilder({} as RegexWhenGroupNameIsBuilder, "groupName", "groupNameValue")
//     c.skip()
//     c.run(kv)

//     expect(kv.has('groupName')).toBe(false)
// })
