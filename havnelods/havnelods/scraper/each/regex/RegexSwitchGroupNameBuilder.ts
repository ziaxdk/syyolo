import RegexBuilder from "./RegexBuilder.js";
import RegexWhenBuilder from "./RegexWhenBuilder.js";
import Bluebird from "bluebird";
import BaseBuilder from "../../BaseBuilder.js";
import { EachBuilderActions, IEachBuilderAsync, kv } from "../../Types.js";

export default class RegexSwitchGroupNameBuilder extends BaseBuilder<RegexBuilder> implements IEachBuilderAsync {
    private _groupName: string

    private _elseThrowString?: string

    constructor (indent: number, regexBuilder: RegexBuilder, groupName: string) {
        super(indent, regexBuilder)
        if (!groupName) { throw new Error('No groupname') }
        this._groupName = groupName
        this.log("Switch on group name: %s", groupName)
    }

    when (groupNameValue: string): RegexWhenBuilder {
        const regexWhenBuilder = new RegexWhenBuilder(this.indent + 1, this, this._groupName, groupNameValue, false)
        this.addBuilder(regexWhenBuilder)
        return regexWhenBuilder
    }

    default (): RegexWhenBuilder {
        const regexWhenBuilder = new RegexWhenBuilder(this.indent + 1, this, this._groupName, 'ALL', true)
        this.addBuilder(regexWhenBuilder)
        return regexWhenBuilder
    }

    elseThrow (message: string = 'Found no in when(s)'): RegexSwitchGroupNameBuilder {
        if (!message) { throw new Error("No message") }
        this._elseThrowString = message
        return this
    }

    async run (kv: kv): Promise<EachBuilderActions> {
        const result = await Bluebird.reduce(this._eachBuilders, async(a, c) => {
            if (a === EachBuilderActions.notHandled) {
                return await c.run(kv)
            }
            return a
        }, EachBuilderActions.notHandled)

        if (result === EachBuilderActions.handled) {
            return EachBuilderActions.handled
        }

        if (result === EachBuilderActions.skip) {
            return EachBuilderActions.skip
        }
        if (this._elseThrowString) {
            throw new Error(`${this._elseThrowString}: ${this._groupName}`)
        }
        return EachBuilderActions.notHandled
    }
}
