import { Readable, Writable } from "node:stream"

export interface IEachBuilderAsync {
    run (kv: kv): Promise<EachBuilderActions>
}



export enum EachBuilderActions {
    skip,
    handled,
    notHandled
}


const some = (all: EachBuilderActions[], value: EachBuilderActions) => all.some(val => val === value)
export const hasSkipped = (all: EachBuilderActions[]) => some(all, EachBuilderActions.skip)
export const hasHandled = (all: EachBuilderActions[]) => some(all, EachBuilderActions.handled)

export interface IStreamBuilder {
    run(kv: kv, rs: Readable): Readable
}

export type kvvalues = string | number | boolean | Date
export type kv = Map<string, kvvalues>
