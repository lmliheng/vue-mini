function reactive(target) {
    if (/* @__PURE__ */ isReadonly(target)) {
        return target;
    }
    return createReactiveObject(
        target,
        false,
        mutableHandlers, //
        mutableCollectionHandlers, //
        reactiveMap  // 
    );
}