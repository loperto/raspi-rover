import * as React from "react";
import * as Chokidar from "chokidar";
class State {

}
export default class Monitor extends React.Component<{}, State>
{
    watcher: Chokidar.FSWatcher;
    constructor() {
        super();
        this.state = new State();
    }
    componentDidMount() {
        this.watcher = Chokidar.watch("./image.png",
            {
                ignored: /(^|[\/\\])\../,
                persistent: true
            })
            .on("change", this.onChangeImage);
    }

    onChangeImage = () => {
        console.log("immagine cambiata");
        this.forceUpdate();
    }

    componentWillUnmount() {
        this.watcher.close();
    }

    render() {
        return <img src="./image.png" style={{ width: 300, height: 300 }} />
    }
}