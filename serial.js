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
            const message = data.toString();
            if (message == "ready") {
                this.connected = true;
                if (options && options.onReady)
                    options.onReady();
            }
            else {
                onMessage(data);
            }
        });

        this.port.on("error", (error) => {
            console.log("SERIAL ERROR: ", error);
            if (options && options.onError)
                onError(error);
        });
    }

    static async getAvailablePorts(deviceFilter) {
        const ports = await SerialPort.list();
        console.log(ports);
        const filter = deviceFilter.toLowerCase();
        return ports.find(x => JSON.stringify(x).toLowerCase().indexOf(filter) != -1);
    }

    write(data) {
        // if (this.connected)
        this.port.write(data);
        // else
        //     console.log("Serial not connected.")
    }

}

module.exports = Serial;




