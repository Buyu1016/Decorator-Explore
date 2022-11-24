import { eventChannelBus } from "./index";
export function subscription(channels: string[]) {
    return function<T extends Function>(target: T["prototype"], methodName: string, descriptor: PropertyDescriptor) {
        channels.forEach(channel => {
            const oldChannelCallback = eventChannelBus.get(channel) || [];
            eventChannelBus.set(channel, [...oldChannelCallback, descriptor.value]);
        });
    };
};