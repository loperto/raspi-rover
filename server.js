"use strict";
const WebSocket = require("ws");
const VideoStreamer = require("./video-streamer");
const Serial = require("./serial");
const os = require("os");

function getDefaultSerialPort(osName) {
    const port = osName === "Linux" ? "/dev/ttyAMA0" : "COM4";
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
        this.sendCommand("{\"type\":\"ready\",\"value\":0}");
    }


    sendCommand(jsonCommand) {
        console.log("message:", jsonCommand);
        const command = JSON.parse(jsonCommand);
        let commandId = null;
        switch (command.type) {
            case "start_camera":
                this.streamer.start_stream();
                break;
            case "stop_camera":
                this.streamer.stop_stream();
                break;
            case "forward":
                commandId = 1;
                break;
            case "backward":
                commandId = 2;
                break;
            case "left":
                commandId = 3;
                break;
            case "right":
                commandId = 4;
                break;
            case "stop":
                commandId = 5;
                break;
            case "speed":
                commandId = 6;
                break;
            case "cameraX":
                commandId = 7;
                break;
            case "cameraY":
                commandId = 8;
                break;
            case "beep":
                commandId = 9;
                break;
            case "led":
                commandId = 10;
                break;
            case "shot":
                commandId = 11;
                break;
            case "gunlever":
                commandId = 12;
                break;
            case "ready":
                commandId = 99;
                break;
        }
        if (this.serial != null && commandId != null) {
            const value = isNaN(command.value) ? 0 : command.value;
            this.serial.write([commandId, value, '!']);
        }
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
            this.sendCommand(command);
        });

        client.on("close", () => {
            this.streamer.stop_stream();
            console.log("stopping client interval");
        });
    }
};

module.exports = Server;