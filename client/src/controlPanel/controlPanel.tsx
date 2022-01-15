import * as React from "react";
import "./controlPanel.css";
import DirectionPanel from "./DirectionPanel";
import InclinationMonitor from "./InclinationMonitor";
import RoverControl, { CommandType, ITelemetry } from "../RoverControl";
import Joystick from '../joystick/Joystick';
import DirectionJoystick from './DirectionJoystick';
import RangeInput from "../rangeInput/rangeInput";
import { TelemetryWidget } from "./TelemetryWidget";
import CameraJoystick from "./CameraJoystick";

interface IState {
    currentSpeed: number;
    gunLever: number;
    ledBrightness: number;
    led2Brightness: number;
    settingsShowed: boolean;
    telemetry: ITelemetry | null;
}

export default class ControlPanel extends React.Component<{}, IState> {
    rover: RoverControl | null;
    canvas: HTMLCanvasElement | null;
    constructor(props: {}) {
        super(props);
        this.state = {
            telemetry: null,
            currentSpeed: 100,
            gunLever: 180,
            ledBrightness: 0,
            led2Brightness: 0,
            settingsShowed: false,
        };
        this.rover = null;
        this.canvas = null;
    }

    isMobileDevice() {
        return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
    };

    componentDidMount() {
        this.rover = new RoverControl(this.canvas!, "webgl");
        // if (process.env.NODE_ENV == "production") {
        //const uri = `ws://${window.location.hostname}:${window.location.port}`;
        // const uri = `ws://localhost:8080`;
        const uri = `ws://pi1:8080`;
        this.rover.connect(uri, this.onCanvasReady);
        this.rover.Messages.register(this.messageListener);
        // }
    }

    componentWillUnmount() {
        this.rover!.Messages.unregister(this.messageListener);
        this.rover!.disconnect();
    }

    onCanvasReady = () => {
        this.forceUpdate();
    }

    messageListener = (telemetry: ITelemetry) => {
        this.setState({ telemetry });
    }

    led = (ledBrightness: number) => {
        this.setState({ ledBrightness });
        this.rover?.sendCommand(CommandType.Led1, ledBrightness);
    }

    led2 = (led2Brightness: number) => {
        this.setState({ led2Brightness });
        this.rover?.sendCommand(CommandType.Led2, led2Brightness);
    }

    beep = () => {
        this.rover?.sendCommand(CommandType.Sound, 255);
    }

    forward = () => {
        this.rover?.sendCommand(CommandType.Forward);
    }

    backward = () => {
        this.rover?.sendCommand(CommandType.Backward);
    }

    left = () => {
        this.rover?.sendCommand(CommandType.Left);
    }

    right = () => {
        this.rover?.sendCommand(CommandType.Right);
    }

    stop = () => {
        this.rover?.sendCommand(CommandType.Stop);
    }

    shot = () => {
        this.rover?.sendCommand(CommandType.GunShot);
    }

    onChangeSpeed = (speed: number) => {
        this.rover?.sendCommand(CommandType.SetSpeed, speed);
        this.setState({ currentSpeed: speed });
    }

    onChangeGunLever = (lever: number) => {
        this.rover?.sendCommand(CommandType.GunLever, lever);
        this.setState({ gunLever: lever });
    }

    onChangeCamera = (x: number, y: number) => {
        this.rover?.sendCommand(CommandType.CameraX, x);
        this.rover?.sendCommand(CommandType.CameraY, y)
    }

    render() {
        const pitch = this.state.telemetry && (this.state.telemetry.pitch * -1);
        const roll = this.state.telemetry && (this.state.telemetry.roll * -1);
        const { currentSpeed, settingsShowed, led2Brightness, ledBrightness, gunLever } = this.state;
        return (
            <div className="vw-100 vh-100 d-flex flex-column justify-content-between">
                <canvas ref={x => this.canvas = x!}
                    style={{ backgroundColor: "#36474f", position: "absolute", zIndex: -1 }}
                    className="vw-100 vh-100"
                />
                <div className="d-flex justify-content-center align-items-center">
                    <TelemetryWidget
                        icon="fas fa-thermometer-half"
                        value={this.state.telemetry && this.state.telemetry.temp.toFixed(2) || "-"}
                    />
                    <TelemetryWidget
                        icon="fas fa-satellite-dish"
                        value={this.state.telemetry && this.state.telemetry.dist.toString() || "-"}
                    />
                    <TelemetryWidget
                        icon="fas fa-tachometer-alt"
                        value={this.state.currentSpeed.toString()}
                    />
                    <InclinationMonitor
                        pitch={pitch || 0}
                        roll={roll || 0}
                    />
                </div>
                <div className="d-flex flex-column justify-content-center">
                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                        <div>
                            <DirectionPanel
                                onForward={this.forward}
                                onBackward={this.backward}
                                onLeft={this.left}
                                onRight={this.right}
                                onStop={this.stop}
                            />
                        </div>
                        {settingsShowed && <div className="d-flex justify-content-between text-white">
                            <div className="m-2">
                                <RangeInput
                                    label="Speed"
                                    initialValue={currentSpeed}
                                    min={100}
                                    max={250}
                                    step={10}
                                    onChange={this.onChangeSpeed}
                                />
                            </div>
                            <div className="m-2">
                                <RangeInput
                                    label="Gun Lever"
                                    initialValue={gunLever}
                                    min={60}
                                    max={140}
                                    step={10}
                                    onChange={this.onChangeGunLever}
                                />
                            </div>
                            <div className="m-2">
                                <RangeInput
                                    label="Led 1"
                                    initialValue={ledBrightness}
                                    min={50}
                                    max={255}
                                    step={10}
                                    onChange={this.led}
                                />
                            </div>
                            <div className="m-2">
                                <RangeInput
                                    label="Led 2"
                                    initialValue={led2Brightness}
                                    min={50}
                                    max={255}
                                    step={10}
                                    onChange={this.led2}
                                />
                            </div>
                        </div>}
                        <div className="d-flex flex-column">
                            <button
                                type="button"
                                title="toggle led"
                                className="btn btn-outline-primary btn-cmd"
                                onClick={() => this.led(ledBrightness > 0 ? 0 : 110)}>
                                <i className="far fa-lightbulb" />
                            </button>
                            <button
                                type="button"
                                title="toggle led"
                                className="btn btn-outline-secondary btn-cmd"
                                onClick={() => this.led2(led2Brightness > 0 ? 0 : 110)}>
                                <i className="far fa-lightbulb" />
                            </button>
                            <button
                                type="button"
                                title="reproduce sound"
                                className="btn btn-outline-primary btn-cmd"
                                onClick={this.beep}>
                                <i className="fas fa-volume-up" />
                            </button>
                            <button
                                type="button"
                                title="gun shot"
                                className="btn btn-outline-danger btn-cmd"
                                onClick={this.shot}>
                                <i className="fas fa-bomb" />
                            </button>
                            <button
                                type="button"
                                title="settings"
                                className="btn btn-outline-secondary btn-cmd"
                                onClick={() => this.setState({ settingsShowed: !settingsShowed })}>
                                <i className="fas fa-cog" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="d-flex justify-content-between me-5 ms-5 p-0">
                    <DirectionJoystick
                        onForward={this.forward}
                        onBackward={this.backward}
                        onLeft={this.left}
                        onRight={this.right}
                        onStop={this.stop}
                    />
                    <CameraJoystick
                        onMove={this.onChangeCamera}
                    />
                </div>
            </div>
        );
    }
}