import Bluebird from "bluebird"
import { EachBuilderActions, IEachBuilderAsync, kv, kvvalues } from "./Types.js"
import chalk from "chalk"

export default abstract class BaseBuilder<T> {
    protected _builder: T
    protected _debugKeys?: string[]
    protected _eachBuilders: IEachBuilderAsync[] = []
    private _indent: number
    protected get indent() {
        return this._indent
    }

    public get eachBuilders () {
        return this._eachBuilders;
    }

    constructor(indent: number, builder: T) {
        this._indent = indent
        this._builder = builder
    }

    protected addBuilder (builder: IEachBuilderAsync): void {
        this._eachBuilders.push(builder)
    }

    protected mapSeriesEachBuilders (kv: kv): Promise<EachBuilderActions[]> {
        return Bluebird.mapSeries(this._eachBuilders, async eachBuilder => {
            const _res = await eachBuilder.run(kv)
            // console.log(chalk.blue('M: %s: %s'), eachBuilder.constructor.name, _res);
            return _res
        })
    }

    protected async reduceSeriesEachBuilders (kv: kv): Promise<EachBuilderActions> {
        const res = await Bluebird.reduce(this._eachBuilders, async (a, c) => {
            if (a === EachBuilderActions.skip) { return a }
            const _res = await c.run(kv)
            // const __idx = kv.get('__index')?.toString()
            // console.log(chalk.blue('%s: %s: %s'), __idx?.padStart(4, '0'), c.constructor.name, EachBuilderActions[_res]);
            return _res
        }, EachBuilderActions.notHandled)
        return res
    }

    protected __debug (kv: kv): void {
        if (this._debugKeys) {
            if (this._debugKeys.length == 0) {
                return console.log(kv)
            }
            const newMap = new Map<string, kvvalues>()
            this._debugKeys.map(key => newMap.set(key, kv.get(key)!))
            return console.log(newMap)
        }
    }

    debug (keys: string[] = []): this {
        this._debugKeys = keys
        return this
    }
    stop (): T {
        return this._builder
    }

    protected log (message: string, ...optionalParams: any[]): void {
        const spaces = [...Array(this._indent * 4).keys()].map(_ => ' ').join('')
        console.log(spaces + message, ...optionalParams)
    }

    protected logKv (kv: kv, message: string, ...optionalParams: any[]): void {
        const spaces = [...Array(this._indent * 4).keys()].map(_ => ' ').join('')
        const lineNo = Number(kv.get('__index'))
        console.log(spaces + (lineNo + 1).toString().padStart(4, '0') + ': ' + message, ...optionalParams)
    }
}