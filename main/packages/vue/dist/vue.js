var Vue = (function (exports) {
    'use strict';

    const targetMap = new WeakMap();
    function track(target, key) {
        console.log('track: 依赖收集');
        if (!activeEffect) {
            return;
        }
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()));
        }
        depsMap.set(key, activeEffect); // keyToDepMap
        console.log(targetMap);
    }
    function triggle(target, key, value) {
        console.log('triggle: 依赖触发');
        const depsMap = targetMap.get(target);
        if (!depsMap) {
            return;
        }
        const effect = depsMap.get(key); // 拿到依赖
        if (!effect) {
            return;
        }
        effect.run();
    }
    function effect(fn) {
        const _effect = new ReaciveEffect(fn);
        _effect.run();
    }
    // 收集getter行为函数
    let activeEffect;
    class ReaciveEffect {
        fn;
        constructor(fn) {
            this.fn = fn;
        }
        run() {
            activeEffect = this;
            return this.fn();
        }
    }

    const get = createGetter();
    const set = createSetter();
    const mutableHandlers = {
        get,
        set
    };
    function createGetter() {
        return function get(target, key, receiver) {
            // 收集触发getter的函数
            const res = Reflect.get(target, key, receiver);
            track(target, key);
            return res;
        };
    }
    function createSetter() {
        return function set(target, key, value, receiver) {
            const res = Reflect.set(target, key, value, receiver);
            triggle(target, key);
            return res;
        };
    }

    const reactiveMap = new WeakMap();
    function reactive(target) {
        return createReactiveObject(target, mutableHandlers, reactiveMap);
    }
    function createReactiveObject(target, baseHandlers, proxyMap) {
        const existProxy = proxyMap.get(target);
        if (existProxy) {
            return existProxy;
        }
        const proxy = new Proxy(target, baseHandlers);
        proxyMap.set(target, proxy);
        return proxy;
    }

    exports.effect = effect;
    exports.reactive = reactive;

    return exports;

})({});
//# sourceMappingURL=vue.js.map
