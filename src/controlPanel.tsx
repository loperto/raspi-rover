import * as React from "react";
import { Socket } from "./socket";
const image = require("./photo.jpg");

export interface Props {

}

export default class ControlPanel extends React.Component<Props> {
    socket: Socket;
    componentDidMount() {
        this.socket = new Socket();
        this.socket.initSocket(window.location.href);
        this.socket.Changed.register(this.socketListener);
    }

    componentWillUnmount() {
        this.socket.Changed.unregister(this.socketListener);
    }

    socketListener = (payload: string) => {
        console.log("serve message:payload", payload);
        this.forceUpdate();
    }

    send = () => {
        this.socket.send({ id: "chat message", payload: "red" });
    }

    render() {
        return (
            <div>
                <img src={`${image}?${new Date().valueOf()}`} style={{ width: 800, height: 600 }} />
                <button className="btn btn-default btn-warning" onClick={this.send}>Invia</button>
            </div>

        );
    }
}