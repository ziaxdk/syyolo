// import fetch from 'node-fetch'
// import { type Response } from 'node-fetch'
import { EachBuilderActions, IEachBuilderAsync, IStreamBuilder, kv } from "../Types"

export default class HttpCommon {
    private _url: string = ""
    private _method: string = "get"
    private _payload!: Record<string, string | number | boolean>
    private _headers: Map<string, string> = new Map<string, string>()
    private _indent: number
    protected get indent () {
        return this._indent
    }

    constructor (indent: number) {
        this._indent = indent
    }
 
    url (url: string): this {
        this._url = url
        return this
    }
    
    get (): this {
        this._method = 'get'
        return this
    }

    post (): this {
        this._method = 'post'
        return this
    }

    body (payload: Record<string, string | number | boolean>): this {
        this._payload = payload
        return this

    }

    header (name: string, value: string): this {
        if (this._headers.has(name)) {
            throw new Error("Header already added")
        }
        this._headers.set(name, value)
        return this
    }

    protected async invoke (kv: kv): Promise<Response> {
        this.logKv(kv, '%s %s', this._method.toUpperCase(), this._url)
        const _response = await fetch(this._url, {
            method: this._method.toLowerCase(),
            body: JSON.stringify(this._payload),
            headers: Object.fromEntries(this._headers)
        })
        if (!_response.ok) {
            throw new Error("Response not ok")
        }
        return _response
    }

    protected setUrlFromKey(key: string, kv: kv): void {
        const url = kv.get(key)
        if (!url) { throw new Error('Found no url on key') }
        this._url = url.toString()
    }

    protected logHttp () {
        this.log('HTTP: %s %s', this._method.toUpperCase(), this._url)
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