
const express = require('express');
const app = require('express')();
const http = require('http');
const path = require("path");
const Rover = require("./server");

console.log(`#__RASPI-ROVER__#`);

const workDir = path.join(__dirname, "client/build");

app.use(express.static(workDir));
app.get('/', function (req, res) {
    res.sendFile(workDir);
});

let server = http.Server(app);
const rover = new Rover(server);

server.listen(8080, function () {
    console.log(`WebServer listening on port 8080`);
});


