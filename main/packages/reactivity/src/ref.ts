import { Dep, createDep } from "./dep"
import { activeEffect, track, trackEffects, triggle, triggleEffects } from "./effect"
import { reactive } from "./reactive"
import { isObject, hasChanged } from "@vue/shared"
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
    private _rawValue: T // 原始值
    public dep?: Dep = undefined // 依赖收集
    public readonly __v_isRef = true

    constructor(value: T, public readonly __v_isShallow: boolean) {
        this._rawValue = value
        this._value = __v_isShallow ? value : toReactive(value)
    }

    get value() {
        console.log('get value')
        trackRefValue(this)
        return this._value
    }

    set value(newVal) {
        console.log('set value')
        console.log(hasChanged(this._rawValue, newVal))
        if (hasChanged(this._rawValue, newVal)) {
            this._rawValue = newVal
            this._value = toReactive(newVal)
            triggleRefValue(this)
        }
    }
}

export function trackRefValue(ref) {
    if (activeEffect) {
        trackEffects(ref.dep || (ref.dep = createDep()))
    }
}

export function triggleRefValue(ref) {
    if (ref.dep) {
        triggleEffects(ref.dep)
    }
}

function isRef(r: any): r is Ref {
    return !!(r && r.__v_isRef === true)
}

export const toReactive = <T extends unknown>(value: T): T => {
    return isObject(value) ? reactive(value as object) : value
}