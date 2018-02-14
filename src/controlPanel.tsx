import * as React from "react";
import { Socket } from "./socket";
const image = require("./photo.jpg");

export interface Props {

}

interface State {
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

    led = () => {
        this.socket.send({ id: "client_command", payload: { type: "led", value: 0 } });
    }

    forward = () => {
        this.socket.send({ id: "client_command", payload: { type: "forward", value: 0 } });
    }

    backward = () => {
        this.socket.send({ id: "client_command", payload: { type: "backward", value: 0 } });
    }

    left = () => {
        this.socket.send({ id: "client_command", payload: { type: "left", value: 0 } });
    }

    right = () => {
        this.socket.send({ id: "client_command", payload: { type: "right", value: 0 } });
    }

    stop = () => {
        this.socket.send({ id: "client_command", payload: { type: "stop", value: 0 } });
    }

    startCamera = () => {
        this.socket.send({ id: "client_command", payload: { type: "start_camera", value: 0 } });
    }

    stopCamera = () => {
        this.socket.send({ id: "client_command", payload: { type: "stop_camera", value: 0 } });
    }

    cameraX = () => {
        this.socket.send({ id: "client_command", payload: { type: "cameraX", value: 0 } });
    }

    cameraY = () => {
        this.socket.send({ id: "client_command", payload: { type: "cameraY", value: 0 } });
    }

    render() {
        return (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <img src={`${image}?${new Date().valueOf()}`} style={{ width: 800, height: 600, flex: 1, margin: "auto" }} />
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", }}>
                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={this.forward}>
                        <i className="fa fa-arrow-up" />
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={this.backward}>
                        <i className="fa fa-arrow-down" />
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={this.left}>
                        <i className="fa fa-arrow-left" />
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={this.right}>
                        <i className="fa fa-arrow-right" />
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={this.stop}>
                        <i className="fa fa-stop" />
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={this.led}>
                        <i className="fa fa-circle" /> Led
                    </button>
                    <button className="btn btn-outline-success"
                        onClick={this.startCamera}>
                        <i className="fa fa-camera" /> Start camera
                    </button>
                    <button
                        className="btn btn-outline-danger"
                        onClick={this.stopCamera}>
                        <i className="fa fa-camera" /> Stop camera
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={this.cameraX}>
                        CameraX 1
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={this.cameraY}>
                        CameraX 2
                    </button>
                </div>
            </div>
        );
    }
}