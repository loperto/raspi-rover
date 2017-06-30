import * as React from 'react';

export interface Props extends React.Props<any> {
    start?: number | undefined;
}

class State {
    interval: any;
    counter: number = 0;
}

export default class Test extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props);
        this.state = new State();
    }

    componentDidMount() {
        let interval = setInterval(this.updateCounter, 1000);
        this.setState({ interval });
    }

    componentWillUnmount() {
        if (this.state.interval != undefined)
            clearInterval(this.state.interval);
    }

    updateCounter = () => {
        let counter = this.state.counter + 1;
        this.setState({ counter });
    }

    render() {
        return (
            <span>{this.state.counter}</span>
        );
    }
}