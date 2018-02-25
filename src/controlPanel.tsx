import * as React from "react";
import { Socket } from "./socket";
import RangeInput from "./common/rangeInput/rangeInput";
import DirectionPanel from "./directionPanel";
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
        this.socket.send({ type: "led", value: 0 });
    }

    forward = () => {
        this.socket.send({ type: "forward", value: 0 });
    }

    backward = () => {
        this.socket.send({ type: "backward", value: 0 });
    }

    left = () => {
        this.socket.send({ type: "left", value: 0 });
    }

    right = () => {
        this.socket.send({ type: "right", value: 0 });
    }

    stop = () => {
        this.socket.send({ type: "stop", value: 0 });
    }

    startCamera = () => {
        this.socket.send({ type: "start_camera", value: 0 });
    }

    stopCamera = () => {
        this.socket.send({ type: "stop_camera", value: 0 });
    }

    onChangeCameraX = (angle: number) => {
        this.socket.send({ type: "cameraX", value: angle });
    }

    onChangeCameraY = (angle: number) => {
        this.socket.send({ type: "cameraY", value: angle });
    }


    render() {
        return (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <img src={`${image}?${new Date().valueOf()}`} style={{ width: 800, height: 600, flex: 1, margin: "auto" }} />
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                    <DirectionPanel
                        onForward={this.forward}
                        onBackward={this.backward}
                        onLeft={this.left}
                        onRight={this.right}
                        onStop={this.stop} />
                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onChange={(e: any) => console.log(e)}
                        onMouseDown={() => console.log("mouse down")}
                        onMouseUp={() => console.log("mouse up")}
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

                </div>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                    <RangeInput
                        label="camera X"
                        min={0}
                        max={180}
                        step={30}
                        initialValue={90}
                        onChange={this.onChangeCameraX} />
                    <RangeInput
                        label="camera Y"
                        min={0}
                        max={180}
                        step={10}
                        onChange={this.onChangeCameraY} />
                </div>
            </div>
        );
    }
}