
const express = require('express');
const app = require('express')();
const http = require('http');
const path = require("path");
const Rover = require("./server");

const workDir = path.join(__dirname, "client/build");

app.use(express.static(workDir));
app.get('/', function (req, res) {
    res.sendFile(workDir);
});

let server = http.Server(app);
server.listen(8080, function () {
    console.log(`listening on *:8080`);
});


const rover = new Rover(server);