import { nanoid } from "nanoid"
import AsyncFnBuilder, { IAsyncFn } from "./each/AsyncFnBuilder.js"
import { EachBuilderActions, IEachBuilderAsync, kv, kvvalues } from "./Types.js"
import filenamify from "filenamify"
import BaseBuilder from "./BaseBuilder.js"
import Builder from "./Builder.js"
import { handleTemplateValue } from "./Utils.js"
import RegexBuilder from "./each/regex/RegexBuilder.js"
import DownloadBuilder from "./each/DownloadBuilder.js"
import ReadFileBuilder from "./each/ReadFileBuilder.js"
import chalk from "chalk"
import { unlink } from'node:fs/promises'
import HttpBuilder from "./HttpBuilder.js"

export default class ExecBuilder extends BaseBuilder<Builder> implements IEachBuilderAsync {
    private _concurrency: number

    get concurrency (): number  {
        return this._concurrency
    }

    constructor (indent: number, builder: Builder, concurrency: number = 1) {
        super(indent, builder)
        if (concurrency < 1 || concurrency > 4) { throw new Error('concurrency 1-4') }
        this._concurrency = concurrency
    }

    private generateFnForAsync(key: string, logName: string, valueSetFn: (kv: kv, propValue: kvvalues) => Promise<kvvalues | void>): IAsyncFn {
        return async (kv: kv): Promise<EachBuilderActions> => {
            const propValue = kv.get(key)
            const propValue2 = await valueSetFn(kv, propValue!)
            if (!propValue2) {
                Promise.resolve(EachBuilderActions.handled)                
            }
            kv.set(key, propValue2 as kvvalues)
            this.logKv(kv, '%s: %s -> %s', logName, propValue || '-', propValue2)
            // console.log(chalk.yellow('ExecB: %s: %s -> %s'), logName, propValue || '-', propValue2)
            return Promise.resolve(EachBuilderActions.handled)
        }
    }

    generateId (key: string = "id", size: number = 16): this {
        this.addBuilder(new AsyncFnBuilder(this.generateFnForAsync(key, 'generateId', () => Promise.resolve(nanoid(size)))))
        return this
    }
    
    templateProp (key: string, template: string): this {
        this.addBuilder(new AsyncFnBuilder(this.generateFnForAsync(key, 'templateProp', (kv) => Promise.resolve(handleTemplateValue(kv, template)))))
        this.log('templateProp: \'%s\' = %s', key, template)
        return this
    }

    filenamify (key: string): this {
        this.addBuilder(new AsyncFnBuilder(this.generateFnForAsync(key, 'filenamify', (_, propValue) => Promise.resolve(filenamify(propValue.toString()) ))))
        this.log('filenamify: \'%s\'', key)
        return this
    }
    
    deleteFile (key: string): this {
        this.addBuilder(new AsyncFnBuilder(this.generateFnForAsync(key, 'deleteFile', (_, propValue) => unlink(propValue.toString()) )))
        return this
    }

    modifyProp (key: string, fn: (value: kvvalues) => Promise<kvvalues>): this {
        this.addBuilder(new AsyncFnBuilder(this.generateFnForAsync(key, 'modifyProp', (_, propValue) => fn(propValue!) )))
        this.log('modifyProp: \'%s\' %s', key, fn)
        return this
    }

    replace (key: string, search: string, replace: string = ''): this {
        this.addBuilder(new AsyncFnBuilder(this.generateFnForAsync(key, 'replace', (_, propValue) => Promise.resolve(propValue.toString().replaceAll(search, replace)) )))
        this.log('replace: \'%s\' %s = %s', key, search, replace)
        return this
    }

    startRegex (regex: string | RegExp, key: string = '__source'): RegexBuilder {
        const regexBuilder = new RegexBuilder(this.indent, this, regex, key)
        this.addBuilder(regexBuilder)
        return regexBuilder
    }

    download (key: string = '__source'): DownloadBuilder {
        const downloadBuilder = new DownloadBuilder(this.indent,this, key)
        this.addBuilder(downloadBuilder)
        return downloadBuilder
    }

    http (): HttpBuilder {
        const httpBuilder = new HttpBuilder(this.indent, this)
        this.addBuilder(httpBuilder)
        return httpBuilder
    }

    readFile (): ReadFileBuilder {
        const readFileBuilder = new ReadFileBuilder(this.indent, this)
        this.addBuilder(readFileBuilder)
        return readFileBuilder
    }

    async run (kv: kv): Promise<EachBuilderActions> {
        const action = await this.reduceSeriesEachBuilders(kv)
        this.__debug(kv)
        return action
    }
}