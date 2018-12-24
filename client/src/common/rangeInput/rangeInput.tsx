import * as React from "react";
import "./rangeInput.css";

interface IProps {
    label: string;
    min?: number;
    max?: number;
    step?: number;
    initialValue?: number;
    onChange: (value: number) => void;
}

interface IState {
    value: number;
}

export default class RangeInput extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            value: props.initialValue || 1,
        };
    }

    public render() {
        return (
            <div>
                <label>{this.props.label}</label>
                <input
                    type="range"
                    className="slider"
                    min={this.props.min}
                    max={this.props.max}
                    value={this.state.value}
                    step={this.props.step}
                    onChange={this.onChange}
                />
            </div>
        );
    }

    private onChange = (e: any) => {
        const currentValue = e.target.valueAsNumber;
        this.setState({ value: e.target.valueAsNumber });
        this.props.onChange(currentValue);
    }
}
