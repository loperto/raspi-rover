var SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const parser = port.pipe(new Readline({ delimiter: '\r\n' }))

module.exports = function Serial(osName) {
    const port = osName === "Linux" ? "/dev/ttyACM0" : "COM4";
    let message = "";
    this.serial = new SerialPort(port, {
        baudRate: 115200,
        autoOpen: true,
    });

    const parser = this.serial.pipe(new Readline({ delimiter: '\r\n' }))

    this.serial.on('open', () => console.log('serial port open'));
    this.serial.on('close', () => console.log('serial port closed'));
    this.onMessage = function onMessage(callback) {
        this.serial.on('data', (data) => {
            // message += data.toString();
            // let endIndex = message.indexOf("}");
            // if (endIndex !== -1) {
            //     const cutted = message.substring(0, endIndex + 1);
            console.log(data);
            callback(data);
            // if (message.length - 1 === endIndex)
            //     message = "";
            // else
            //     message = message.substr(endIndex + 1, message.length - 1);
            // }
        });
    }

    this.close = function close() {
        this.serial.close();
    }

    this.write = function write(data, onError) {
        this.serial.write(data, function (err) {
            if (err) {
                console.log('error on message', data);
                onError();
            }
            console.log('message sended');
        });
    }
};