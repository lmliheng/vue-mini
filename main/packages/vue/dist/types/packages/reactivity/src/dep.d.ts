import { ReaciveEffect } from "./effect";
export type Dep = Set<ReaciveEffect>;
export declare function createDep(effects?: ReaciveEffect[]): Dep;
