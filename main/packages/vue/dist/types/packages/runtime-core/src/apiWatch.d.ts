export interface WatchOptions {
    immediate?: boolean;
    deep?: boolean;
}
/**
 * @watch入口函数
 * @param source
 * @param cb
 * @param options
 */
export declare function watch(source: any, cb: Function, options: WatchOptions): void;
/**
 * @SchedulerJob
 *
 */
export declare function job(): void;
