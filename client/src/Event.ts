import { EventEmitter } from "events";
import Guid from "./Guid";

export class TEvent<T> {
    emitter = new EventEmitter();
    EVENT_NAME = Guid.newGuid();

    constructor() {
        this.emitter.setMaxListeners(Infinity);
    }
    register(cb: (item: T) => void): void {
        this.emitter.on(this.EVENT_NAME, cb);
    }
    unregister(cb: (item: T) => void): void {
        this.emitter.removeListener(this.EVENT_NAME, cb);
    }
    emit(item: T): void {
        this.emitter.emit(this.EVENT_NAME, item);
    }
}

export class Event {
    emitter = new EventEmitter();
    EVENT_NAME = Guid.newGuid();
    constructor() {
        this.emitter.setMaxListeners(Infinity);
    }

    register(cb: () => void): void {
        this.emitter.on(this.EVENT_NAME, cb);
    }
    unregister(cb: () => void): void {
        this.emitter.removeListener(this.EVENT_NAME, cb);
    }
    emit(): void {
        this.emitter.emit(this.EVENT_NAME);
    }
}