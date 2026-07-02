import { EMPTY_OBJ, hasChanged } from "@vue/shared"
import { isReactive } from "packages/reactivity/src/reactive"
import { quenePreFlushCb } from "./scheduler"
import { ReactiveEffect } from "packages/reactivity/src/effect"

export interface WatchOptions {
    immediate?: boolean,
    deep?: boolean
}
/**
 * @watch入口函数
 * @param source 
 * @param cb 
 * @param options 
 */
export function watch(source, cb: Function, options: WatchOptions) {
    doWatch(source, cb, options)
}

/**
 * @Watch的实现
 * @param source 
 * @param cb 
 * @param param2 
 */
function doWatch(source, cb: Function, { immediate, deep }: WatchOptions = EMPTY_OBJ) {
    let getter: () => any

    // ref还没实现
    if (isReactive(source)) {
        getter = () => source
        deep = true// 是Reactive对象..deep变成true
    } else {
        getter = () => { }
    }

    if (cb && deep) {
        // getter浅拷贝....  
        const baseGetter = getter
        getter = () => baseGetter()
    }

    let oldValue = {}
    
    // job
    const job = () => {
        if (cb) {
            const newValue = effect.run()
            // deep 为什么要加入或
            if (deep || hasChanged(newValue, oldValue)) {
                // 触发回调
                cb(newValue, oldValue)
                oldValue = newValue
            }
        }

    }

    let scheduler = () => quenePreFlushCb(job)

    const effect = new ReactiveEffect(getter, scheduler)

    if (cb) {

        if (immediate) {
            job()
        } else {
            oldValue = effect.run()
        }

    } else {
        // 没有回调...
        effect.run()
    }

    return () => {
        effect.stop()
    }


}

/**
 * @SchedulerJob
 * 
 */
export function job() {

}