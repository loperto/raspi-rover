var SerialPort = require('serialport');

module.exports = function Serial(osName) {
    const port = osName === "Linux" ? "/dev/ttyACM0" : "COM4";
    let message = "";
    this.serial = new SerialPort(port, {
        baudRate: 115200,
        autoOpen: true,
    });

    this.serial.on('open', () => console.log('serial port open'));
    this.onMessage = function onMessage(callback) {
        this.serial.on('data', (data) => {
            message += data.toString();
            let endIndex = message.indexOf("}");
            if (endIndex !== -1) {
                callback(message.substring(0, endIndex + 1));
                if (message.length - 1 === endIndex)
                    message = "";
                else
                    message = message.substr(endIndex + 1, message.length - 1);
            }
        });
    }

    this.write = function write(message, onError) {
        this.serial.write(message, function (err) {
            if (err) {
                console.log('error on message', message);
                onError();
            }
            console.log('message sended');
        });
    }
};