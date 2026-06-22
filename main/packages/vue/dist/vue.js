var Vue = (function (exports) {
    'use strict';

    function createDep(effects) {
        const dep = new Set(effects);
        return dep;
    }

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
        // 一个key(读取reactive对象的属性名)对应一个effect，存在问题
        let dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = createDep()));
        }
        trackEffects(dep);
    }
    // 收集一个key的所有依赖
    const trackEffects = (dep) => {
        return dep.add(activeEffect); // ！非空断言操作符
    };
    function triggle(target, key, value) {
        console.log('triggle: 依赖触发');
        const depsMap = targetMap.get(target);
        if (!depsMap) {
            return;
        }
        const dep = depsMap.get(key);
        if (!dep) {
            return;
        }
        triggleEffects(dep);
    }
    // 触发一个key的所有依赖
    const triggleEffects = (dep) => {
        let arr = [...dep];
        for (let i = 0; i < arr.length; i++) {
            arr[i]?.run();
        }
    };
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

    const isObject = (value) => value !== null && typeof value === 'object';
    const hasChanged = (newVal, oldVal) => !Object.is(newVal, oldVal);

    function ref(value) {
        return createRef(value, false);
    }
    function createRef(rawValue, shallow) {
        if (isRef(rawValue)) {
            return rawValue;
        }
        return new RefImpl(rawValue, shallow);
    }
    class RefImpl {
        __v_isShallow;
        _value;
        _rawValue; // 原始值
        dep = undefined; // 依赖收集
        __v_isRef = true;
        constructor(value, __v_isShallow) {
            this.__v_isShallow = __v_isShallow;
            this._rawValue = value;
            this._value = __v_isShallow ? value : toReactive(value);
        }
        get value() {
            console.log('get value');
            trackRefValue(this);
            return this._value;
        }
        set value(newVal) {
            console.log('set value');
            console.log(hasChanged(this._rawValue, newVal));
            if (hasChanged(this._rawValue, newVal)) {
                this._rawValue = newVal;
                this._value = toReactive(newVal);
                triggleRefValue(this);
            }
        }
    }
    function trackRefValue(ref) {
        if (activeEffect) {
            trackEffects(ref.dep || (ref.dep = createDep()));
        }
    }
    function triggleRefValue(ref) {
        if (ref.dep) {
            triggleEffects(ref.dep);
        }
    }
    function isRef(r) {
        return !!(r && r.__v_isRef === true);
    }
    const toReactive = (value) => {
        return isObject(value) ? reactive(value) : value;
    };

    exports.effect = effect;
    exports.reactive = reactive;
    exports.ref = ref;

    return exports;

})({});
//# sourceMappingURL=vue.js.map
