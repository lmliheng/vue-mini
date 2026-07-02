import { ReactiveEffect } from "./effect";
export type Dep = Set<ReactiveEffect>;
export declare function createDep(effects?: ReactiveEffect[]): Dep;
