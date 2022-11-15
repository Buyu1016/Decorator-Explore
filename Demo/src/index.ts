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