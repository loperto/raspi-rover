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

console.log("running on os", os.type());

for (let file of fs.readdirSync(imagesBasePath)) {
    if (file.indexOf(photoName) !== -1) {
        let imagePath = path.join(imagesBasePath, file);

        var watcher = chokidar.watch(imagePath, {
            persistent: true,
            usePolling: true,
            interval: 10,
        });

        watcher.on('change', function (file) {
            console.log('change >>> ', file);
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

// app.get('/', function (req, res) {
//     res.sendFile(__dirname + "/index.html");
// });

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
    console.log("starting camera");
    var camera = new PiCamera();
    // start image capture
    camera
        .nopreview()
        .baseFolder(imagesBasePath)
        .thumb('0:0:0') // dont include thumbnail version
        .timeout(9999999) // never end
        .timelapse(250) // how often we should capture an image
        .width(640)
        .height(480)
        .quality(75)
        .takePicture(photoName);
}