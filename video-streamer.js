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
        // this.new_client = this.new_client.bind(this);
        this.start_feed = this.start_feed.bind(this);
        this.stop_feed = this.stop_feed.bind(this);
        this.broadcast = this.broadcast.bind(this);
        // this.wss.on('connection', this.new_client);
    }

    start_feed() {
        if (this.running) {
            console.log("video stream already running!");
        }
        this.readStream = this.get_feed();
        this.readStream = this.readStream.pipe(new Splitter(NALseparator));
        this.readStream.on("data", this.broadcast);
    }

    stop_feed() {
        if (this.running) {
            this.readStream.end();
            this.streamer.kill();
        }
    }

    get_feed() {
        this.running = true;
        var msk = "raspivid -t 0 -o - -w %d -h %d -fps %d";
        var cmd = util.format(msk, this.options.width, this.options.height, this.options.fps);
        console.log(cmd);
        this.streamer = spawn('raspivid', ['-t', '0', '-o', '-', '-w', this.options.width, '-h', this.options.height, '-fps', this.options.fps, '-pf', 'baseline']);
        this.streamer.on("exit", function (code) {
            console.log("Failure", code);
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