import React from "react";

export interface IProps {
    onStop: () => void;
    onForward: () => void;
    onBackward: () => void;
    onLeft: () => void;
    onRight: () => void;
}

export enum DirectionType {
    Up,
    Down,
    Left,
    Right,
}

interface State {
    currentButtonPressed: DirectionType | null;
}

export default class DirectionPanel extends React.Component<IProps, State>{

    constructor(props: IProps) {
        super(props);
        this.state = {
            currentButtonPressed: null,
        };
    }
    componentDidMount() {
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
    }

    componentWillUnmount() {
        window.removeEventListener('keypress', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
    }

    onKeyDown = (e: KeyboardEvent) => {
        let buttonType: DirectionType | null = null;
        switch (e.key) {
            case "ArrowUp":
                buttonType = DirectionType.Up;
                break;
            case "ArrowDown":
                buttonType = DirectionType.Down;
                break;
            case "ArrowLeft":
                buttonType = DirectionType.Left;
                break;
            case "ArrowRight":
                buttonType = DirectionType.Right;
                break;
        }
        if (buttonType != null && buttonType !== this.state.currentButtonPressed) {
            this.setState({ currentButtonPressed: buttonType });
            switch (buttonType) {
                case DirectionType.Up:
                    this.props.onForward();
                    break;
                case DirectionType.Down:
                    this.props.onBackward();
                    break;
                case DirectionType.Left:
                    this.props.onLeft();
                    break;
                case DirectionType.Right:
                    this.props.onRight();
                    break;
            }
        }
    }

    onKeyUp = (e: KeyboardEvent) => {
        this.setState({ currentButtonPressed: null });
        switch (e.key) {
            case "ArrowUp":
                this.props.onStop();
                break;
            case "ArrowDown":
                this.props.onStop();
                break;
            case "ArrowLeft":
                this.props.onStop();
                break;
            case "ArrowRight":
                this.props.onStop();
                break;
        }
    }

    getButtonClass = (type: DirectionType) => {
        if (this.state.currentButtonPressed === type)
            return "btn btn-cmd btn-primary";
        else return "btn btn-cmd btn-outline-primary";
    }

    render() {
        return (
            <>
                <div>
                    <button
                        type="button"
                        className={this.getButtonClass(DirectionType.Up)}
                        onMouseDown={this.props.onForward}
                        onMouseUp={this.props.onStop}>
                        <i className="fa fa-arrow-up" />
                    </button>
                </div>
                <div>
                    <button
                        type="button"
                        className={this.getButtonClass(DirectionType.Down)}
                        onMouseDown={this.props.onBackward}
                        onMouseUp={this.props.onStop}>
                        <i className="fa fa-arrow-down" />
                    </button>
                </div>
                <div>
                    <button
                        type="button"
                        className={this.getButtonClass(DirectionType.Left)}
                        onMouseDown={this.props.onLeft}
                        onMouseUp={this.props.onStop}>
                        <i className="fa fa-arrow-left" />
                    </button>
                </div>
                <div>
                    <button
                        type="button"
                        className={this.getButtonClass(DirectionType.Right)}
                        onMouseDown={this.props.onRight}
                        onMouseUp={this.props.onStop}>
                        <i className="fa fa-arrow-right" />
                    </button>
                </div>
            </>
        );
    }
}