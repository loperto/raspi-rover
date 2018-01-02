const chokidar = require("chokidar");
const express = require('express');
const path = require("path");
const fs = require("fs");
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const workDir = path.join(__dirname, "build");
const imagesBasePath = path.join(workDir, "static", "media");
const photoName = "scopare";

fs.readdir(imagesBasePath, function (err, files) {
    for (let file of files) {

        if (file.indexOf(photoName) !== -1) {
            let imagePath = path.join(imagesBasePath, file);
            console.log("Watching changes of image file", imagePath);
            var watcher = chokidar.watch(imagePath, {
                persistent: true,
                usePolling: true,
                interval: 10,
            });

            watcher.on('change', function (file) {
                console.log('change >>> ', file);
                io.emit('server', { for: 'everyone' });
            });
        }
    }
});

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