const target = {
    message1: "大家",
    message2: "好",
};

const handler2 = {
    get(target, prop, receiver) {
        if (prop === "message2") {
            return "你好世界";
        }
        return Reflect.get(...arguments);
    },
}


const proxy2 = new Proxy(target, handler2);

// console.log(proxy2)
console.log(proxy2.message1) // 大家
console.log(proxy2.message2) // 你好世界