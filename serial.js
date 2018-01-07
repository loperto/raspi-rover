var SerialPort = require('serialport');

module.exports = function Serial() {
    this.serial = new SerialPort('/dev/ttyACM0', {
        baudRate: 9600
    });

    this.serial.on('readable', function () {
        console.log('Data:', port.read());
    });

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