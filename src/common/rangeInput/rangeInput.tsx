import * as React from "react";
import "./rangeInput.css";

interface IProps {
    label: string;
    min?: number;
    max?: number;
    step?: number;
    onChange: (value: number) => void;
}

interface State {
    value: number;
}

export default class RangeInput extends React.Component<IProps, State>{
    constructor(props: IProps) {
        super(props);
        this.state = {
            value: 1,
        };
    }

    onChange = (e: any) => {
        const currentValue = e.target.valueAsNumber;
        console.log(currentValue);
        this.setState({ value: e.target.valueAsNumber });
        this.props.onChange(currentValue);
    }

    render() {
        return (
            <div>
                <label>{this.props.label}</label>
                <input type="range"
                    className="slider"
                    min={this.props.min}
                    max={this.props.max}
                    value={this.state.value}
                    step={this.props.step}
                    onChange={this.onChange} />
            </div>
        );
    }
}

