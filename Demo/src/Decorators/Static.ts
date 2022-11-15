export function Static(staticUrl: string) {
    return (target: any, name: string, descriptor: PropertyDescriptor) => {
        // 静态资源处理
        target.static = {
            baseUrl: staticUrl,
            fn: descriptor.value.bind(target)
        };
    };
}