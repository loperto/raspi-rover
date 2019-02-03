import * as React from 'react';
import { IProps, DirectionButton } from './directionPanel';
import Joystick from './joystick';


interface IState {
    currentStatus: DirectionButton | null;
}

export default class DirectionJoystick extends React.Component<IProps, IState>{
    constructor(props: IProps) {
        super(props);
        this.state = {
            currentStatus: null,
        };
    }

    private onChangeDirection = (x: number, y: number) => {
        // console.log("direction joystick", "X:", x, "Y:", y);
        if (x >= 100 && this.state.currentStatus != DirectionButton.Right) {
            this.setState({ currentStatus: DirectionButton.Right });
            console.log("onRight");
            // this.props.onRight();
        }
        else if (x <= 0 && this.state.currentStatus != DirectionButton.Left) {
            this.setState({ currentStatus: DirectionButton.Left });
            console.log("onLeft");
            // this.props.onLeft();
        }
        else if (y >= 100 && this.state.currentStatus != DirectionButton.Up) {
            this.setState({ currentStatus: DirectionButton.Up });
            console.log("onForward");
            // this.props.onForward();
        }
        else if (y <= 0 && this.state.currentStatus != DirectionButton.Down) {
            this.setState({ currentStatus: DirectionButton.Down });
            console.log("onBackward");
            // this.props.onBackward();
        }
        else if (this.state.currentStatus != null && x > 0 && x < 100 && y > 0 && y < 100) {
            this.setState({ currentStatus: null });
            console.log("onStop");
            // this.props.onStop();
        }
    }

    public render() {
        return (
            <Joystick
                xValues={{ min: 0, max: 100 }}
                yValues={{ min: 0, max: 100 }}
                initialX={50}
                initialY={50}
                onChange={this.onChangeDirection}
            />
        );
    }
}