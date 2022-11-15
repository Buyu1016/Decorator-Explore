import { IncomingMessage, ServerResponse } from "http";
export * from "./Get";
export * from "./Server";
export * from "./Middleware";
export * from "./Static";
export declare type Res = ServerResponse<IncomingMessage> & { req: IncomingMessage };