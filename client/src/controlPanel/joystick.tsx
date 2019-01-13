import * as React from 'react';

interface IProps {
    initialX: number;
    initialY: number;
    xValues: { min: number, max: number }
    yValues: { min: number, max: number }
    onChange: (valueX: number, valueY: number) => void;
}

interface IState {
    marginLeft: number,
    marginTop: number,
    locked: boolean,
}

export default class Joystick extends React.Component<IProps, IState> {
    joystickSize: number = 100;
    joystickContainer: HTMLDivElement;
    joystick: HTMLDivElement;
    containerInitialPos: DOMRect;
    joystickInitialPos: DOMRect;

    constructor(props: IProps) {
        super(props);
        const initial = this.getInitialPosition(props);
        this.state = {
            marginLeft: initial.x,
            marginTop: initial.y,
            locked: true
        };
    }

    private getInitialPosition(props: IProps) {
        const initX = this.map(props.initialX, props.xValues.min, props.xValues.max, -25, 75);
        const initY = this.map(props.initialY, props.yValues.min, props.yValues.max, 75, -25);
        return { x: initX, y: initY };
    }

    private map(x: number, in_min: number, in_max: number, out_min: number, out_max: number) {
        return Math.round((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
    }

    public componentDidMount() {
        this.containerInitialPos = this.joystickContainer.getBoundingClientRect() as DOMRect;
        this.joystickInitialPos = this.joystick.getBoundingClientRect() as DOMRect;
        this.joystickContainer.addEventListener("mousedown", this.onMouseDown);
        this.joystickContainer.addEventListener("mouseup", this.onMouseUp);
        this.joystickContainer.addEventListener("mousemove", this.onMouseMove);
    }

    public componentWillUnmount() {
        this.joystickContainer.removeEventListener("mousedown", this.onMouseDown);
        this.joystickContainer.addEventListener("mouseup", this.onMouseUp);
        this.joystickContainer.addEventListener("mousemove", this.onMouseMove);
    }

    private onMouseDown = (e: MouseEvent) => {
        console.log("unlocked!");
        this.setState({ locked: false });
    }

    private onMouseUp = (e: MouseEvent) => {
        console.log("locked!");
        const deltaX = Math.abs(this.containerInitialPos.left - this.joystickInitialPos.left);
        const deltaY = Math.abs(this.containerInitialPos.top - this.joystickInitialPos.top);
        this.setState({ marginLeft: deltaX, marginTop: deltaY, locked: true });
        this.props.onChange(deltaX, deltaY);
    }

    private onMouseMove = (e: MouseEvent) => {
        if (this.state.locked) return;
        const deltaX = e.x - (this.containerInitialPos.left + this.joystickSize / 4);
        const deltaY = e.y - (this.containerInitialPos.top + this.joystickSize / 4);
        this.setState({ marginLeft: deltaX, marginTop: deltaY });

        const mappedX = this.map(deltaX, -25, 75, this.props.xValues.min, this.props.xValues.max);
        const mappedY = this.map(deltaY, 75, -25, this.props.yValues.min, this.props.yValues.max);

        this.props.onChange(mappedX, mappedY);


    }

    public render() {
        const containerSize = this.joystickSize;
        const joystickSize = this.joystickSize / 2;
        return (
            <div
                ref={div => this.joystickContainer = div!}
                style={{ backgroundColor: "blue", height: containerSize, width: containerSize, borderRadius: "50%", margin: 30 }}>
                <div
                    ref={div => this.joystick = div!}
                    style={{
                        backgroundColor: "red",
                        height: joystickSize,
                        width: joystickSize,
                        borderRadius: "50%",
                        marginTop: this.state.marginTop,
                        marginLeft: this.state.marginLeft,
                    }}>
                </div>
            </div>
        );
    }
}