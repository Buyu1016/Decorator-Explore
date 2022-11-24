## 装饰器

**先来一张装饰器的代码示例**
```js
import { IncomingMessage } from "http";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { Get, Server, Middleware, Static, Res } from "./Decorators";

@Server()
class UserServer {

    @Get("/api/user")
    private async getUserMessage(req: IncomingMessage) {
        return await new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    code: 200,
                    msg: "",
                    user: {
                        url: req.url,
                        name: "CodeGorgeous",
                        sex: 1,
                        skills: [] // 此人平平无奇, 啥也不会
                    }
                });
            }, 1000);
        });
    };
    // POST/DELETE/PUT装饰器之类的同理

    // 静态资源处理
    @Static("/public")
    private async staticResource(req: IncomingMessage, res: Res) {
        if (!req.url?.trim()) {
            res.end("Not Resource");
            return;
        }
        const resourceUrl = req.url.slice(1).split("?")[0];
        const targetResourceUrl = resolve(__dirname, "public", resourceUrl);
        const checkUrlResult = existsSync(targetResourceUrl);
        if (checkUrlResult) {
            const resourceBuffer = await readFileSync(targetResourceUrl);
            res.end(resourceBuffer);
        } else {
            res.end("Not Resource");
        }
    };

    @Middleware
    private async tokenMiddleware(req: IncomingMessage, res: Res) {
        const token = req.headers["token"];
        // 检查token的伪逻辑...
        // 此处随缘放行
        if (Math.random() > .5) {
            res.end("TokenMiddleware Error");
        }
    };
};

```

这段代码主要就是启动了一个node的web服务, 并定义了路由与静态资源与中间件的装饰器. 其中间的Get这种装饰器灵感来源自**NestJs**中, 有兴趣的同学可以自行去了解一下

### 什么是装饰器
装饰器英文名为Decorator, 写法的主要特征为```@ + 返回装饰器函数的表达式```. 装饰器的本质就是个函数, 所以装饰器能够做到的功能我们编写函数都可以做到. 我们通常使用装饰器是用于增强/改变我们的类

### 装饰器的使用范围
目前装饰器可使用在类、类方法、访问器、类属性上, 可能会有人问此处的类具体指的是什么, 因为在没有class关键字之前都是使用构造函数进行产生实例, 所以我们在此处明确点回答就是针对class, 不能作用于构造函数上, 构造函数从本质上来讲是属于函数范围.
目前装饰器默认处于第二阶段(据消息装饰器提案已于今年进入第三阶段), 我们想要使用是需要搭配使用一些东西的, 例如: babel/typescript.

> 装饰器提案地址: https://github.com/tc39/proposal-decorators

**小知识**

> stage-0：还是一个设想，只能由TC39成员或TC39贡献者提出
> stage-1: 提案阶段，比较正式的提议，只能由TC39成员发起，这个提案要解决的问题必须有正式的书面描述。
> stage-2：草案，有了初始规范，必须对功能语法和语义进行正式描述，包括一些实验性的实现。
> stage-3：候选，该提议基本已经实现，需要等待实验验证，用户反馈及验收测试通过。
> stage-4：已完成，必须通过 Test262 验收测试，下一步就纳入ECMA标准。

#### 类装饰器
```js
@A
@B()
class Components {}

function A <T extends Function> (constructor: T) {};

function B () {
    return function <T extends Function> (constructor: T) {};
};
```

#### 形参装饰器
```js
class Component {

    constructor(@A @B() selector: string, options = {}) {}

    private say(@A a: string) {}
}

function A <T extends Function> (target: T["prototype"] | T, paramName: string, paramIndex: number) {};

function B () {
    return function<T extends Function>(target: T["prototype"] | T, paramName: string, paramIndex: number) {};
};
```

#### 方法/访问器装饰器
```js
class Component {
    @A
    @B()
    public uName: string = "CodeGorgeous";

    @A
    @B()
    private say(a: string) {}

    @A
    @B()
    public get uid() {
        return "xxxx-xxxx-xxxx";
    }
}

function A (target: any, methodName: string, descriptor?: PropertyDescriptor) {};

function B () {
    return function(target: any, methodName: string, descriptor?: PropertyDescriptor) {};
};
```

