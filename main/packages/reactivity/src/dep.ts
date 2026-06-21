import { ReaciveEffect } from "./effect";

export type Dep = Set<ReaciveEffect>

export function createDep(effects?: ReaciveEffect[]): Dep { // 
    const dep = new Set<ReaciveEffect>(effects)
    return dep
}
