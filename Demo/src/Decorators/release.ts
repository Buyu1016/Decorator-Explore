import { eventChannelBus } from "./index";
export function release(channels: string[]) {
    return function<T extends Function>(target: T["prototype"], methodName: string, descriptor: PropertyDescriptor) {
        const _releaseFn: Function = descriptor.value;
        descriptor.value = function() {
            _releaseFn.call(this);
            channels.forEach(channel => {
                const oldChannelCallback = eventChannelBus.get(channel) || [];
                Promise.all(oldChannelCallback.map(async (fn: Function) => {
                    await fn.call(this);
                }));
            });
            
        };
    };
};