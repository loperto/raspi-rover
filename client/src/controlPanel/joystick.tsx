import * as React from 'react';

interface IProps {
    size: number;
    onChange: (valueX: number, valueY: number) => void;
}

interface IState {
    x: number,
    y: number,
    locked: boolean,
}

export default class Joystick extends React.Component<IProps, IState> {
    joystickSize: number;
    joystickContainer: HTMLDivElement;
    joystick: HTMLDivElement;
    containerInitialPos: DOMRect;
    joystickInitialPos: DOMRect;

    constructor(props: IProps) {
        super(props);
        this.joystickSize = 100;
        const offset = this.getJoystickOffset();
        this.state = {
            x: offset,
            y: offset,
            locked: true
        };
    }

    private getJoystickOffset() {
        return this.props.size / 2 / 2;
    }

    public componentDidMount() {
        this.containerInitialPos = this.joystickContainer.getBoundingClientRect() as DOMRect;
        this.joystickInitialPos = this.joystick.getBoundingClientRect() as DOMRect;
        console.log("initial container", this.containerInitialPos);
        console.log("initial joy", this.joystickInitialPos);
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
        this.setState({ x: deltaX, y: deltaY, locked: true });
        this.props.onChange(deltaX, deltaY);
    }

    private onMouseMove = (e: MouseEvent) => {
        if (this.state.locked) return;
        console.log(e);
        const offset = this.getJoystickOffset();
        const deltaX = e.x - this.containerInitialPos.left;
        const deltaY = e.y - this.containerInitialPos.top;
        console.log(deltaX, "deltaX");
        console.log(deltaY, "deltaY");
        if (deltaX >= 0 && deltaX <= 100) {
            this.setState({ x: deltaX - offset });
        }
        if (deltaY >= 0 && deltaY <= 100)
            this.setState({ y: deltaY - offset });

    }

    public render() {
        const containerSize = this.props.size;
        const joystickSize = this.props.size / 2;
        return (
            <div
                ref={div => this.joystickContainer = div!}
                style={{ backgroundColor: "blue", height: containerSize, width: containerSize, borderRadius: "50%" }}>
                <div
                    ref={div => this.joystick = div!}
                    style={{
                        backgroundColor: "red",
                        height: joystickSize,
                        width: joystickSize,
                        borderRadius: "50%",
                        marginTop: this.state.y,
                        marginLeft: this.state.x,
                    }}>
                </div>
            </div>
        );
    }
}