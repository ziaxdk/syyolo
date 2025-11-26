import { kv } from "./Types.js"

/**
 * Template a string with {} syntax from kv
 * @param kv Keys and values
 * @param value Value to do templating
 * @returns Templated string
 */
export const handleTemplateValue = (kv: kv, value: string): string => {
    const allStarts = [ ...value.matchAll(/{/g) ]
    const allEnds = [ ...value.matchAll(/}/g) ]
    if (allStarts.length != allEnds.length) { throw new Error('Something wrong with value') }
    const templateKeys = allStarts.map((v, i) => value.substring(v.index, allEnds[i].index + 1))
    const keys = templateKeys.map(key => key.slice(1, -1))
    keys.map((key, i) => value = value.replace(templateKeys[i], kv.get(key)?.toString()!))
    return value
}

export const stringToMapSource = (value: string, idx: number): Map<string, string> => {
    const m = new Map<string, string>()
    m.set('__source', value)
    m.set('__index', idx.toString())
    return m
}
