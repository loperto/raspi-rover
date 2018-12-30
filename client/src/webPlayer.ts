import * as Avc from "./broadway/Decoder";
import * as YUVWebGLCanvas from "./broadway/YUVWebGLCanvas";
import * as YUVCanvas from "./broadway/YUVCanvas";
import * as Size from "./broadway/Size";
import { TEvent } from './Event';

export interface ICommand {
    type: string;
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
    ws: WebSocket;
    avc: typeof Avc;
    pktnum: number = 0;
    running: boolean;
    framesList: Uint8Array[];
    refreshInterval: NodeJS.Timer;
    public Messages = new TEvent<ITelemetry>();

    constructor(canvas: HTMLCanvasElement, canvastype: string) {
        this.canvas = canvas;
        this.type = canvastype;
        this.running = false;
        this.framesList = [];
        this.avc = new Avc();
    }

    connect = (url: string, onCanvasReady: () => void) => {
        if (this.ws != undefined) {
            this.ws.close();
            delete this.ws;
        }
        this.ws = new WebSocket(url);
        this.ws.binaryType = "arraybuffer";

        this.ws.onopen = (ws) => {
            console.log("Connected to " + url);
            this.send({ type: "start_camera", value: 0 });
        };

        this.ws.onmessage = (evt: any) => {
            if (typeof evt.data == "string")
                return this.cmd(JSON.parse(evt.data));
            this.pktnum++;
            var frame = new Uint8Array(evt.data);
            this.framesList.push(frame);
        };

        this.running = true;

        this.refreshInterval = setInterval(() => this.shiftFrame(onCanvasReady), 83.33);
        this.ws.onclose = () => {
            this.running = false;
            console.log("WSAvcPlayer: Connection closed")
        };

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

        var canvas = new canvasFactory(this.canvas, new Size(width, height));
        this.avc.onPictureDecoded = canvas.decode;
    }

    cmd = (cmd: any) => {
        console.log("Incoming request", cmd);
        if (cmd.action == "init") {
            this.initCanvas(cmd.width, cmd.height);
            this.canvas.width = cmd.width;
            this.canvas.height = cmd.height;
        }
        else {
            this.Messages.emit(cmd);
        }
    }

    disconnect = () => {
        this.running = false;
        this.send({ type: "stop_camera", value: 0 });
        // this.ws.close();
        clearInterval(this.refreshInterval);
    }

    send = (command: ICommand) => {
        this.ws.send(JSON.stringify(command));
    }
}