import { Readable } from "stream";
import { IStreamBuilder, kv } from "../Types";
import sharp from "sharp";
import { StreamBuilder } from "./StreamBuilder";
import chalk from "chalk";

type fnType = (sharp: sharp.Sharp) => void

export default class ImageStreamBuilder implements IStreamBuilder {
    private _streamBuilder: StreamBuilder

    private _fnString: string[] = []
    private _fns: fnType[] = []

    private _indent: number

    constructor (indent: number, streamBuilder: StreamBuilder) {
        // super(eachBuilder)
        this._streamBuilder = streamBuilder
        this._indent = indent
    }

    // https://www.npmjs.com/package/sharp
    // https://sharp.pixelplumbing.com/api-constructor/

    resize (w?: number, h?: number): this {
        this._fnString.push('resize')
        this._fns.push(s => s.resize(w, h))
        this.log("Resize: w(%s), h(%s)", w, h)
        return this
    }

    greyscale (): this {
        this._fnString.push('greyscale')
        this._fns.push(s => s.greyscale())
        this.log("Greyscale")
        return this
    }

    stop (): StreamBuilder {
        return this._streamBuilder
    }
 
 
    run (kv: kv, rs: Readable): Readable {
        this.logKv(kv, "Image: [%s]", this._fnString.join(','))
        const _sharp = sharp()
        this._fns.forEach((fn) => fn(_sharp))
        return rs.pipe(_sharp)
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