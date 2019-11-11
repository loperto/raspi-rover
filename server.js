"use strict";
const WebSocket = require("ws");
const WebSocketServer = WebSocket.Server;
const VideoStreamer = require("./video-streamer");
const Serial = require("./serial");
const os = require('os');

class Server {
    constructor(server) {
        this.options = {
            width: 960,
            height: 540,
            fps: 12,
        };
        this.new_client = this.new_client.bind(this);
        this.onSerialReady = this.onSerialReady.bind(this);
        this.onSerialMessage = this.onSerialMessage.bind(this);
        this.socketServer = new WebSocketServer({ server });
        console.log("starting video streaming service.");
        this.streamer = new VideoStreamer(this.socketServer, this.options);
        console.log("starting serial.");
        this.serial = null;
        Serial.getAvailablePorts("arduino").then(port => {
            this.serial = new Serial(port && port.path || "/dev/ttyS0", this.onSerialMessage, {
                baudRate: 115200,
                onSerialReady: this.onSerialReady,
            });
        })

        this.socketServer.on('connection', this.new_client);
    }

    onSerialReady() {
        console.log("Serial ready");
    }

    onSerialMessage(data) {
        console.log(data.toString());
        for (let client of this.socketServer.clients) {
            client.
            if (client.readyState === WebSocket.OPEN)
                client.send(data);
        }
    }

    new_client(socket, req) {
        const clientIp = req.connection.remoteAddress;
        console.log(`New client connected. Ip: ${clientIp}`);

        socket.on("message", (command) => {
            console.log('message:', command);
            let obj = JSON.parse(command);

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

        socket.on("close", () => {
            console.log("count clients...");
            this.socketServer.clients.forEach(function each(ws) {
                console.log("client", ws);
            });
            this.streamer.stop_stream();
            console.log('stopping client interval');
        });
    }
};

module.exports = Server;