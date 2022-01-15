import React from 'react';
import { IProps, DirectionType } from './DirectionPanel';
import Joystick from '../joystick/Joystick';


interface IState {
    currentStatus: DirectionType | null;
}

export default class DirectionJoystick extends React.Component<IProps, IState>{
    constructor(props: IProps) {
        super(props);
        this.state = {
            currentStatus: null,
        };
    }

    onChangeDirection = (x: number, y: number) => {
        // console.log("direction joystick", "X:", x, "Y:", y);
        if (x >= 100 && this.state.currentStatus != DirectionType.Right) {
            this.setState({ currentStatus: DirectionType.Right });
            console.log("onRight");
            this.props.onRight();
        }
        else if (x <= 0 && this.state.currentStatus != DirectionType.Left) {
            this.setState({ currentStatus: DirectionType.Left });
            console.log("onLeft");
            this.props.onLeft();
        }
        else if (y >= 100 && this.state.currentStatus != DirectionType.Up) {
            this.setState({ currentStatus: DirectionType.Up });
            console.log("onForward");
            this.props.onForward();
        }
        else if (y <= 0 && this.state.currentStatus != DirectionType.Down) {
            this.setState({ currentStatus: DirectionType.Down });
            console.log("onBackward");
            this.props.onBackward();
        }
        else if (this.state.currentStatus != null && x > 0 && x < 100 && y > 0 && y < 100) {
            this.setState({ currentStatus: null });
            console.log("onStop");
            this.props.onStop();
        }
    }

    render() {
        return (
            <Joystick
                xValues={{ min: 0, max: 100 }}
                yValues={{ min: 0, max: 100 }}
                initialX={50}
                initialY={50}
                onChange={this.onChangeDirection}
                color="#3333ff"
                icon="fas fa-arrows-alt"
            />
        );
    }
}