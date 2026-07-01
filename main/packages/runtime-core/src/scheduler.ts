let isFlushPending = false
const pendingPreFlushCbs: Function[] = []
const resolvedPromise = Promise.resolve() as Promise<any>
let currentFlushPromise: Promise<void> | null = null

/**
 * @调度系统：懒执行和调度系统
 * @懒执行在effect函数形参option的lazy属性里
 * @调度系统是为了控制执行顺序和规则
 */
export function scheduler() {

}

/**
 * @调度系统规则
 */
export function quenePreFlushCb(cb: Function) {
    queneCb(cb, pendingPreFlushCbs)
}

/**
 * 
 * @param cb 
 * @param pendingQuene 
 */
function queneCb(cb: Function, pendingQuene: Function[]) {
    pendingQuene.push(cb)
    queneFlush()
}

/**
 * @依次执行队列中的callback函数
 */
function queneFlush() {
    if (!isFlushPending) {
        isFlushPending = true
        // 把任务放到微任务里，以改变执行规则
        currentFlushPromise = resolvedPromise.then(flushJobs)
    }
}

/**
 * 
 */
function flushJobs() {
    isFlushPending = false
    flushPreFlushCbs()
}


/**
 * @任务队列依次触发job
 * @param cb 
 */
export function flushPreFlushCbs() {
    if (pendingPreFlushCbs.length) {
        let activePreFlushCbs = [...new Set(pendingPreFlushCbs)]
        // let activePreFlushCbs = pendingPreFlushCbs.slice()
        // Set在对函数进行去重比较时，可能会改变数组的内部状态，导致某些元素变成 undefined
        pendingPreFlushCbs.length = 0
        for (let i = 0; i < activePreFlushCbs.length; i++) {
            // 类型收窄
            const cb = activePreFlushCbs[i]
            if (typeof cb === 'function') {
                cb()
            }
        }
    }

}


/**
 * @nextTick
 */
export function nextTick() {

}