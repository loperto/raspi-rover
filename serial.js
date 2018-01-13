var SerialPort = require('serialport');

module.exports = function Serial() {
    this.serial = new SerialPort('/dev/ttyACM0', {
        baudRate: 9600,
    });

    this.serial.on('open', () => console.log('serial port open'));

    // this.serial.on('data', function (data) {
    //     console.log('Data:', data.toString());
    // });

    this.onMessage = function onMessage(callback) {
        this.serial.on('data', function (data) {
            callback(data.toString());
        });
    }

    this.write = function write(message, onError) {
        this.serial.write('l', function (err) {
            if (err) {
                console.log('error on message', message);
                onError();
            }
            console.log('message sended');
        });
    }
};