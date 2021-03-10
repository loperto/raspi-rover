"use strict";
const WebSocket = require("ws");
const VideoStreamer = require("./video-streamer");
const Serial = require("./serial");
const os = require("os");

function getDefaultSerialPort(osName) {
    const port = osName === "Linux" ? "/dev/ttyAMA0" : "COM3";
    console.log("Port auto discovery failed try default port:", port, "Operating system:", osName);
    return port;
}
class Server {

    constructor(server) {
        this.options = {
            width: 960,
            height: 540,
            fps: 12,
        };
        this.new_client = this.onClientConnected.bind(this);
        this.onSerialMessage = this.onSerialMessage.bind(this);
        this.onClientConnected = this.onClientConnected.bind(this);
        this.sendCommand = this.sendCommand.bind(this);
        this.onSerialReady = this.onSerialReady.bind(this);
        this.wss = new WebSocket.Server({ server });
        console.log("starting video streaming service.");
        this.streamer = new VideoStreamer(this.wss, this.options);
        console.log("starting serial.");
        this.serial = null;
        Serial.getAvailablePorts("arduino").then(port => {
            const path = port != null ? port.path : getDefaultSerialPort(os.type());
            this.serial = new Serial(path, this.onSerialMessage, {
                baudRate: 115200,
                onReady: this.onSerialReady,
            });
        });

        this.wss.on("connection", this.onClientConnected);
    }

    onSerialReady() {
        console.log("serial opened");
        const pingCommand = [99, 1, '\0'];
        this.sendCommand(pingCommand);
        setInterval(() => this.sendCommand(pingCommand), 9000);
    }

    sendCommand(commandBuffer) {
        console.log("message:", commandBuffer);
        const commandId = commandBuffer[0];
        switch (commandId) {
            case 97:
                this.streamer.start_stream();
                break;
            case 98:
                this.streamer.stop_stream();
                break;
            default:
                if (this.serial != null) {
                    this.serial.write(commandBuffer);
                }
                break;
        }
    }

    onSerialMessage(data) {
        for (let client of this.wss.clients) {
            if (client.readyState === WebSocket.OPEN)
                client.send(data);
        }
    }

    onClientConnected(client, req) {
        const clientIp = req.connection.remoteAddress;
        console.log(`New client connected. Ip: ${clientIp}`);

        client.on("message", (command) => {
            this.sendCommand(command);
        });

        client.on("close", () => {
            this.streamer.stop_stream();
            console.log("stopping client interval");
        });
    }
};

module.exports = Server;