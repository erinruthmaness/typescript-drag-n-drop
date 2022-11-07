type Listener<T> = (items: T[]) => void;

export abstract class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }

    updateListeners(stateCopy: T[]) {
        for (const listenerFn of this.listeners) {
            listenerFn(stateCopy);
        }
    }

    constructor() {}
}
