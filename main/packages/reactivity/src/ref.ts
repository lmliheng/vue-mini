import { Dep } from "./dep"
import { reactive } from "./reactive"
import { isObject } from "@vue/shared"
export interface Ref<T = any> {
    value: T
}

export function ref(value: unknown) {
    return createRef(value, false)

}

function createRef(rawValue: unknown, shallow: boolean) {
    if (isRef(rawValue)) { return rawValue }
    return new RefImpl(rawValue, shallow)

}

class RefImpl<T> {
    private _value: T
    public dep?: Dep = undefined
    public readonly __v_isRef = true

    constructor(value: T, public readonly __v_isShallow: boolean) {
        this._value = __v_isShallow ? value : toReactive(value)
    }

    get value() {

    }

    set value(){
        
    }
}

function isRef(r: any): r is Ref {
    return !!(r && r.__v_isRef === true)
}

export const toReactive = <T extends unknown>(value: T): T => {
    return isObject(value) ? reactive(value as object) : value
}