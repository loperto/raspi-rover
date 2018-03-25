var SerialPort = require('serialport');

module.exports = function Serial(osName) {
    const port = osName === "Linux" ? "/dev/ttyACM0" : "COM4"
    this.serial = new SerialPort(port, {
        baudRate: 115200,
        autoOpen: true,
    });

    this.serial.on('open', () => console.log('serial port open'));
    this.onMessage = function onMessage(callback) {
        this.serial.on('data', (data) => {
            callback(data.toString());
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