function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
    if (!isObject(target)) { // isObject
        {
            warn$2( // warn$2
                `value cannot be made ${isReadonly2 ? "readonly" : "reactive"}: ${String(
                    target
                )}`
            );
        }
        return target;
    }
    // 已经是reactive对象
    if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
        return target;
    }
    // 如果有__v_skip字段或者 target不能添加属性
    if (target["__v_skip"] || !Object.isExtensible(target)) {
        return target;
    }

    // 从proxyMap中获取到target的值

    const existingProxy = proxyMap.get(target);
    if (existingProxy) {
        return existingProxy;
    }

    //判断target的类型
    const targetType = targetTypeMap(toRawType(target));

    if (targetType === 0 /* INVALID */) {
        return target;
    }
    // 创建代理
    const proxy = new Proxy(
        target,
        // collectionHandlers 和 baseHandlers
        targetType === 2 /* COLLECTION */ ? collectionHandlers : baseHandlers
    );
    proxyMap.set(target, proxy);
    return proxy;
}