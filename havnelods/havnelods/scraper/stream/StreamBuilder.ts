import { Readable, Writable } from "stream"
import { IStreamBuilder, kv, kvvalues } from "../Types"
import { createWriteStream } from "fs"
import ImageStreamBuilder from "./ImageStreamBuilder"
import chalk from "chalk"
import ExecBuilder from "../ExecBuilder"

export class StreamBuilder {
    protected _builder: ExecBuilder
    protected _debugKeys?: string[]
    protected _eachBuilders: IStreamBuilder[] = []

    private _filenameFn!: (kv: kv) => kvvalues | undefined
    private _keyContent?: string
    private _indent: number

    constructor (indent: number, builder: ExecBuilder) {
        this._builder = builder
        this._indent = indent
    }

    image (): ImageStreamBuilder {
        const imageStreamBuilder = new ImageStreamBuilder(this._indent, this)
        this._eachBuilders.push(imageStreamBuilder)
        return imageStreamBuilder
    }

    toFileFromKey (key: string): ExecBuilder {
        this._filenameFn = (kv: kv) => kv.get(key)
        return this._builder
    }

    toFile (filename: string): ExecBuilder {
        this._filenameFn = () => filename
        return this._builder
    }
    toKey (key: string): ExecBuilder {
        this._keyContent = key
        return this._builder
    }

    async run(kv: kv, rs: Readable): Promise<void> {
        let _ws: Writable
        let _content: string = ''
        if (this._keyContent) {
            _ws = new StringWritableStream((chunk) => _content += chunk)
        }
        else {
            const _filename = this._filenameFn(kv)
            if (!_filename) { throw new Error('No filename') }
            _ws = createWriteStream(_filename.toString())
        }
        const allRes = this._eachBuilders.reduce((a, c) => c.run(kv, a), rs)

        await new Promise((resolve, reject) => {
            allRes.pipe(_ws).on('finish', resolve).on('error', reject)
        })
        if (this._keyContent) {
            if (kv.has(this._keyContent)) { throw new Error(`Key: ${this._keyContent} already exists`) }
            kv.set(this._keyContent, _content)
        }
    }
}

class StringWritableStream extends Writable {
    private _fn: (chunk: string) => void

    constructor (fn: (chunk: string) => void) {
        super()
        this._fn = fn
    }

    _write (chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
        const _chunk = chunk.toString()
        this._fn(_chunk)
        callback()
    }

    _final (callback: (error?: Error | null) => void): void {
        callback()
    }

    _destroy (error: Error | null, callback: (error?: Error | null) => void): void {
        callback()
    }
}