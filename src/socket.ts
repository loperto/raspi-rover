import * as socketIo from "socket.io-client";
import { TEvent } from "./Events";

export interface Command {
    id: string;
    payload: string;
}

export class Socket {
    public Changed = new TEvent<string>();
    private socket: SocketIOClient.Socket;

    public initSocket(url: string): void {
        this.socket = socketIo(url);
        this.socket.on("server", (payload: string) => this.onMessage(payload));
    }
    public send(message: Command): void {
        this.socket.emit(message.id, message.payload);
    }
    private onMessage(payload: string) {
        this.Changed.emit(payload);
    }
}