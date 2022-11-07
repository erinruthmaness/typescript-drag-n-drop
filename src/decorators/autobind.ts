export function autobind(_target: any, _methodName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjustedDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: false, //won't show up in for in loops
        get() {
            //get is a value property with extra logic before returning the value
            const boundFn = originalMethod.bind(this); //refers to object that defines the getter
            return boundFn;
        },
    };
    return adjustedDescriptor; //replaces the original descriptor with this one
}
