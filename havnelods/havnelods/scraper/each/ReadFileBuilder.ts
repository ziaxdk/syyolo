import { createReadStream, createWriteStream } from 'fs'
import { resolve } from 'node:path'
import { Writable } from "node:stream";
import { EachBuilderActions, IEachBuilderAsync, kv } from "../Types.js";
import BaseBuilder from "../BaseBuilder.js";
import ExecBuilder from "../ExecBuilder.js";


export default class ReadFileBuilder extends BaseBuilder<ExecBuilder> implements IEachBuilderAsync {

    private _keyFilename!: string


    constructor (indent: number, eachBuilder: ExecBuilder) {
        super(indent, eachBuilder)
    }

    saveFile(keyFilename: string): this {
        this._keyFilename = keyFilename
        return this
    }



    async run (kv: kv): Promise<EachBuilderActions> {
        const rs = createReadStream(resolve(kv.get('__source')?.toString()!))
        let ws: Writable = null!
        if (this._keyFilename) {
            const filename = kv.get(this._keyFilename)
            if (!filename) { throw new Error(`No filename key: ${this._keyFilename}`) }
            ws = createWriteStream(filename.toString())
        }

        if (!ws) {
            throw new Error('No writeable stream')
        }

        // this._imageProcessorBuilder.run(kv, rs, ws)
        return await EachBuilderActions.handled
    }
}

