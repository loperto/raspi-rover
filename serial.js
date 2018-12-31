"use strict";

var SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");

class Serial {
    constructor(osName) {
        const port = osName === "Linux" ? "/dev/ttyACM0" : "COM4";
        this.serial = new SerialPort(port, {
            baudRate: 115200,
            autoOpen: true,
        });

        this.parser = this.serial.pipe(new Readline({ delimiter: '\r\n' }));
        this.serial.on('open', () => console.log('serial port open'));
        this.serial.on('close', () => console.log('serial port closed'));
        this.onMessage = this.onMessage.bind(this);
        this.write = this.write.bind(this);
        this.close = this.close.bind(this);
    }

    onMessage(callback) {
        parser.on('data', (data) => {
            const readable = data.toString();
            // console.log(readable);
            callback(readable);
        });
    }

    write(data, onError) {
        this.serial.write(data, (err) => {
            if (err) {
                console.log('error on message', data);
                onError();
            }
            console.log('message sended');
        });
    }

    close() {
        this.serial.close();
    }
}

module.exports = Serial;