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
    // POST/DELETE/PUT访问器之类的同理

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


