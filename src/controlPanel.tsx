import * as React from "react";
import { Socket } from "./socket";
const image = require("./photo.jpg");

export interface Props {

}

export interface State {
    messages: string[];
}

export default class ControlPanel extends React.Component<Props, State> {

    socket: Socket;
    constructor(props: Props) {
        super(props);
        this.state = {
            messages: [],
        };
    }

    componentDidMount() {
        this.socket = new Socket();
        this.socket.initSocket(window.location.href);
        this.socket.ImageChanged.register(this.imageListener);
        this.socket.Messages.register(this.messageListener);
    }

    componentWillUnmount() {
        this.socket.ImageChanged.unregister(this.imageListener);
        this.socket.Messages.unregister(this.messageListener);
    }

    messageListener = (payload: string) => {
        console.log("server message:", payload);
        let messages = [...this.state.messages, payload];
        this.setState({ messages });
    }

    imageListener = () => {
        console.log("image refreshed!");
        this.forceUpdate();
    }

    send = () => {
        this.socket.send({ id: "client_command", payload: "red" });
    }
    startCamera = () => {
        this.socket.send({ id: "client_command", payload: "start_camera" });
    }
    stopCamera = () => {
        this.socket.send({ id: "client_command", payload: "stop_camera" });
    }

    render() {
        return (
            <div>
                <img src={`${image}?${new Date().valueOf()}`} style={{ width: 800, height: 600 }} />
                <button className="btn btn-default btn-info" onClick={this.send}>Invia red</button>
                <button className="btn btn-default btn-success" onClick={this.startCamera}>Start camera</button>
                <button className="btn btn-default btn-danger" onClick={this.stopCamera}>Stop camera</button>
            </div>

        );
    }
}