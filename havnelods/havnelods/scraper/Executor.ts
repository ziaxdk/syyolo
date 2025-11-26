import PQueue from "p-queue"
import chalk from "chalk"
import ExecBuilder from "./ExecBuilder.js"
import { EachBuilderActions, kv } from "./Types.js"
import { stringToMapSource } from "./Utils.js"

export default class Executor {
    private _values: string[]
    private _maps!: Map<string, string>[]
    private _execBuilders: ExecBuilder[]

    constructor (values: string[], eachBuilders: ExecBuilder[]) {
        this._values = values
        this._execBuilders = eachBuilders
    }

    async process (debug: boolean) {
        // Convert to maps from strings
        // this._maps = this._values.map(value => stringToMapSource(value))
        this._maps = this._values.map((value, idx) => stringToMapSource(value, idx))

        // console.log(chalk.green("Execu: Values: %s "), this._values.length)

        for await (const execBuilder of this._execBuilders) {
            // console.log(chalk.green("Execu: Concurrency: %s on %s builder(s)"), execBuilder.concurrency, execBuilder.eachBuilders.length)
            const fnPromises = this._maps.filter(kv => this.hasSkip(kv)).map(kv => () => execBuilder.run(kv))
            const queue = new PQueue({ concurrency: execBuilder.concurrency })
            const allResults = await queue.addAll(fnPromises)
            allResults.forEach((result, idx) => {
                if (result == EachBuilderActions.skip) {
                   this.setSkip(this._maps[idx])
                    // console.log(chalk.green("Execu: Skip: %s "), this._maps[idx].get('__source'))
                }
            })
            // console.log(chalk.green('*: --------------------------------'))
        }
      
        if (debug) {
            // console.log(chalk.cyan('%s') ,this._maps)
            console.log(this._maps)
        }
    }

    private hasSkip (kv: kv): boolean {
        return !kv.get('__skip')
    }
    private setSkip (kv: kv): void {
        kv.set('__skip', '1')
    }
}

