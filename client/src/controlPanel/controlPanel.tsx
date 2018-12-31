import * as React from "react";
import "./controlPanel.css";
import RangeInput from "../common/rangeInput/rangeInput";
import DirectionPanel from "./directionPanel";
import InclinationMonitor from "./inclinationMonitor";
import RoverControl, { ITelemetry } from "../roverControl";

interface IState {
    currentSpeed: number;
    telemetry: ITelemetry | null;
}

export default class ControlPanel extends React.Component<{}, IState> {

    private rover: RoverControl;
    private canvas: HTMLCanvasElement;
    constructor(props: {}) {
        super(props);
        this.state = {
            telemetry: null,
            currentSpeed: 100,
        };
    }

    public componentDidMount() {
        const uri = `ws://pi:8080`;
        this.rover = new RoverControl(this.canvas, "webgl");
        this.rover.connect(uri, this.onCanvasReady);
        this.rover.Messages.register(this.messageListener);
    }

    public componentWillUnMount() {
        this.rover.Messages.unregister(this.messageListener);
        this.rover.disconnect();
    }

    private onCanvasReady = () => {
        this.forceUpdate();
    }

    private messageListener = (telemetry: ITelemetry) => {
        this.setState({ telemetry });
    }

    private led = () => {
        this.rover.send({ type: "led", value: 0 });
    }

    private beep = () => {
        this.rover.send({ type: "beep", value: 300 });
    }

    private forward = () => {
        this.rover.send({ type: "forward", value: 0 });
    }

    private backward = () => {
        this.rover.send({ type: "backward", value: 0 });
    }

    private left = () => {
        this.rover.send({ type: "left", value: 0 });
    }

    private right = () => {
        this.rover.send({ type: "right", value: 0 });
    }

    private stop = () => {
        this.rover.send({ type: "stop", value: 0 });
    }

    private startCamera = () => {
        this.rover.send({ type: "start_camera", value: 0 });
    }

    private stopCamera = () => {
        this.rover.send({ type: "stop_camera", value: 0 });
    }

    private onChangeCameraX = (angle: number) => {
        this.rover.send({ type: "cameraX", value: angle });
    }

    private onChangeCameraY = (angle: number) => {
        this.rover.send({ type: "cameraY", value: angle });
    }

    private onChangeSpeed = (speed: number) => {
        this.rover.send({ type: "speed", value: speed });
        this.setState({ currentSpeed: speed });
    }

    public render() {
        const pitch = this.state.telemetry && (this.state.telemetry.pitch * -1);
        const roll = this.state.telemetry && (this.state.telemetry.roll * -1);
        return (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "black" }}>
                <canvas
                    ref={x => this.canvas = x!}
                    style={{ flex: 1 }} />
                <div style={{ alignSelf: "flex-start" }}>
                    <div>{`Temperature: ${this.state.telemetry && this.state.telemetry.temp.toFixed(2) || "-"}`}</div>
                    <div>{`Distance: ${this.state.telemetry && this.state.telemetry.dist || "-"}`}</div>
                    <div>{`Pitch: ${pitch || "-"}`}</div>
                    <div>{`Roll: ${roll || "-"}`}</div>
                    <div>{`Speed: ${this.state.currentSpeed}`}</div>
                    <InclinationMonitor pitch={pitch || 0} roll={roll || 0} />
                </div>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                    <DirectionPanel
                        onForward={this.forward}
                        onBackward={this.backward}
                        onLeft={this.left}
                        onRight={this.right}
                        onStop={this.stop} />
                    <button
                        type="button"
                        className="btn btn-outline-primary btn-cmd"
                        onChange={(e: any) => console.log(e)}
                        onMouseDown={() => console.log("mouse down")}
                        onMouseUp={() => console.log("mouse up")}
                        onClick={this.led}>
                        <i className="fa fa-circle" /> Led
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-primary btn-cmd"
                        onChange={(e: any) => console.log(e)}
                        onClick={this.beep}>
                        <i className="fa fa-volume-up" /> Beep
                    </button>
                    <button className="btn btn-outline-success btn-cmd"
                        onClick={this.startCamera}>
                        <i className="fa fa-camera" /> Start camera
                    </button>
                    <button
                        className="btn btn-outline-danger btn-cmd"
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
                        max={100}
                        step={15}
                        onChange={this.onChangeCameraY} />
                    <RangeInput
                        label="Speed"
                        initialValue={this.state.currentSpeed}
                        min={100}
                        max={250}
                        step={10}
                        onChange={this.onChangeSpeed} />
                </div>
            </div >
        );
    }
}