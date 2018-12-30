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
        this.socketServer = new WebSocketServer({ server });
        this.streamer = new VideoStreamer(this.socketServer, this.options);
        console.log("starting serial.");
        this.serial = new Serial(os.type());
        this.new_client = this.new_client.bind(this);
        this.socketServer.on('connection', this.new_client);
    }

    new_client(socket, req) {
        var that = this;
        const clientIp = req.connection.remoteAddress;
        console.log(`New client connected. Ip: ${clientIp}`);

        this.serial.onMessage((data) => {
            if (socket.readyState === WebSocket.OPEN)
                socket.send(data);
        });

        socket.send(JSON.stringify({
            action: "init",
            width: this.options.width,
            height: this.options.height,
        }));

        socket.on("message", function (command) {
            console.log('message:', command);
            let obj = JSON.parse(command);

            if (obj.type == "start_camera") {
                that.streamer.start_feed();
            }
            else if (obj.type == "stop_camera") {
                that.streamer.stop_feed();
            }
            else {
                if (that.serial)
                    that.serial.write(command);
            }
        });

        socket.on("close", function () {
            console.log("count clients...");
            that.socketServer.clients.forEach(function each(ws) {
                console.log("client", ws);
            });
            that.streamer.stop_feed();
            console.log('stopping client interval');
        });
    }
};

module.exports = Server;