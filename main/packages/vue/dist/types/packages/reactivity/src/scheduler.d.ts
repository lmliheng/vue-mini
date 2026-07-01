/**
 * @调度系统：懒执行和调度系统
 * @懒执行在effect函数形参option的lazy属性里
 * @调度系统是为了控制执行顺序和规则
 */
export declare function scheduler(): void;
/**
 * @任务队列依次触发job
 */
export declare function flushPreFlushCbs(): void;
