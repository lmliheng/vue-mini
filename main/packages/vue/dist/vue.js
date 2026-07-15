var Vue = (function (exports) {
    'use strict';

    const isString = (value) => typeof value === 'string';
    const isArray = (value) => value instanceof Array;
    const isFunction = (value) => typeof value === 'function';
    const isObject = (value) => value !== null && typeof value === 'object';
    const hasChanged = (newVal, oldVal) => !Object.is(newVal, oldVal);
    const extend = Object.assign;
    /**
     * @空对象
     */
    const EMPTY_OBJ = {};

    function createDep(effects) {
        const dep = new Set(effects);
        return dep;
    }

    /**
     * @activeEffect
     */
    let activeEffect;
    /**
     * @用于存储响应式对象属性和它关联的依赖之间的关系
     */
    const targetMap = new WeakMap();
    /**
     * @effect主函数
     * @param fn
     */
    function effect(fn, options) {
        const _effect = new ReactiveEffect(fn);
        // options 存在就把option对象的属性加到effect对象里
        if (options) {
            extend(_effect, options);
        }
        if (!options || !options.lazy) {
            _effect.run();
        }
    }
    /**
     * @effect依赖类
     */
    class ReactiveEffect {
        fn;
        scheduler;
        computed;
        constructor(fn, scheduler = null) {
            this.fn = fn;
            this.scheduler = scheduler;
        }
        run() {
            activeEffect = this;
            return this.fn();
        }
        // todo
        stop() {
        }
    }
    /**
     * @收集依赖
     * @param target
     * @param key
     * @returns
     */
    function track(target, key) {
        // console.log('track: 依赖收集')
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
    /**
     * @收集一个key的所有依赖
     * @param dep
     * @returns
     */
    const trackEffects = (dep) => {
        return dep.add(activeEffect); // ！非空断言操作符
    };
    /**
     * @trigglce触发依赖
     * @param target
     * @param key
     * @param value
     * @returns
     */
    function triggle(target, key, value) {
        // console.log('triggle: 依赖触发')
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
    /**
     * @触发一个响应式对象属性key的所有依赖
     * @param dep
     */
    const triggleEffects = (dep) => {
        let effects = isArray(dep) ? dep : [...dep];
        //先触发computed属性的依赖，再触发无computed属性的依赖
        for (const effect of effects) {
            if (effect.computed) {
                triggleEffect(effect);
            }
        }
        for (const effect of effects) {
            if (!effect.computed) {
                triggleEffect(effect);
            }
        }
    };
    /**
     * 依赖effect的执行
     * @param effect
     */
    function triggleEffect(effect) {
        // scheduler属性
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
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
    var ReactiveFlags;
    (function (ReactiveFlags) {
        ReactiveFlags["IS_RACTIVE"] = "__v_isReactive";
    })(ReactiveFlags || (ReactiveFlags = {}));
    /**
     * @reactive响应式入口函数
     * @param 只能是object类型
     */
    function reactive(target) {
        return createReactiveObject(target, mutableHandlers, reactiveMap);
    }
    function createReactiveObject(target, baseHandlers, proxyMap) {
        const existProxy = proxyMap.get(target);
        if (existProxy) {
            return existProxy;
        }
        const proxy = new Proxy(target, baseHandlers);
        proxy[ReactiveFlags.IS_RACTIVE] = true;
        proxyMap.set(target, proxy);
        return proxy;
    }
    /**
     * @author liheng
     * @用于判断是否是Reactive类型
     */
    function isReactive(value) {
        return !!(value && value[ReactiveFlags.IS_RACTIVE]);
    }

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
            // console.log('get value')
            trackRefValue(this);
            return this._value;
        }
        set value(newVal) {
            // console.log('set value')
            if (hasChanged(this._rawValue, newVal)) {
                this._rawValue = newVal;
                this._value = toReactive(newVal);
                trigglerRefValue(this);
            }
        }
    }
    function trackRefValue(ref) {
        if (activeEffect) {
            trackEffects(ref.dep || (ref.dep = createDep()));
        }
    }
    function trigglerRefValue(ref) {
        if (ref.dep) {
            triggleEffects(ref.dep);
        }
    }
    /**
     *
     * @是否是Ref类型
     * @returns boolean
     *
     */
    function isRef(r) {
        return !!(r && r.__v_isRef === true);
    }
    /**
     *
     * @入参值如果是对象就变成reactive类型
     * @returns
     */
    const toReactive = (value) => {
        return isObject(value) ? reactive(value) : value;
    };

    class ComputedRefImpl {
        dep = undefined;
        _value;
        effect;
        __v_isRef = true;
        _dirty = true;
        constructor(getter) {
            this.effect = new ReactiveEffect(getter, () => {
                if (!this._dirty) {
                    this._dirty = true;
                    trigglerRefValue(this); // 依赖触发写在这...
                }
            });
            this.effect.computed = this; // 给一个computed属性，要在ReactiveEffect里注明?
        }
        get value() {
            trackRefValue(this);
            if (this._dirty) {
                this._dirty = false;
                this._value = this.effect.run();
            }
            return this._value;
        }
    }
    function computed(getterOrOptions) {
        let getter;
        const onlyGetter = isFunction(getterOrOptions);
        if (onlyGetter) {
            getter = getterOrOptions;
        }
        const cRef = new ComputedRefImpl(getter);
        return cRef;
    }

    let isFlushPending = false;
    const pendingPreFlushCbs = [];
    const resolvedPromise = Promise.resolve();
    /**
     * @调度系统规则
     */
    function quenePreFlushCb(cb) {
        queneCb(cb, pendingPreFlushCbs);
    }
    /**
     *
     * @param cb
     * @param pendingQuene
     */
    function queneCb(cb, pendingQuene) {
        pendingQuene.push(cb);
        queneFlush();
    }
    /**
     * @依次执行队列中的callback函数
     */
    function queneFlush() {
        if (!isFlushPending) {
            isFlushPending = true;
            // 把任务放到微任务里，以改变执行规则
            resolvedPromise.then(flushJobs);
        }
    }
    /**
     *
     */
    function flushJobs() {
        isFlushPending = false;
        flushPreFlushCbs();
    }
    /**
     * @任务队列依次触发job
     * @param cb
     */
    function flushPreFlushCbs() {
        if (pendingPreFlushCbs.length) {
            let activePreFlushCbs = [...new Set(pendingPreFlushCbs)];
            // let activePreFlushCbs = pendingPreFlushCbs.slice()
            // Set在对函数进行去重比较时，可能会改变数组的内部状态，导致某些元素变成 undefined
            pendingPreFlushCbs.length = 0;
            for (let i = 0; i < activePreFlushCbs.length; i++) {
                // 类型收窄
                const cb = activePreFlushCbs[i];
                if (typeof cb === 'function') {
                    cb();
                }
            }
        }
    }

    /**
     * @watch入口函数
     * @param source
     * @param cb
     * @param options
     */
    function watch(source, cb, options) {
        doWatch(source, cb, options);
    }
    /**
     * @Watch的实现
     * @param source
     * @param cb
     * @param param2
     */
    function doWatch(source, cb, { immediate, deep } = EMPTY_OBJ) {
        let getter;
        // ref还没实现
        if (isReactive(source)) {
            getter = () => source;
            deep = true; // 是Reactive对象..deep变成true
        }
        else {
            getter = () => { };
        }
        if (cb && deep) {
            // getter浅拷贝....  
            const baseGetter = getter;
            getter = () => baseGetter();
        }
        let oldValue = {};
        // job
        const job = () => {
            if (cb) {
                const newValue = effect.run();
                // deep 为什么要加入或
                if (deep || hasChanged(newValue, oldValue)) {
                    // 触发回调
                    cb(newValue, oldValue);
                    oldValue = newValue;
                }
            }
        };
        let scheduler = () => quenePreFlushCb(job);
        const effect = new ReactiveEffect(getter, scheduler);
        if (cb) {
            if (immediate) {
                job();
            }
            else {
                oldValue = effect.run();
            }
        }
        else {
            // 没有回调...
            effect.run();
        }
        return () => {
            effect.stop();
        };
    }

    var ShapeFlags;
    (function (ShapeFlags) {
        ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
        ShapeFlags[ShapeFlags["FUNCTIONAL_COMPONENT"] = 2] = "FUNCTIONAL_COMPONENT";
        ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 4] = "STATEFUL_COMPONENT";
        ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 8] = "TEXT_CHILDREN";
        ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 16] = "ARRAY_CHILDREN";
        ShapeFlags[ShapeFlags["SLOTS_CHILDREN"] = 32] = "SLOTS_CHILDREN";
        ShapeFlags[ShapeFlags["TELEPORT"] = 64] = "TELEPORT";
        ShapeFlags[ShapeFlags["SUSPENSE"] = 128] = "SUSPENSE";
        ShapeFlags[ShapeFlags["COMPONENT_SHOULD_KEEP_ALIVE"] = 256] = "COMPONENT_SHOULD_KEEP_ALIVE";
        ShapeFlags[ShapeFlags["COMPONENT_KEPT_ALIVE"] = 512] = "COMPONENT_KEPT_ALIVE";
        ShapeFlags[ShapeFlags["COMPONENT"] = 6] = "COMPONENT";
    })(ShapeFlags || (ShapeFlags = {}));

    /**
     * @h函数构建vnode的主要逻辑
     */
    function createVNode(type, props, children) {
        const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;
        return createBaseVNode(type, props, children, shapeFlag);
    }
    function createBaseVNode(type, props, children, shapeFlag) {
        const vnode = {
            __v_isVNode: true,
            type,
            props,
            shapeFlag
        };
        normalizeChildren(vnode, children);
        return vnode;
    }
    /**
     * @处理h函数参数里的children属性
     * 改变shapeFlag
     * 传入的可能是'hello' , [vnode1,vnode2] ，1
     * 我在测试案例里写的是文本类型
     */
    function normalizeChildren(vnode, children) {
        let type = 0;
        //const { shapeFlag } = vnode // 解构
        if (children == null) {
            children = null;
        }
        else if (isArray(children)) {
            type = ShapeFlags.ARRAY_CHILDREN;
        }
        else if (isFunction(children)) ;
        else {
            children = String(children);
            type = ShapeFlags.TEXT_CHILDREN;
        }
        vnode.children = children;
        vnode.shapeFlag |= type;
    }
    function isVNode(value) {
        return value ? value.__v_isVNode === true : false;
    }

    /**
     * @h函数
     * 使用h函数可以生成vnode
     */
    function h(type, propsOrChildren, children) {
        const l = arguments.length;
        if (l === 2) {
            // 是对象不是数组 可能是props或者array children
            if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
                // 是VNOde那第二个参数就是children
                if (isVNode(propsOrChildren)) {
                    return createVNode(type, null, [propsOrChildren]);
                }
                // 是对象不是VNode,那就是props
                return createVNode(type, propsOrChildren, null);
            }
            else {
                return createVNode(type, null, propsOrChildren);
            }
        }
        else {
            if (l > 3) {
                children = Array.prototype.slice.call(arguments, 2);
            }
            else if (l === 3 && isVNode(children)) {
                children = [children];
            }
            return createVNode(type, propsOrChildren, children);
        }
    }

    exports.computed = computed;
    exports.effect = effect;
    exports.h = h;
    exports.quenePreFlushCb = quenePreFlushCb;
    exports.reactive = reactive;
    exports.ref = ref;
    exports.watch = watch;

    return exports;

})({});
//# sourceMappingURL=vue.js.map
