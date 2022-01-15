import EventEmitter from "events";

export const map = (x: number, in_min: number, in_max: number, out_min: number, out_max: number) => {
    return Math.round((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
}

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

export class Guid {
    static newGuid() {
        var guidArray = new Array<string>();
        for (var index = 0; index < 8; index++) {
            var keyValue = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            guidArray.push(keyValue);
        }
        var guid = guidArray[0] + guidArray[1]
            + "-" + guidArray[2] + "-" + guidArray[3]
            + "-" + guidArray[4] + "-" + guidArray[5]
            + guidArray[6] + guidArray[7];
        return guid;
    }
}