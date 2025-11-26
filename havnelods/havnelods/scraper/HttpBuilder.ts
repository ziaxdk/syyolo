import { Readable, Writable } from "stream"
import ExecBuilder from "./ExecBuilder"
import { EachBuilderActions, IEachBuilderAsync, IStreamBuilder, kv } from "./Types"
import HttpCommon from "./common/HttpCommon"
import { StreamBuilder } from "./stream/StreamBuilder"

export default class HttpBuilder extends HttpCommon implements IEachBuilderAsync {
    private _execBuilder: ExecBuilder
    private _streamBuilder?: StreamBuilder

    private _key?: string

    constructor (indent: number, builder: ExecBuilder) {
        super(indent)
        this._execBuilder = builder

    }

    urlFromKey (key: string): this {
        this._key = key
        return this
    }

    stream (): StreamBuilder {
        this._streamBuilder = new StreamBuilder(this.indent + 1, this._execBuilder)
        this.logHttp()
        return this._streamBuilder
    }

    stop (): ExecBuilder {
        return this._execBuilder
    }

    // https://www.npmjs.com/package/readable-web-to-node-stream
    async run (kv: kv): Promise<EachBuilderActions> {
        if (this._key) {
            super.setUrlFromKey(this._key, kv)            
        }
        const _response = await this.invoke(kv)
        if (!_response.body) { throw new Error('No body') }

        // stream
        if (this._streamBuilder) {
            // @ts-expect-error
            const _body = Readable.fromWeb(_response.body)
            await this._streamBuilder.run(kv, _body)
            return EachBuilderActions.handled
        }

        return EachBuilderActions.notHandled
    }

}