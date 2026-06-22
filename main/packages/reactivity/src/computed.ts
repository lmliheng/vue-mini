import { isFunction } from "@vue/shared"
import { Dep } from "./dep"
import { ReaciveEffect, track } from "./effect"
import { trackRefValue, trigglerRefValue } from "./ref"

export class ComputedRefImpl<T> {
    public dep?: Dep = undefined
    private _value!: T
    public readonly effect: ReaciveEffect<T>
    public readonly __v_isRef = true
    public _dirty = true

    constructor(getter) {
        this.effect = new ReaciveEffect(getter, () => {
            if (!this._dirty) {
                this._dirty = true
                trigglerRefValue(this) // 依赖触发写在这...
            }
        })
        this.effect.computed = this // 给一个computed属性，要在ReactiveEffect里注明?
    }

    get value() {
        trackRefValue(this)
        if (this._dirty) {
            this._dirty = false
            this._value = this.effect.run()
        }
        return this._value
    }
}

export function computed(getterOrOptions) {
    let getter
    const onlyGetter = isFunction(getterOrOptions)
    if (onlyGetter) {
        getter = getterOrOptions
    }
    const cRef = new ComputedRefImpl(getter)
    return cRef
}