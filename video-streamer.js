"use strict";

const spawn = require("child_process").spawn;
const util = require("util");
const Splitter = require("stream-split");
const NALseparator = new Buffer([0, 0, 0, 1]);//NAL break

class VideoStreamer {
    constructor(ws, options) {
        this.readStream;
        this.streamer;
        this.ws = ws;
        this.options = options;
        this.running = false;
        this.start_feed = this.start_stream.bind(this);
        this.stop_feed = this.stop_stream.bind(this);
        this.broadcast = this.broadcast.bind(this);
    }

    start_stream() {
        if (this.running) {
            console.log("video stream already running!");
        }
        this.readStream = this.get_stream();
        this.readStream = this.readStream.pipe(new Splitter(NALseparator));
        this.readStream.on("data", this.broadcast);
    }

    stop_stream() {
        if (this.running) {
            this.readStream.end();
            this.streamer.kill();
        }
    }

    get_stream() {
        this.running = true;
        var msk = "raspivid -t 0 -o - -n -w %d -h %d -fps %d";
        var cmd = util.format(msk, this.options.width, this.options.height, this.options.fps);
        console.log("exe command: ", cmd);
        this.streamer = spawn('raspivid', ['-t', '0', '-o', '-', '-n', '-w', this.options.width, '-h', this.options.height, '-fps', this.options.fps, '-pf', 'baseline']);
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