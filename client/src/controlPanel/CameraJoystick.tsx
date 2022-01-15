import React from 'react';
import Joystick from '../joystick/Joystick';
const CameraJoystick = (props: { onMove: (x: number, y: number) => void }) => {

    return (
        <Joystick
            xValues={{ min: 0, max: 180 }}
            yValues={{ min: 0, max: 100 }}
            initialX={90}
            initialY={0}
            onChange={props.onMove}
            color="#ff3333"
            icon="fas fa-video"
            stacked
        />
    );

}

export default CameraJoystick;