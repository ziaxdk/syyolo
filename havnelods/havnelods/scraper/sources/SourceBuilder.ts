import BaseBuilder from "../BaseBuilder.js"
import Builder from "../Builder.js"
import HttpSourceBuilder from "./HttpSourceBuilder.js"

export default class SourceBuilder extends BaseBuilder<Builder> {

    private _values: string[] = []

    private _sourceBuilder?: ISourceBuilder

    /**
     * Get inputs from an array
     * @param values Array to input
     * @returns values to process
     */
    fromArray (values: string[]) {
        if (!values || values.length == 0) { throw new Error('No values fromArray') }
        this.log('fromArray %s values added', values.length)
        this._values = [ ...this._values, ...values ]
        return this
    }

    http (): HttpSourceBuilder {
        const builder = new HttpSourceBuilder(this)
        this._sourceBuilder = builder
        return builder
    }

    async run (): Promise<string[]> {
        if (this._sourceBuilder) {
            this._values = await this._sourceBuilder.run()
        }
        this.log('%s values to process', this._values.length)
        return this._values
    }
}

export interface ISourceBuilder {
    run (): Promise<string[]>
}