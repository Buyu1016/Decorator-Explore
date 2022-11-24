export * from "./subscription";
export * from "./release";

export const eventChannelBus = new Map<string, Function[]>();


export function A (constructor: Function) {};

export function B <T extends Function>(target: T["prototype"] | T, paramName: string, paramIndex: number) {}

export function C <T extends Function>(target: T["prototype"], methodName: string, descriptor?: PropertyDescriptor) {};