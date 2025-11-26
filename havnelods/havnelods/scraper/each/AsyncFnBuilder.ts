import { EachBuilderActions, IEachBuilderAsync, kv } from "../Types.js";

export type IAsyncFn = (kv: kv) => Promise<EachBuilderActions>

export default class AsyncFnBuilder implements IEachBuilderAsync {
    private _fn: IAsyncFn

    get concurrency(): number {
        return 1
    }

    constructor (fn: IAsyncFn) {
        this._fn = fn
    }


    run (kv: kv): Promise<EachBuilderActions> {
        return this._fn(kv)
    }
}