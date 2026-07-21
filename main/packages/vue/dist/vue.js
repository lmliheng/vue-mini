var Vue = (function (exports) {
    'use strict';

    const isOn = (key) => /^on{^a-z}/.test(key);
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
     * fn: callback回调函数
     *
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

    /**
     * @对props里面的clas和style进行增强处理
     */
    function normalizeClass(value) {
        let res = '';
        if (isString(value)) {
            res = value;
        }
        else if (isArray(value)) {
            for (let i = 0; i < value.length; i++) {
                const normaized = normalizeClass(value[i]);
                if (normaized) {
                    res += normaized + ' ';
                }
            }
        }
        else if (isObject(value)) {
            for (const class_name in value) {
                if (value[class_name]) {
                    res += class_name + ' ';
                }
            }
        }
        return res.trim();
    }

    var ShapeFlags;
    (function (ShapeFlags) {
        ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
        // 组件
        ShapeFlags[ShapeFlags["FUNCTIONAL_COMPONENT"] = 2] = "FUNCTIONAL_COMPONENT";
        // 
        ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 4] = "STATEFUL_COMPONENT";
        ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 8] = "TEXT_CHILDREN";
        ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 16] = "ARRAY_CHILDREN";
        // 插槽
        ShapeFlags[ShapeFlags["SLOTS_CHILDREN"] = 32] = "SLOTS_CHILDREN";
        ShapeFlags[ShapeFlags["TELEPORT"] = 64] = "TELEPORT";
        ShapeFlags[ShapeFlags["SUSPENSE"] = 128] = "SUSPENSE";
        ShapeFlags[ShapeFlags["COMPONENT_SHOULD_KEEP_ALIVE"] = 256] = "COMPONENT_SHOULD_KEEP_ALIVE";
        ShapeFlags[ShapeFlags["COMPONENT_KEPT_ALIVE"] = 512] = "COMPONENT_KEPT_ALIVE";
        ShapeFlags[ShapeFlags["COMPONENT"] = 6] = "COMPONENT";
    })(ShapeFlags || (ShapeFlags = {}));

    // 组件: 进入isObeject 进入shapefalgs.stateful_comonent
    const Fragment = Symbol('Fragment'); // 段
    const Text$1 = Symbol('Text');
    const Comment$1 = Symbol('Comment');
    /**
     * @h函数构建vnode的主要逻辑
     */
    function createVNode(type, props, children) {
        if (props) {
            let { class: klass, style } = props;
            if (klass && !isString(klass)) {
                props.class = normalizeClass(klass);
            }
            // style.
            // if()
        }
        const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : 0;
        return createBaseVNode(type, props, children, shapeFlag);
    }
    function createBaseVNode(type, props, children, shapeFlag) {
        const vnode = {
            __v_isVNode: true,
            type,
            props,
            shapeFlag
        };
        // 对props的class和style进行增强处理
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
    function isSameVNodeType(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key;
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

    /**
     * @组件工具
     *
     */
    function normalizeVNode(child) {
        if (isObject(child)) {
            return cloneIfMounted(child);
        }
        else {
            return createVNode(Text, null, child);
        }
    }
    function cloneIfMounted(obj) {
        return obj;
    }
    /**
     *
     *
     * instance 的vnode属性和render属性
     */
    function renderComponentRoot(instance) {
        const { vnode, render, data } = instance;
        let result;
        try {
            if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                // render!()是什么写法
                result = normalizeVNode(render.call(data));
            }
        }
        catch (err) {
            console.log(err);
        }
        return result;
    }

    //TODO：在生命周期中访问响应式数据
    /**
     * @生命周期钩子
     */
    var LifeclcleHooks;
    (function (LifeclcleHooks) {
        LifeclcleHooks["BEFORE_CREATE"] = "bc";
        LifeclcleHooks["CREATE"] = "c";
        LifeclcleHooks["BEFORE_MOUNT"] = "bm";
        LifeclcleHooks["MOUNTED"] = "m";
    })(LifeclcleHooks || (LifeclcleHooks = {}));
    /**
     * @注册hooks
     */
    function injectHook(type, hook, target) {
        //Note：target是什么
        if (target) {
            target[type] = hook;
            return hook;
        }
    }
    /**
     * @创建一个指定的hook的方法
     *
     */
    const createHook = (lifecycle) => {
        return (hook, target) => injectHook(lifecycle, hook, target);
    };
    /**
     * 创建bm钩子
     */
    const onBeforeMount = createHook(LifeclcleHooks.BEFORE_MOUNT);
    /**
     * 创建m钩子
     */
    const onMounted = createHook(LifeclcleHooks.MOUNTED);

    let uid = 0;
    /**
     * 根据虚拟DOM创建组件实例
     */
    function createComponentInstance(vnode) {
        const type = vnode.type;
        const instance = {
            // FIXME：isMounted在哪。
            uid: uid++,
            vnode,
            type, // 组件类型
            subTree: null, // render函数返回值
            effect: null, //reactiveEffect实例
            update: null,
            render: null, //组件内的render函数
            isMounted: false,
            bc: null,
            c: null,
            bm: null,
            m: null,
        };
        return instance;
    }
    /**
     * 规范化组件实例数据
     * 这有什么用?把type里的render函数赋给了instance的render属性
     */
    function setupComponent(instance) {
        const setupResult = setupStatefulComponent(instance);
        return setupResult;
    }
    function setupStatefulComponent(instance) {
        //NOTE: instance.type.setup属性是在哪定义的
        // 在type找到setup属性
        const component = instance.type;
        const { setup } = component;
        if (setup) {
            const setupResult = setup();
            handleSetResult(instance, setupResult);
        }
        else {
            finishComponentSetup(instance);
        }
    }
    function finishComponentSetup(instance) {
        const component = instance.type;
        // 组件不存在时才重新赋值
        if (!instance.render) {
            instance.render = component.render;
        }
        // NOTE: 改变options中的this指向
        applyOptions(instance);
    }
    function applyOptions(instance) {
        // instance type的data属性 和 dataOptions使用同一内存
        const { data: dataOptions, beforeCreate, create, beforeMount, mounted } = instance.type;
        if (beforeCreate) {
            callHook(beforeCreate, instance.data);
        }
        if (dataOptions) {
            const data = dataOptions();
            if (isObject(data)) {
                // 数据是对象就进入reactive
                instance.data = reactive(data);
            }
        }
        if (create) {
            callHook(create, instance.data);
        }
        // NOTE: 这种写法
        function registerLifecycleHook(register, hook) {
            register(hook?.bind(instance.data), instance);
        }
        registerLifecycleHook(onBeforeMount, beforeMount); //执行register（hook，instance）
        registerLifecycleHook(onMounted, mounted);
    }
    function callHook(hook, proxy) {
        hook.bind(proxy)();
    }
    function handleSetResult(instance, setupResult) {
        if (isFunction(setupResult)) {
            instance.render = setupResult;
        }
        finishComponentSetup(instance);
    }

    /**
     * @render 渲染函数
     */
    /**
     * Render主逻辑
     */
    function createRenderer(option) {
        return baseCreateRenderer(option);
    }
    // TODO:需要阅读baseCreateRender
    function baseCreateRenderer(option) {
        const { patchProp: hostPatchProp, insert: hostInsert, createElement: hostCreateElement, setElementText: hostSetElementText, remove: hostRemove, createText: hostCreateText, setText: hostSetText, createComment: hostCreateComment } = option;
        /**
         * @元素更新入口
         * 包括挂载和更新两种操作，
         * 还有卸载
         */
        const processElement = (oldVNode, newVNode, container, anchor) => {
            // 挂载
            if (oldVNode === null) {
                mountElement(newVNode, container, anchor);
            }
            else { //更新
                patchElement(oldVNode, newVNode);
            }
        };
        /**
         * type是Text时进入
         *
         */
        function processText(oldVNode, newVNode, container, anchor) {
            if (oldVNode === null) {
                newVNode.el = hostCreateText(newVNode.children);
                hostInsert(newVNode.el, container, anchor);
            }
            else {
                const el = (newVNode.el = oldVNode.el);
                if (newVNode.children !== oldVNode.children) {
                    hostSetText(el, newVNode.children);
                }
            }
        }
        function processCommentNode(oldVNode, newVNode, container, anchor) {
            if (oldVNode === null) {
                newVNode.el = hostCreateComment((newVNode.children || ''));
                hostInsert(newVNode.el, container, anchor);
            }
            else {
                // 不更新
                newVNode.el = oldVNode.el;
            }
        }
        function processFragment(oldVNode, newVNode, container, anchor) {
            if (oldVNode === null) {
                mountChildren(newVNode.children, container, anchor);
            }
            else {
                patchChildren(oldVNode, newVNode, container, anchor);
            }
        }
        function processComponent(oldVNode, newVNode, container, anchor) {
            if (oldVNode === null) {
                mountComponent(newVNode, container, anchor);
            }
        }
        /**
         *
         * @diff
         */
        const patchKeyedChildren = (oldChildren, newChildren, container, parentAnchor) => {
            let i = 0;
            let oldChildrenEnd = oldChildren.length - 1;
            let newChildrenEnd = newChildren.length - 1;
            // 1. 从前向后同步
            while (i <= oldChildrenEnd && i <= newChildrenEnd) {
                const oldVNode = oldChildren[i];
                const newVNode = normalizeVNode(newChildren[i]);
                if (isSameVNodeType(oldVNode, newVNode)) {
                    patch(oldVNode, newVNode, container, null);
                }
                else {
                    break;
                }
                i++;
            }
            // 2. 从后向前同步
            while (i <= oldChildrenEnd && i <= newChildrenEnd) {
                const oldVNode = oldChildren[oldChildrenEnd];
                const newVNode = normalizeVNode(newChildren[newChildrenEnd]);
                if (isSameVNodeType(oldVNode, newVNode)) {
                    patch(oldVNode, newVNode, container, null);
                }
                else {
                    break;
                }
                oldChildrenEnd--;
                newChildrenEnd--;
            }
            // 3. 新增节点（新列表更长）
            if (i > oldChildrenEnd) {
                if (i <= newChildrenEnd) {
                    const nextPos = newChildrenEnd + 1;
                    const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : parentAnchor;
                    while (i <= newChildrenEnd) {
                        patch(null, normalizeVNode(newChildren[i]), container, anchor);
                        i++;
                    }
                }
            }
            // 4. 删除节点（旧列表更长）
            else if (i > newChildrenEnd) {
                while (i <= oldChildrenEnd) {
                    unmount(oldChildren[i]);
                    i++;
                }
            }
            // 5. 未知序列（乱序）- 这里需要更复杂的 diff 算法
            else ;
        };
        const mountComponent = (newVNode, container, anchor) => {
            newVNode.component = createComponentInstance(newVNode);
            const instance = newVNode.component;
            //
            setupComponent(instance);
            // 
            setupRenderEffect(instance, newVNode, container, anchor);
        };
        /**
         * @
         * 这里面的children是一个数组或者字符串？
         */
        const mountChildren = (children, container, anchor) => {
            if (isString(children)) {
                children = children.split('');
            }
            for (let i = 0; i < children.length; i++) {
                const child = normalizeVNode(children[i]);
                // const child = (children = normalizeVNode(children[i]))
                patch(null, child, container, anchor);
            }
        };
        const mountElement = (vnode, container, anchor) => {
            const { type, props, shapeFlag } = vnode;
            const el = (vnode.el = hostCreateElement(type));
            if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(el, vnode.children);
            }
            else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                mountChildren(vnode.children, el, anchor);
            }
            if (props) {
                //for of 需要iterable ，如果是对象会报错
                for (const key in props) {
                    hostPatchProp(el, key, null, props[key]);
                }
            }
            hostInsert(el, container, anchor);
        };
        // 
        const patch = (oldVNode, newVNode, container, anchor = null) => {
            if (oldVNode && !isSameVNodeType(oldVNode, newVNode)) {
                unmount(oldVNode);
                oldVNode = null;
            }
            if (oldVNode === newVNode) {
                return;
            }
            const { type, shapeFlag } = newVNode;
            switch (type) {
                case Text:
                    processText(oldVNode, newVNode, container, anchor);
                    break;
                case Comment:
                    processCommentNode(oldVNode, newVNode, container, anchor);
                    break;
                case Fragment:
                    processFragment(oldVNode, newVNode, container, anchor);
                    break;
                default:
                    if (shapeFlag & ShapeFlags.ELEMENT) {
                        // 元素
                        processElement(oldVNode, newVNode, container, anchor);
                    }
                    else if (shapeFlag & ShapeFlags.COMPONENT) {
                        // 组件
                        processComponent(oldVNode, newVNode, container, anchor);
                    }
            }
        };
        /**
         * @卸载虚拟DOM
         */
        const unmount = (VNode) => {
            // 传入.el  DOM
            hostRemove(VNode.el);
        };
        /**
         * @元素更新
         */
        const patchElement = (oldVNode, newVNode) => {
            const el = (newVNode.el = oldVNode.el);
            const oldProps = oldVNode.props || EMPTY_OBJ;
            const newProps = newVNode.props || EMPTY_OBJ;
            patchChildren(oldVNode, newVNode, el, null);
            // 不是patchProp
            patchProps(el, newVNode, oldProps, newProps);
        };
        /**
         * @更新vnode的children属性
         */
        const patchChildren = (oldVNode, newVNode, container, anchor) => {
            const c1 = oldVNode && oldVNode.children;
            const prevShapeFlag = oldVNode ? oldVNode.shapeFlag : 0;
            const c2 = newVNode.children;
            const { shapeFlag } = newVNode;
            // 新vn的children是文本
            if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
                // 旧vn的children是数组
                if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    // 待定
                    patchKeyedChildren(c1, c2, container, anchor);
                }
                if (c1 !== c2) {
                    hostSetElementText(container, c2);
                }
                // 这里为什么要这样写if
            }
            else {
                if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    // diff计算
                    patchKeyedChildren(c1, c2, container, anchor);
                }
                else {
                    if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                        hostSetElementText(container, '');
                    }
                    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) ;
                }
            }
        };
        /**
         * @和patchProp有什么区别
         *
         */
        const patchProps = (el, vnode, oldProp, newProp) => {
            if (oldProp !== newProp) {
                for (const key in newProp) {
                    const next = newProp[key];
                    const prev = oldProp[key];
                    if (next !== prev) {
                        hostPatchProp(el, key, prev, next);
                    }
                }
            }
            if (oldProp !== EMPTY_OBJ) {
                for (const key in oldProp) {
                    if (!(key in newProp)) {
                        hostPatchProp(el, key, oldProp[key], null);
                    }
                }
            }
        };
        /**
         * @组件渲染方法
         */
        const setupRenderEffect = (instance, initialVNode, container, anchor) => {
            /**
             * 组件更新方法
             */
            const componentUpdateFn = () => {
                if (!instance.isMounted) {
                    const { bm, m } = instance;
                    if (bm) {
                        bm();
                    }
                    const subTree = (instance.subTree = renderComponentRoot(instance));
                    patch(null, subTree, container, anchor);
                    if (m) {
                        m();
                    }
                    initialVNode.el = subTree.el;
                    instance.isMounted = true;
                }
                else {
                    // 如果说组件已经挂载
                    let { next, vnode } = instance;
                    if (!next) {
                        next = vnode;
                    }
                    const nextTree = renderComponentRoot(instance);
                    // 保存以前的subTree，并在下一步更新subTree属性
                    const prevTree = instance.subTree;
                    instance.subTree = nextTree;
                    patch(prevTree, nextTree, container, anchor);
                    // 更新next属性的el属性
                    next.el = nextTree.el;
                }
            };
            // NOTE：组件实例的effect属性 通过 fn和调度器创建effect依赖
            const effect = (instance.effect = new ReactiveEffect(componentUpdateFn, () => quenePreFlushCb(update)));
            // NOTE: update函数就是 执行effect中回调函数
            const update = (instance.update = () => effect.run());
            update();
        };
        /**
         * @render入口
         */
        const render = (vnode, container) => {
            if (vnode === null) {
                if (container._vnode) {
                    //
                    unmount(container._vnode);
                }
            }
            else {
                // 进入patch函数
                patch(container._vnode || null, vnode, container);
            }
            // 完成后 在container打上_vnode属性
            container._vnode = vnode;
        };
        // 这样返回...
        return { render };
    }

    /**
     * @元素操作
     */
    const nodeOps = {
        insert: (child, parent, anchor) => {
            parent.insertBefore(child, anchor || null);
        },
        createElement: (tag) => {
            return document.createElement(tag);
        },
        setElementText: (el, text) => {
            el.textContent = text;
        },
        // child是一个VNode
        remove: (child) => {
            const parent = child.parentNode;
            if (parent) {
                parent.removeChild(child);
            }
        },
        createText: (text) => {
            return document.createTextNode(text);
        },
        // node 是一个element
        setText: (node, text) => {
            node.nodeValue = text;
        },
        createComment: (text) => {
            return document.createComment(text);
        }
    };

    /**
     * @为class打补丁
     */
    function patchClass(el, value) {
        if (value === null) {
            el.removeAttribute('class');
            // isSVG
        }
        else {
            // 比setAttribute更高效
            el.className = value;
        }
    }

    /**
     * 通过 DOM properity指定属性
     */
    function patchDOMProp(el, key, value) {
        try {
            el[key] = value;
        }
        catch (el) {
        }
    }

    /**
     * @通过setAttribute设置属性
     */
    function attrs(el, key, value) {
        if (value == null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, value);
        }
    }

    /**
     * @对style属性的特殊处理
     */
    function patchStyle(el, prev, next) {
        const style = el.style;
        const isCssString = isString(next);
        if (next && !isCssString) {
            for (const key in next) {
                setStyle(style, key, next[key]);
            }
            if (prev && !isString(prev)) {
                for (const key in prev) {
                    if (next[key] == null) {
                        setStyle(style, key, '');
                    }
                }
            }
        }
    }
    function setStyle(style, name, val) {
        style[name] = val;
    }

    /**
     * @patchEvent更新DOM中的事件
     */
    function patchEvent(el, rawName, prevValue, nextValue) {
        const invokers = el._vei || (el._vei = {});
        const existingInvoker = invokers[rawName];
        // 存在缓存事件和新事件 确定是更新
        if (nextValue && existingInvoker) {
            existingInvoker.value = nextValue;
        }
        else {
            const name = parseName(rawName);
            if (nextValue) {
                const invoker = (invokers[rawName] = createInvoker(nextValue));
                el.addEventListener(name, invoker);
            }
            else if (existingInvoker) {
                // 不存在新值 存在缓存值
                el.removeEventListener(name, existingInvoker);
                invokers[rawName] = undefined;
            }
        }
    }
    function parseName(name) {
        return name.slice(2).toLowerCase();
    }
    /**
     * 创建invoker，使用value属性存储事件
     */
    function createInvoker(initialValue) {
        const invoker = (e) => {
            invoker.value && invoker.value();
        };
        invoker.value = initialValue;
        return invoker;
    }

    /**
     * @属性更新
     * class，style，value，type等属性更新需要不同的方法
     *
     */
    const patchProp = (el, key, prevValue, nextValue) => {
        if (key === 'class') {
            patchClass(el, nextValue);
        }
        else if (key === 'style') {
            patchStyle(el, prevValue, nextValue);
        }
        else if (isOn(key)) {
            patchEvent(el, key, prevValue, nextValue);
            // to do 事件
        }
        else if (shouldSetAsProp(el, key)) {
            //
            patchDOMProp(el, key, nextValue);
        }
        else {
            // id,
            attrs(el, key, nextValue);
        }
    };
    /**
    * @判断是否用DOMproperity还是setAttribute
     */
    function shouldSetAsProp(el, key) {
        if (key === 'form') {
            return false;
        }
        if (key === 'list' && el.tagName === 'INPUT') {
            return false;
        }
        if (key === 'type' && el.tagName === 'TEXTAREA') {
            return false;
        }
        return key in el;
    }

    /**
     * @首次调用并缓存，后续使用避免再次创建
     * 使用nodeops和patch可以实现平台迁移，如小程序，webGL等
     */
    const RendererOptions = extend({ patchProp }, nodeOps);
    let renderer;
    function ensureRenderer() {
        return renderer || (renderer = createRenderer(RendererOptions));
    }
    const render = (...args) => {
        ensureRenderer().render(...args);
    };

    exports.Comment = Comment$1;
    exports.Fragment = Fragment;
    exports.Text = Text$1;
    exports.computed = computed;
    exports.effect = effect;
    exports.h = h;
    exports.quenePreFlushCb = quenePreFlushCb;
    exports.reactive = reactive;
    exports.ref = ref;
    exports.render = render;
    exports.watch = watch;

    return exports;

})({});
//# sourceMappingURL=vue.js.map
