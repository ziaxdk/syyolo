import RegexSwitchGroupNameBuilder from "./RegexSwitchGroupNameBuilder.js"
import { handleTemplateValue } from '../../Utils.js'
import { EachBuilderActions, IEachBuilderAsync, kv } from "../../Types.js"
import BaseBuilder from "../../BaseBuilder.js"

export default class RegexWhenBuilder extends BaseBuilder<RegexSwitchGroupNameBuilder> implements IEachBuilderAsync {
    private _groupName: string
    private _groupNameValue: string
    private _isDefault: boolean
    private _propName!: string
    private _value!: string

    private _skip: boolean = false

    constructor (indent: number, regexWhenGroupNameIsBuilder: RegexSwitchGroupNameBuilder, groupName: string, groupNameValue: string, isDefault: boolean) {
        super(indent, regexWhenGroupNameIsBuilder)
        if (!groupName) { throw new Error('No groupName') }
        if (!groupNameValue) { throw new Error('No groupNameValue') }
        this._groupName = groupName
        this._groupNameValue = groupNameValue
        this._isDefault = isDefault
        this.log("When value is: %s", groupNameValue)
    }

    set (propName: string, value: string): RegexSwitchGroupNameBuilder {
        if (!propName) { throw new Error('No propName') }
        if (!value) { throw new Error('No value') }
        this._propName = propName
        this._value = value
        this.log("set: '%s' to %s", propName, value)
        return this._builder
    }

    skip (): RegexSwitchGroupNameBuilder {
        this._skip = true
        this.log("skip")
        return this._builder
    }

    private handleSetInKv(kv: kv): EachBuilderActions {
        const value = kv.get(this._groupName)
        if (!value) { throw new Error('value is undefined') }
        if (value === this._groupNameValue || this._isDefault) {
            if (kv.has(this._propName)) { throw new Error('propName already in kv') }
            kv.set(this._propName, handleTemplateValue(kv, this._value))
            return EachBuilderActions.handled
        }
        return EachBuilderActions.notHandled
    }

    run (kv: kv): Promise<EachBuilderActions> {
        if (this._isDefault) {
            if (this._skip) {
                return Promise.resolve(EachBuilderActions.skip)
            }
            return Promise.resolve(this.handleSetInKv(kv))
        }
        if (kv.has(this._groupName)) {
            if (this._skip) {
                return Promise.resolve(EachBuilderActions.skip)
            }
            this.logKv(kv, 'When %s = %s, set \'%s\' %s', this._groupName, this._groupNameValue, this._propName, this._value)
            return Promise.resolve(this.handleSetInKv(kv))
        }
        return Promise.resolve(EachBuilderActions.notHandled)
    }
}