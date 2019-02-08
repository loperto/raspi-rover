import * as React from "react";
import { SFC } from 'react';
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

export let TelemetryWidget: SFC<{ icon: string, value: string }> = ({ icon, value, children }) => {
    const height: number = 30;
    return (
        <div className="text-center" style={{ margin: 5, color: "white" }}>
            <div style={{ backgroundColor: "blue", padding: 5, width: 30, height: height, display: "inline-block" }}>
                <i className={icon} />
            </div>
            <div style={{ backgroundColor: "black", padding: 5, height: height, minWidth: 40, display: "inline-block" }}>
                <span style={{ fontSize: 12 }}>{value}</span>
            </div>
        </div >
    );
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

    isMobileDevice() {
        return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
    };

    resizeCanvas = () => {
        this.canvas.style.width = window.innerWidth + "px";
        setTimeout(() => {
            this.canvas.style.height = window.innerHeight + "px";
        }, 0);
    };

    public componentDidMount() {
        window.onresize = this.resizeCanvas;
        this.resizeCanvas();
        this.rover = new RoverControl(this.canvas, "webgl");
        if (process.env.NODE_ENV == "production") {
            const uri = `ws://${window.location.hostname}:${window.location.port}`;
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

    // private onChangeSpeed = (speed: number) => {
    //     this.rover.send({ type: "speed", value: speed });
    //     this.setState({ currentSpeed: speed });
    // }

    public onChangeCamera = (x: number, y: number) => {
        console.log("camera", "X:", x, "Y:", y);
        this.rover.send({ type: "cameraX", value: x });
        this.rover.send({ type: "cameraY", value: y })
    }

    public render() {
        const pitch = this.state.telemetry && (this.state.telemetry.pitch * -1);
        const roll = this.state.telemetry && (this.state.telemetry.roll * -1);
        return (
            <div>
                <canvas ref={x => this.canvas = x!} style={{ backgroundColor: "#36474f" }} />
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
                        <TelemetryWidget icon="fas fa-thermometer-half" value={this.state.telemetry && this.state.telemetry.temp.toFixed(2) || "-"} />
                        <TelemetryWidget icon="fas fa-satellite-dish" value={this.state.telemetry && this.state.telemetry.dist.toString() || "-"} />
                        <TelemetryWidget icon="fas fa-tachometer-alt" value={this.state.currentSpeed.toString()} />
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
                            xValues={{ min: 0, max: 180 }}
                            yValues={{ min: 0, max: 100 }}
                            initialX={90}
                            initialY={0}
                            onChange={this.onChangeCamera}
                            color="#ff3333"
                            icon="fas fa-video"
                            stacked
                        />
                        {/*
                            <RangeInput
                                label="Speed"
                                initialValue={this.state.currentSpeed}
                                min={100}
                                max={250}
                                step={10}
                                onChange={this.onChangeSpeed}
                            />
                            */}
                    </div>
                </div>
            </div >
        );
    }
}