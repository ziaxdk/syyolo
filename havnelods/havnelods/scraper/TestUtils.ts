import { EachBuilderActions, IEachBuilderAsync, kv, kvvalues } from "./Types";

export default class DummyBuilder implements IEachBuilderAsync {

    get concurrency(): number {
        return 1
    }

    run(kv: kv): Promise<EachBuilderActions> {
        return new Promise((res) => setTimeout(() => {
            console.log('resolve %s', kv.get('__source'))
            res(EachBuilderActions.handled)
        }, 1000))

    }
}

export const getFromMap = (kv: kv, key: string = '__source'): kvvalues | undefined => {
    return kv.get(key)
}