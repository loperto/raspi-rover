// @ts-ignore
import * as Avc from "./broadway/Decoder";
// @ts-ignore
import * as YUVWebGLCanvas from "./broadway/YUVWebGLCanvas";
// @ts-ignore
import * as YUVCanvas from "./broadway/YUVCanvas";
// @ts-ignore
import * as Size from "./broadway/Size";
import { TEvent } from './Event';

type CommandType = "start_camera" | "stop_camera" | "cameraY" | "cameraX" | "gunlever" | "speed" | "shot" | "stop" | "right" | "left" | "backward" | "forward" | "beep" | "led2" | "led";
export interface ICommand {
    type: CommandType;
    value: number;
}

export interface ITelemetry {
    dist: number,
    temp: number,
    pitch: number,
    roll: number
}

export default class WebPlayer {
    canvas: HTMLCanvasElement;
    type: string;
    ws: WebSocket | undefined = undefined;
    avc: typeof Avc;
    pktnum: number = 0;
    running: boolean;
    framesList: Uint8Array[];
    refreshInterval: NodeJS.Timeout | null = null;
    Messages = new TEvent<ITelemetry>();

    constructor(canvas: HTMLCanvasElement, canvastype: string) {
        this.canvas = canvas;
        this.type = canvastype;
        this.running = false;
        this.framesList = [];
    }

    shiftFrame = (onCanvasReady: () => void) => {
        if (!this.running)
            return;

        if (this.framesList.length > 10) {
            console.log("Dropping frames", this.framesList.length);
            this.framesList = [];
        }

        var frame = this.framesList.shift();
        if (frame)
            this.avc.decode(frame);

        onCanvasReady();
    }

    initCanvas = (width: number, height: number) => {
        var canvasFactory = this.type == "webgl" || this.type == "YUVWebGLCanvas"
            ? YUVWebGLCanvas
            : YUVCanvas;

        var canvas = new canvasFactory(this.canvas, new Size.default(width, height));
        this.avc.onPictureDecoded = canvas.decode;
    }

    emitTelemetry = (cmd: ITelemetry) => {
        console.log("Incoming request", cmd);
        this.Messages.emit(cmd);
    }

    connect = (url: string, onCanvasReady: () => void) => {
        if (this.ws != undefined) {
            this.ws.close();
            delete this.ws;
        }
        this.ws = new WebSocket(url);
        this.avc = new Avc();
        this.ws.binaryType = "arraybuffer";

        this.ws.onopen = (ws) => {
            this.running = true;
            console.log("Connected to " + url);
            this.initCanvas(960, 540);
            this.sendCommand("start_camera");
        };

        this.ws.onmessage = (evt: MessageEvent) => {
            if (typeof evt.data == "string")
                return this.emitTelemetry(JSON.parse(evt.data));
            this.pktnum++;
            var frame = new Uint8Array(evt.data);
            this.framesList.push(frame);
        };

        this.refreshInterval = setInterval(() => this.shiftFrame(onCanvasReady), 83.33);
        this.ws.onclose = () => {
            this.running = false;
            console.log("WebSocket: Connection closed");
        };
    }

    disconnect = () => {
        this.running = false;
        this.sendCommand("stop_camera");
        clearInterval(this.refreshInterval!);
    }

    sendCommand = (type: CommandType, value?: number) => {
        if (this.running) {
            const commandString = JSON.stringify({ type, value: value ?? 0 });
            console.log("sended command: ", commandString)
            this.ws?.send(commandString);
        }
    }

}