import SourceBuilder from "./sources/SourceBuilder.js"
import Executor from "./Executor.js";
import ExecBuilder from "./ExecBuilder.js";

export default class Builder {
    private _source: SourceBuilder = new SourceBuilder(0, this)

    private _execBuilders: ExecBuilder[] = []

    constructor () {
    }

    withSource (): SourceBuilder {
        return this._source
    }

    single (): ExecBuilder {
        const execBuilder = new ExecBuilder(1, this)
        this._execBuilders.push(execBuilder)
        console.log('Single runner')
        return execBuilder
    }
    concurrency (concurrency: number): ExecBuilder {
        const execBuilder = new ExecBuilder(1, this, concurrency)
        this._execBuilders.push(execBuilder)
        console.log('Concurrency runner: %s', concurrency)
        return execBuilder
    }


    async run (debug: boolean = false): Promise<void> {
        const values = await this._source.run()
        if (!values || values.length == 0) { return }

        const executor = new Executor(values, this._execBuilders)
        await executor.process(debug)
    }
}
