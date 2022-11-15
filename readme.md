## 装饰器的艺术

**先跑一张装饰器的代码示例**
```ts
import http, { IncomingMessage, ServerResponse } from "http";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

type Res = ServerResponse<IncomingMessage> & { req: IncomingMessage }


@Server()
class UserServer {

    @Get("/api/user")
    private async getUserMessage(req: IncomingMessage) {
        return await new Promise((resolve) => {
            setTimeout(() => {
                // 用来测试this指向是否正常
                resolve({
                    code: 200,
                    msg: "",
                    user: {
                        url: req.url,
                        name: "CodeGorgeous",
                        sex: 1,
                        skill: [] // 此人平平无奇, 啥也不会
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

function Get(url: string) {
    return (target: any, name: string, descriptor: PropertyDescriptor) => {
        target.__proto__.routerMap ||= new Map();
        target.__proto__.routerMap.set(`${url}&&GET`, descriptor.value.bind(target));
    };
};

function Static(staticUrl: string) {
    return (target: any, name: string, descriptor: PropertyDescriptor) => {
        // 静态资源处理
        target.__proto__.static = {
            baseUrl: staticUrl,
            fn: descriptor.value.bind(target)
        };
    };
}

function Middleware(target: any, name: string, descriptor: PropertyDescriptor) {
    target.__proto__.middleware ||= [];
    target.__proto__.middleware.push(async (...args: any[]) => {
        return await descriptor.value.apply(target, args);
    });
};

function Server(port = "8080") {
    return (target: new (...args: any[]) => UserServer) => {
        const routerMap = target.prototype.routerMap ||= new Map<string, (...args: any) => any>(),
            middleware = target.prototype.middleware ||= [],
            staticLogo = target.prototype.static;
        const server = http.createServer(async (req, res) => {
            const reqKey = `${req.url}&&${req.method?.toLocaleUpperCase()}`;
            if (routerMap.has(reqKey) || (staticLogo && (req.url?.indexOf(staticLogo.baseUrl) === 0))) {
                try {
                    // 中间件运行
                    // 此处没有做好对于中间件的运行管理, 应该改用generator机制将next函数执行权交给中间件自行处理
                    await Promise.all(middleware.map(async (middlewareItem: Function) => {
                        await middlewareItem(req, res);
                    }));
                    // 对于静态资源的处理
                    if (staticLogo && (req.url?.indexOf(staticLogo.baseUrl) === 0)) {
                        // 说明此次为静态资源处理
                        req.url = req.url.slice(staticLogo.baseUrl.length);
                        await staticLogo.fn(req, res);
                        return;
                    };
                    const response = await routerMap.get(reqKey)(req);
                    res.end(JSON.stringify(response));
                } catch (error) {
                    res.end("Server Error");
                }
            } else {
                res.end("Not Interface");
            };
        });
        server.listen(port, () => {
            console.log(`服务已于${port}端口运行`);
        });
    };
};

```

这段代码主要就是启动了一个node的web服务, 并定义了路由与静态资源与中间件的装饰器. 其中间的Get这种装饰器灵感来源自NestJs中, 有兴趣的同学可以自行去了解一下

### 什么是装饰器
装饰器英文名为Decorator, 写法的主要特征为```@ + 返回装饰器函数的表达式```. 装饰器的本质就是个函数, 所以装饰器能够做到的功能我们编写函数都可以做到.

### 装饰器的使用范围
目前装饰器可使用在类、类方法上, 可能会有人问此处的类具体指的是什么, 因为在没有class关键字之前都是使用构造函数进行产生实例, 所以我们在此处明确点回答就是针对class, 不能作用于构造函数上, 构造函数从本质上来讲是属于函数范围.
目前装饰器默认处于第二提案阶段, 我们想要使用是需要搭配使用一些东西的, 例如: babel/typescript

### 多装饰器的执行顺序
当你使用多个装饰器时, 多个装饰器的执行顺序类似于洋葱. 下面由一张图和代码来说明:

### 装饰器应用实例
快捷实现通用性质的发布订阅模式(类方法版)

### 探索tsc对装饰器的编译处理

### 探索踩坑

1. ts-node全局安装后仍无法正常使用
    - 安装后需要重启一下编辑器即可
2. 使用装饰器时ts报错装饰器该模式仍处于实验阶段
    - 需要我们在tsconfig.json中打开experimentalDecorators即可避免该报错

### 参阅文章

> 阮一峰 ES6标准入门第三版 https://www.bookstack.cn/read/es6-3rd/docs-decorator.md

### 遗留待探索的问题
既然正常声明式函数具有提升导致装饰器失效, 那么我们使用``const fn = () => {};``这种方式生命的函数为什么解决不了提升问题.

猜想: 虽然const存在暂时性死区机制但是仍然在全局上会进行占位操作, 即提升, 但是到真正代码的那一行的时候这个东西才被允许访问.