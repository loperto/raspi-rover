import * as React from "react";
let car = require("../car.png");
let carFront = require("../car-front.png");

export interface Props {
    pitch: number;
    roll: number;
}

export default class InclinationMonitor extends React.PureComponent<Props>{
    render() {
        const { pitch, roll } = this.props;
        return (
            <div>
                <img
                    src={car}
                    style={{ width: 48, transform: `rotate(${pitch && pitch.toFixed(0) || 0}deg)` }}
                />
                <img
                    src={carFront}
                    style={{ width: 48, transform: `rotate(${roll && roll.toFixed(0) || 0}deg)` }}
                />
            </div>
        );
    }
}