### 参数说明
- constructor
  - 类
- target
  - 类的原型
- methodName
  - 方法名称
- attrName
  - 属性名称
- paramName
  - 参数名称
  - 特殊的一点是constructor
- paramIndex
  - 参数索引

### 装饰器应用实例
快捷实现通用性质的发布订阅模式(类方法版)

### 探索tsc对装饰器的编译处理
```js
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const Decorators_1 = require("./Decorators");
let Component1 = class Component1 {
    constructor(name) {
        this._uid = Math.random().toString(16).split(".")[1];
    }
    eventTriggerPoint() {
        console.log("TriggerPoint1");
    }
    ;
    eventResponsePoint() {
        console.log("changeValue2");
    }
    ;
};
__decorate([
    Decorators_1.C
], Component1.prototype, "_uid", void 0);
__decorate([
    (0, Decorators_1.release)(["changeValue1"])
], Component1.prototype, "eventTriggerPoint", null);
__decorate([
    (0, Decorators_1.subscription)(["changeValue1", "changeValue2"])
], Component1.prototype, "eventResponsePoint", null);
Component1 = __decorate([
    Decorators_1.A,
    __param(0, Decorators_1.B)
], Component1);
class Component2 {
    eventTriggerPoint() {
        console.log("TriggerPoint2");
    }
    ;
    eventResponsePoint() {
        console.log("changeValue1");
    }
    ;
}
__decorate([
    (0, Decorators_1.release)(["changeValue2"])
], Component2.prototype, "eventTriggerPoint", null);
__decorate([
    (0, Decorators_1.subscription)(["changeValue1"])
], Component2.prototype, "eventResponsePoint", null);
const component1 = new Component1("CodeGorgeous");
component1.eventTriggerPoint();
```

我们基本看一边代码后就能将关注点切换至 **__decorate函数** 与 **__param** , 因为对于装饰器的处理集中在这两个函数身上, 一起来看一下稍微给这个函数内的代码适度换行方便我们理解这个函数都做的什么事情.

```js
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ?
                target :
                desc === null ?
                    desc = Object.getOwnPropertyDescriptor(target, key) :
                    desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
        r = Reflect.decorate(decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i])
                r = (c < 3 ?
                        d(r) :
                        c > 3 ?
                            d(target, key, r) :
                                d(target, key))
                    || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) {
        decorator(target, key, paramIndex);
    }
};
```
我们可以关注到几个点:
- **__decorate:**
    1. 根据 **arguments**决定 **r** 的值
        - 用于根据参数长度区分装饰器的类型进而决定装饰器函数执行时传递的参数
        - 例如: **d(r)** 时此处的r就为target, **d(target, key, r)** 时此处的参数为可为 **形参** 或者是 **属性描述符**, 
    2. **Reflect.decorate**
    3. **if** 判定等号赋值操作
        - 等号赋值操作会被判定为 **true**
    4. 逗号运算符
        - 会反悔最后一个逗号后的值
        - 例如: ```a, b, c``` 则会返回 **c**
    5. **for**循环执行顺序
        - 循环为倒序循环及从末尾位至起始位
        - 这刚好对应着我们在开头提到的 **装饰器执行顺序的洋葱模型的后半段**
    6. 根据 **arguments** 长度与 **r** 进行 **defineProperty**
- **__param**在我理解看来就是在保持原有 **__decorate** 函数不变的基础上进行闭包延长作用域链, 使得能够访问到形参的索引位置.

### 探索踩坑

1. ts-node全局安装后仍无法正常使用
    - 安装后需要重启一下编辑器即可
2. 使用装饰器时ts报错装饰器该模式仍处于实验阶段
    - 需要我们在tsconfig.json中打开experimentalDecorators即可避免该报错

### 参阅文章

> 阮一峰 ES6标准入门第三版 https://www.bookstack.cn/read/es6-3rd/docs-decorator.md

### 遗留待探索的问题
既然正常声明式函数具有提升导致装饰器失效, 那么我们使用``const fn = () => {};``这种方式生命的函数为什么解决不了提升问题.

猜想: 虽然const存在暂时性死区机制但是仍然在全局上会进行占位操作, 即提升, 但是到真正代码的那一行的时候这个东西才被允许访问. (未验证的猜想)