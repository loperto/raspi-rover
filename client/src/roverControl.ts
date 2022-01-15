// @ts-ignore
import * as Avc from "./broadway/Decoder";
// @ts-ignore
import * as YUVWebGLCanvas from "./broadway/YUVWebGLCanvas";
// @ts-ignore
import * as YUVCanvas from "./broadway/YUVCanvas";
// @ts-ignore
import * as Size from "./broadway/Size";
import { TEvent } from './Event';

export enum CommandType {
    Forward = 1,
    Backward = 2,
    Left = 3,
    Right = 4,
    Stop = 5,
    SetSpeed = 6,
    CameraX = 7,
    CameraY = 8,
    Sound = 9,
    Led1 = 10,
    GunShot = 11,
    GunLever = 12,
    Led2 = 13,
    StartCamera = 97,
    StopCamera = 98,
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
            this.sendCommand(CommandType.StartCamera);
        };

        this.ws.onmessage = (message: MessageEvent<ArrayBuffer>) => {
            if (message.data == null) return;
            if (typeof message.data == "string")
                console.log(message.data);

            const d = new Int8Array(message.data);
            if (d.length === 18 && d[0] === '!'.charCodeAt(0) && d[d.length - 1] === '$'.charCodeAt(0)) {
                var dist = Buffer.from(d.slice(1, 5)).readFloatLE(0);
                var temp = Buffer.from(d.slice(5, 9)).readFloatLE(0);
                var pitch = Buffer.from(d.slice(9, 13)).readFloatLE(0);
                var roll = Buffer.from(d.slice(13, 17)).readFloatLE(0);
                this.emitTelemetry({ dist, temp, roll, pitch })
            }
            else {
                this.pktnum++;
                var frame = new Uint8Array(message.data);
                this.framesList.push(frame);
            }
        };

        this.refreshInterval = setInterval(() => this.shiftFrame(onCanvasReady), 83.33);
        this.ws.onclose = () => {
            this.running = false;
            console.log("WebSocket: Connection closed");
        };
    }

    disconnect = () => {
        this.running = false;
        this.sendCommand(CommandType.StopCamera);
        clearInterval(this.refreshInterval!);
    }



    sendCommand = (type: CommandType, value?: number) => {
        if (this.running) {
            console.log("sended command: ", JSON.stringify({ type: CommandType[type], value: value ?? 0 }))
            const v = value == null || isNaN(value) ? 1 : Math.max(value, 1);
            var buffer = Int8Array.from([type, v, '\0'.charCodeAt(0)]);
            this.ws?.send(buffer);
        }
    }

}

