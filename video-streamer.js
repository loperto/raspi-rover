"use strict";

const spawn = require("child_process").spawn;
const util = require("util");
const Splitter = require("stream-split");
const NALseparator = Buffer.from([0, 0, 0, 1]);//NAL break
const os = require("os");

class VideoStreamer {
    constructor(ws, options) {
        this.readStream;
        this.streamer;
        this.ws = ws;
        this.options = options;
        this.running = false;
        this.start_stream = this.start_stream.bind(this);
        this.stop_stream = this.stop_stream.bind(this);
        this.broadcast = this.broadcast.bind(this);
    }

    start_stream() {
        // if (os.type() !== "Linux") {
        //     console.log("video stream not available on windows");
        //     return;
        // }
        if (this.running) {
            console.log("video stream already running!");
            return;
        }
        this.readStream = this.get_stream();
        this.readStream = this.readStream.pipe(new Splitter(NALseparator));
        this.readStream.on("data", this.broadcast);
    }

    stop_stream() {
        if (this.running) {
            this.readStream.end();
            this.streamer.kill();
            this.running = false;
        }
    }

    get_stream() {
        this.running = true; 6
        if (os.type() !== "Linux") {
            this.streamer = spawn('ping', ['192.168.178.41', '-t']);
        }
        else {

            this.streamer = spawn('raspivid', ['-t', '0', '-o', '-', '-n', '-rot', '180', '-w', this.options.width, '-h', this.options.height, '-fps', this.options.fps, '-pf', 'baseline']);
        }
        this.streamer.on("exit", function (code) {
            if (code)
                console.log(`Video streamer failure. Error code: ${code}`);
            else
                console.log("Video streamer stopped");
        });

        return this.streamer.stdout;
    }

    broadcast(data) {
        this.ws.clients.forEach(function (socket) {
            if (socket.buzy)
                return;

            socket.buzy = true;
            socket.buzy = false;

            socket.send(Buffer.concat([NALseparator, data]), { binary: true }, function ack(error) {
                socket.buzy = false;
            });
        });
    }
};

module.exports = VideoStreamer;