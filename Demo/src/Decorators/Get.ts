export function Get(url: string) {
    return (target: any, name: string, descriptor: PropertyDescriptor) => {
        target.routerMap ||= new Map();
        target.routerMap.set(`${url}&&GET`, descriptor.value.bind(target));
    };
};