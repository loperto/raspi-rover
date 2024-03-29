import React from "react";

export interface Props {
    pitch: number;
    roll: number;
}

export default class InclinationMonitor extends React.PureComponent<Props>{
    render() {
        const { pitch, roll } = this.props;
        return (
            <div>
                <i
                    className="fas fa-car-side fa-lg"
                    style={{ transform: `rotate(${pitch.toFixed(0)}deg)` }}
                />
                <i
                    className="fas fa-car fa-lg"
                    style={{ transform: `rotate(${roll.toFixed(0)}deg)` }}
                />
            </div>
        );
    }
}