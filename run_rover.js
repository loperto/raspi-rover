const chokidar = require("chokidar");
const express = require('express');
const path = require("path");
const fs = require("fs");
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const os = require('os');
var PiCamera = require('./camera.js');

const workDir = path.join(__dirname, "build");
const imagesBasePath = path.join(workDir, "static", "media");
const photoName = "photo";
let imagePath = null;

console.log("running on os", os.type());

for (let file of fs.readdirSync(imagesBasePath)) {
    if (file.indexOf(photoName) !== -1) {
        imagePath = path.join(imagesBasePath, file);

        var watcher = chokidar.watch(imagePath, {
            persistent: true,
            usePolling: true,
            interval: 10,
        });

        watcher.on('change', function (file) {
            //console.log('change >>> ', file);
            io.emit('server', { for: 'everyone' });
        });

        console.log("Watching changes of image file", imagePath);
        break;
    }
}

app.use(express.static(workDir));

app.get('/', function (req, res) {
    res.sendFile(workDir);
});

http.listen(3000, function () {
    console.log(`listening on *:3000`);
});

io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });
});

if (os.type() === "Linux") {
    console.log("starting camera. file name", imagePath);
    var camera = new PiCamera();
    camera
        .nopreview()
        .baseFolder(imagesBasePath)
        .thumb('0:0:0')
        .timeout(9999999)
        .timelapse(250)
        .width(640)
        .height(480)
        .quality(75)
        .takePicture(path.basename(imagePath));
}