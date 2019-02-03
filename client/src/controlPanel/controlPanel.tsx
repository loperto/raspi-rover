import * as React from "react";
import "./controlPanel.css";
// import RangeInput from "../common/rangeInput/rangeInput";
import DirectionPanel from "./directionPanel";
import InclinationMonitor from "./inclinationMonitor";
import RoverControl, { ITelemetry } from "../roverControl";
import Joystick from './joystick';
import DirectionJoystick from './directionJoystick';

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

    resizeCanvas = () => {
        this.canvas.style.width = window.innerWidth + "px";
        setTimeout(() => {
            this.canvas.style.height = window.innerHeight + "px";
        }, 0);
    };

    public componentDidMount() {
        window.onresize = this.resizeCanvas;
        this.resizeCanvas();
        if (process.env.NODE_ENV == "production") {
            const uri = `ws://pi:8080`;
            this.rover = new RoverControl(this.canvas, "webgl");
            this.rover.connect(uri, this.onCanvasReady);
            this.rover.Messages.register(this.messageListener);
        }
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

    // private onChangeCameraX = (angle: number) => {
    //     this.rover.send({ type: "cameraX", value: angle });
    // }

    // private onChangeCameraY = (angle: number) => {
    //     this.rover.send({ type: "cameraY", value: angle });
    // }

    // private onChangeSpeed = (speed: number) => {
    //     this.rover.send({ type: "speed", value: speed });
    //     this.setState({ currentSpeed: speed });
    // }

    public onChangeCamera = (x: number, y: number) => {
        console.log("camera", "X:", x, "Y:", y);
    }

    public render() {
        const pitch = this.state.telemetry && (this.state.telemetry.pitch * -1);
        const roll = this.state.telemetry && (this.state.telemetry.roll * -1);
        return (
            <div>
                <canvas ref={x => this.canvas = x!} />
                <div>
                    <div style={{
                        position: "absolute",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        width: "100%",
                        top: 0,
                        left: 0
                    }}>
                        <div><i className="fas fa-thermometer-half" /> {this.state.telemetry && this.state.telemetry.temp.toFixed(2) || "-"}</div>
                        <div><i className="fas fa-satellite-dish" /> {this.state.telemetry && this.state.telemetry.dist || "-"}</div>
                        <div><i className="fas fa-tachometer-alt" /> {this.state.currentSpeed}</div>
                        <InclinationMonitor pitch={pitch || 0} roll={roll || 0} />
                    </div>
                    <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center"
                    }}>
                        <DirectionPanel
                            onForward={this.forward}
                            onBackward={this.backward}
                            onLeft={this.left}
                            onRight={this.right}
                            onStop={this.stop} />
                        <button
                            type="button"
                            title="toggle led"
                            className="btn btn-outline-primary btn-cmd"
                            onClick={this.led}>
                            <i className="far fa-lightbulb" />
                        </button>
                        <button
                            type="button"
                            title="reproduce sound"
                            className="btn btn-outline-primary btn-cmd"
                            onClick={this.beep}>
                            <i className="fas fa-volume-up" />
                        </button>
                    </div>
                    <div style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        display: "flex",
                        flexDirection: "row",
                        width: "100%",
                        justifyContent: "space-between"
                    }}>
                        <DirectionJoystick
                            onForward={this.forward}
                            onBackward={this.backward}
                            onLeft={this.left}
                            onRight={this.right}
                            onStop={this.stop}
                        />
                        <Joystick
                            xValues={{ min: 0, max: 100 }}
                            yValues={{ min: 0, max: 100 }}
                            initialX={50}
                            initialY={0}
                            onChange={this.onChangeCamera}
                            color="#ff3333"
                            icon="fas fa-video"
                        />
                        {/* <div className="row">
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <RangeInput
                                    label="camera X"
                                    min={0}
                                    max={180}
                                    step={30}
                                    initialValue={90}
                                    onChange={this.onChangeCameraX}
                                />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <RangeInput
                                    label="camera Y"
                                    min={0}
                                    max={100}
                                    step={15}
                                    onChange={this.onChangeCameraY}
                                />
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-4">
                                <RangeInput
                                    label="Speed"
                                    initialValue={this.state.currentSpeed}
                                    min={100}
                                    max={250}
                                    step={10}
                                    onChange={this.onChangeSpeed}
                                />
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        );
    }
}