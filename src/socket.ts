import * as socketIo from "socket.io-client";
import { TEvent, Event } from "./Events";

export interface Command {
    id: string;
    payload: { type: string, value: number };
}

export class Socket {
    public Messages = new TEvent<string>();
    public ImageChanged = new Event();
    private socket: SocketIOClient.Socket;

    public initSocket(url: string): void {
        this.socket = socketIo(url);
        this.socket.on("refresh_image", () => this.onImageChange());
        this.socket.on("rover_message", (payload: string) => this.onMessage(payload));
    }

    public send(command: Command): void {
        this.socket.emit(command.id, JSON.stringify(command));
    }

    private onMessage(payload: string) {
        this.Messages.emit(payload);
    }

    private onImageChange() {
        this.ImageChanged.emit();
    }
}