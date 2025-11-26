import chalk from "chalk";
import BaseBuilder from "../../BaseBuilder.js";
import ExecBuilder from "../../ExecBuilder.js";
import { EachBuilderActions, kv, IEachBuilderAsync } from "../../Types.js";
import RegexSwitchGroupNameBuilder from "./RegexSwitchGroupNameBuilder.js";

export default class RegexBuilder extends BaseBuilder<ExecBuilder>  implements IEachBuilderAsync {
    private _regex: string | RegExp
    private _key: string

    constructor (indent: number, eachBuilder: ExecBuilder, regex: string | RegExp, key: string) {
        super(indent, eachBuilder)
        if (!regex) { throw new Error('no regex') }
        this._regex = regex
        this._key = key
        this.log("Regex: %s", this._regex)
    }

    switchGroupName (groupName: string): RegexSwitchGroupNameBuilder {
        const regexSwitchGroupNameBuilder = new RegexSwitchGroupNameBuilder(this.indent + 1, this, groupName)
        this.addBuilder(regexSwitchGroupNameBuilder)
        return regexSwitchGroupNameBuilder
    }

    async run (kv: kv): Promise<EachBuilderActions> {
        // console.log(kv, this._regex, this._key)
        this.__debug(kv)
        const value = kv.get(this._key)
        if (!value) { throw new Error('Cant get value') }
        const groups = value.toString().match(this._regex)?.groups
        this.logKv(kv, "Regex: Found %s group(s)", groups?.length ?? '-')
        if (!groups) {
            throw new Error('No groups on ' + this._regex)
        }
        Object.keys(groups).map(key => kv.set(key, groups[key]))
        return await this.reduceSeriesEachBuilders(kv)
    }
}

