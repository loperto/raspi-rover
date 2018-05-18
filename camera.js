"use strict"
const { spawn } = require('child_process');

module.exports = function Camera() {
    this.cameraService = null;
    this.running = false;

    this.startCamera = function startCamera(filePath) {

        if (this.running) {
            console.log("camera is already running");
            return;
        }

        console.log("starting camera service");
        this.child = spawn("raspistill", [
            "-s",
            "-n",
            "-bm",
            "-th", "0:0:0",
            "-t", "999999999",
            "-tl", "200",
            "-w", "640",
            "-h", "480",
            "-q", "75",
            "-o", filePath
        ]);

        this.running = true;

        this.child.stdout.on('data', (data) => {
            // console.log(`stdout: ${data}`);
        });
        this.child.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });
        this.child.on('close', (code) => {
            console.log("camera service closed");
        });
        this.child.on('error', (err) => {
            console.log('Failed to start service.', err);
        });

    }, this.stopCamera = function stopCamera() {
        if (this.running) {
            this.child.kill();
            this.running = false;
        }
    }
}
