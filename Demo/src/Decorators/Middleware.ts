export function Middleware(target: any, name: string, descriptor: PropertyDescriptor) {
    target.middleware ||= [];
    target.middleware.push(async function (...args: any[]) {
        return await descriptor.value.apply(target, args);
    });
};