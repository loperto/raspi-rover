import React from 'react';
import { map } from '../Utilities';

interface IProps {
    initialX: number;
    initialY: number;
    xValues: { min: number, max: number };
    yValues: { min: number, max: number };
    onChange: (valueX: number, valueY: number) => void;
    stacked?: boolean;
    color?: string;
    icon?: string
}

interface IState {
    marginLeft: number,
    marginTop: number,
    locked: boolean,
    identifier: number | null;
}

export default class Joystick extends React.Component<IProps, IState> {
    containerSize: number = 100;
    joystickSize: number = 70;
    borderWidht: number = 5;
    joystickContainer: HTMLDivElement | null = null;
    joystick: HTMLDivElement | null = null;
    containerInitialPos: DOMRect | undefined = undefined;
    joystickInitialPos: DOMRect | undefined = undefined;
    offsets: {
        minX: number, maxX: number, minY: number, maxY: number
    };

    constructor(props: IProps) {
        super(props);
        this.offsets = this.getJoystickOffsets(this.containerSize, this.joystickSize);
        const initial = this.getInitialPosition(props);
        this.state = {
            marginLeft: initial.x,
            marginTop: initial.y,
            locked: true,
            identifier: null,
        };
    }

    getJoystickOffsets(containerSize: number, joystickSize: number) {
        const joyMargin = ((containerSize - joystickSize) / 2) - this.borderWidht;
        const minScale = joyMargin - (joyMargin * 2);
        const maxScale = joyMargin + (joyMargin * 2);
        return {
            minX: minScale,
            maxX: maxScale,
            minY: maxScale,
            maxY: minScale
        };
    }

    getInitialPosition(props: IProps) {
        const initX = map(props.initialX, props.xValues.min, props.xValues.max, this.offsets.minX, this.offsets.maxX);
        const initY = map(props.initialY, props.yValues.min, props.yValues.max, this.offsets.minY, this.offsets.maxY);
        return { x: initX, y: initY };
    }

    componentDidMount() {
        this.containerInitialPos = this.joystickContainer?.getBoundingClientRect();
        this.joystickInitialPos = this.joystick?.getBoundingClientRect();

        this.joystickContainer?.addEventListener("mousedown", this.onMouseDown);
        this.joystickContainer?.addEventListener("mouseup", this.onMouseUp);
        this.joystickContainer?.addEventListener("mousemove", this.onMouseMove);

        this.joystickContainer?.addEventListener("touchstart", this.onTouchStart);
        this.joystickContainer?.addEventListener("touchend", this.onTouchEnd);
        this.joystickContainer?.addEventListener("touchmove", this.onTouchMove);
    }

    componentWillUnmount() {
        this.joystickContainer?.removeEventListener("mousedown", this.onMouseDown);
        this.joystickContainer?.removeEventListener("mouseup", this.onMouseUp);
        this.joystickContainer?.removeEventListener("mousemove", this.onMouseMove);

        this.joystickContainer?.removeEventListener("touchstart", this.onTouchStart);
        this.joystickContainer?.removeEventListener("touchend", this.onTouchEnd);
        this.joystickContainer?.removeEventListener("touchmove", this.onTouchMove);
    }

    getLastTouchChanged(touchList: TouchList, identifier: number | null) {
        if (identifier == null) return null;
        let result: Touch | null = null;
        for (let i = 0; i < touchList.length; i++) {
            const touch = touchList[i];
            if (touch.identifier !== identifier) continue;
            result = touch;
        }

        return result;
    }

    onTraceStart(identifier: number) {
        this.setState({ identifier, locked: false });
    }

    onMove(x: number, y: number) {
        if (this.state.locked) return;
        const deltaX = (x - this.containerInitialPos!.left) - (this.joystickSize / 2);
        const deltaY = (y - this.containerInitialPos!.top) - (this.joystickSize / 2);
        this.setState({ marginLeft: deltaX, marginTop: deltaY });
        this.onChangeInternal(deltaX, deltaY);
    }

    onTraceEnd() {
        let initalPos = this.getInitialPosition(this.props);
        this.setState({ identifier: null, marginLeft: initalPos.x, marginTop: initalPos.y, locked: true });
        this.onChangeInternal(initalPos.x, initalPos.y);
    }

    onChangeInternal(x: number, y: number) {
        let mappedX = this.getMappedValue(x, this.offsets.minX, this.offsets.maxX, this.props.xValues.min, this.props.xValues.max, this.props.stacked);
        let mappedY = this.getMappedValue(y, this.offsets.minY, this.offsets.maxY, this.props.yValues.min, this.props.yValues.max, this.props.stacked);
        this.props.onChange(mappedX, mappedY);
    }

    getMappedValue(value: number, offMin: number, offMax: number, min: number, max: number, stacked?: boolean) {
        let mapped = map(value, offMin, offMax, min, max);
        if (stacked) {
            if (mapped < min)
                mapped = min;
            else if (mapped > max)
                mapped = max;
        }
        return mapped;
    }

    onMouseDown = (e: MouseEvent) => {
        this.onTraceStart(0);
    }

    onMouseMove = (e: MouseEvent) => {
        this.onMove(e.x, e.y);
    }

    onMouseUp = (e: MouseEvent) => {
        this.onTraceEnd();
    }

    onTouchStart = (e: TouchEvent) => {
        e.preventDefault();
        this.onTraceStart(e.changedTouches[0].identifier);
    }

    onTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        if (this.state.locked) return;

        var point = this.getLastTouchChanged(e.changedTouches, this.state.identifier);
        if (point == null) return;
        this.onMove(point.clientX, point.clientY);
    }

    onTouchEnd = (e: TouchEvent) => {
        e.preventDefault();
        this.onTraceEnd();
    }

    render() {
        const color = this.props.color || "blue";
        return (
            <div
                ref={div => this.joystickContainer = div!}
                style={{
                    height: this.containerSize,
                    width: this.containerSize,
                    borderRadius: "50%",
                    border: `${this.borderWidht}px solid ${color}`,
                    margin: 30,
                }}>
                <div
                    ref={div => this.joystick = div!}
                    style={{
                        backgroundColor: color,
                        height: this.joystickSize,
                        width: this.joystickSize,
                        borderRadius: "50%",
                        marginTop: this.state.marginTop,
                        marginLeft: this.state.marginLeft,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                    {this.props.icon
                        ? <i className={`${this.props.icon} fa-lg`} style={{ color: "white" }} />
                        : <span />}
                </div>
            </div>
        );
    }
}