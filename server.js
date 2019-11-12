"use strict";
const WebSocket = require("ws");
const VideoStreamer = require("./video-streamer");
const Serial = require("./serial");
const os = require("os");

function getDefaultSerialPort(osName) {
    return osName === "Linux" ? "/dev/ttyS0" : "COM4";
}
class Server {
    constructor(server) {
        this.options = {
            width: 960,
            height: 540,
            fps: 12,
        };
        this.new_client = this.onClientConnected.bind(this);
        this.onSerialReady = this.onSerialReady.bind(this);
        this.onSerialMessage = this.onSerialMessage.bind(this);
        this.wss = new WebSocket.Server({ server });
        console.log("starting video streaming service.");
        this.streamer = new VideoStreamer(this.wss, this.options);
        console.log("starting serial.");
        this.serial = null;
        Serial.getAvailablePorts("arduino").then(port => {
            const path = port != null ? port.path : getDefaultSerialPort(os.osName);
            this.serial = new Serial(path, this.onSerialMessage, {
                baudRate: 115200,
                onSerialReady: this.onSerialReady,
            });
        })

        this.wss.on("connection", this.onClientConnected);
    }

    onSerialReady() {
        console.log("Serial ready");
    }

    onSerialMessage(data) {
        console.log(data.toString());
        for (let client of this.wss.clients) {
            if (client.readyState === WebSocket.OPEN)
                client.send(data.toString());
        }
    }

    onClientConnected(client, req) {
        const clientIp = req.connection.remoteAddress;
        console.log(`New client connected. Ip: ${clientIp}`);

        client.on("message", (command) => {
            console.log("message:", command);
            const obj = JSON.parse(command);

            if (obj.type == "start_camera") {
                // this.streamer.start_stream();
            }
            else if (obj.type == "stop_camera") {
                // this.streamer.stop_stream();
            }
            else {
                if (this.serial)
                    this.serial.write(command);
            }
        });

        client.on("close", () => {
            // this.streamer.stop_stream();
            console.log("stopping client interval");
        });
    }
};

module.exports = Server;