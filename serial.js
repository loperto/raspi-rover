const SerialPort = require("serialport")
const Readline = require("@serialport/parser-readline");
const Delimiter = require("@serialport/parser-delimiter")
class Serial {
    constructor(path, onMessage, options) {
        this.connected = false;
        this.port = new SerialPort(path, {
            baudRate: options && options.baudRate || 9600,
            autoOpen: true,
        });
        this.parser = this.port.pipe(new Delimiter({ delimiter: "\r\n" }));
        this.parser.on("data", (data) => {
            onMessage(data);
        });

        this.port.on("error", (error) => {
            console.log("SERIAL ERROR: ", error);
            if (options && options.onError)
                options.onError(error);
        });

        this.port.on("open", () => {
            if (options && options.onReady) {
                setTimeout(() => options.onReady(), 4000);
            }
        })
    }

    static async getAvailablePorts(deviceFilter) {
        const ports = await SerialPort.list();
        console.log(ports);
        const filter = deviceFilter.toLowerCase();
        return ports.find(x => JSON.stringify(x).toLowerCase().indexOf(filter) != -1);
    }

    write(data) {
        this.port.write(data);
    }

}

module.exports = Serial;




