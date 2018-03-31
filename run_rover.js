const chokidar = require("chokidar");
const express = require('express');
const path = require("path");
const fs = require("fs");
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const os = require('os');
var PiCamera = require('./camera.js');
var Serial = require('./serial.js');

const osName = os.type();
const workDir = path.join(__dirname, "build");
const imagesBasePath = path.join(workDir, "static", "media");
const photoName = "photo";
let imagePath = null;
let serial = null;
let camera = new PiCamera();

console.log("running on os", osName);

for (let file of fs.readdirSync(imagesBasePath)) {
    if (file.indexOf(photoName) !== -1) {
        imagePath = path.join(imagesBasePath, file);

        var watcher = chokidar.watch(imagePath, {
            persistent: true,
            usePolling: true,
            interval: 10,
        });

        watcher.on('change', function (file) {
            io.emit('refresh_image', { for: 'everyone' });
        });

        console.log("Watching changes of image file", imagePath);
        break;
    }
}

console.log("starting serial.");
serial = new Serial(osName);

serial.onMessage((data) => {
    console.log("from arduino:", data);
    io.emit('rover_message', data);
});


app.use(express.static(workDir));

app.get('/', function (req, res) {
    res.sendFile(workDir);
});

http.listen(4000, function () {
    console.log(`listening on *:4000`);
});

io.on('connection', function (socket) {
    socket.on('client_command', function (command) {
        console.log('message:', command);
        let obj = JSON.parse(command);
        if (obj.type == "start_camera") {
            console.log("starting camera. file name", imagePath);
            camera.startCamera(imagePath);
        }
        else if (obj.type == "stop_camera") {
            console.log("stopping camera.");
            camera.stopCamera();
        }
        else {
            if (serial)
                serial.write(command);
        }
    });
});

//setInterval(() => io.emit('server', new Date().valueOf().toString()), 2000);

