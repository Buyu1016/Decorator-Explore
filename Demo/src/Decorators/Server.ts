import http from "http";

export function Server(port = "8080") {
    return function (target: new (...args: any[]) => any) {
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
                    console.log(error);
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