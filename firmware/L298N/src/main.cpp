#include <Arduino.h>
#include <L298N.h>

// Motor enable CH1		D5
// Motor input 1 CH1	D4
// Motor input 2 CH1	D7

// Motor enable CH2		D6
// Motor input 1 CH2	D8
// Motor input 2 CH2	D12

//Pin Out
const uint8_t MOTOR_RIGHT_E = 5; //pin for speed control en1
const uint8_t MOTOR_RIGHT_1 = 4;
const uint8_t MOTOR_RIGHT_2 = 7;

const uint8_t MOTOR_LEFT_E = 6; //pin for speed control en2
const uint8_t MOTOR_LEFT_1 = 8;
const uint8_t MOTOR_LEFT_2 = 12;

L298N motorRight(MOTOR_RIGHT_E, MOTOR_RIGHT_1, MOTOR_RIGHT_2);
L298N motorLeft(MOTOR_LEFT_E, MOTOR_LEFT_1, MOTOR_LEFT_2);

uint8_t speed = 50;

void setup()
{
  Serial.begin(9600);
  // pinMode(MOTOR_RIGHT_1, OUTPUT);
  // pinMode(MOTOR_RIGHT_2, OUTPUT);
  // pinMode(MOTOR_LEFT_1, OUTPUT);
  // pinMode(MOTOR_LEFT_2, OUTPUT);
  // pinMode(MOTOR_RIGHT_E, OUTPUT);
  // pinMode(MOTOR_LEFT_E, OUTPUT);
  motorLeft.stop();
  motorRight.stop();
  motorLeft.setSpeed(speed);
  motorRight.setSpeed(speed);
}

void loop()
{

  if (Serial.available())
  {
    char command = Serial.read();
    switch (command)
    {
    case 'f':
      Serial.println("forward");
      motorLeft.setSpeed(speed);
      motorRight.setSpeed(speed);
      motorLeft.forward();
      motorRight.forward();
      break;
    case 'b':
      Serial.println("backward");
      motorLeft.setSpeed(speed);
      motorRight.setSpeed(speed);
      motorLeft.backward();
      motorRight.backward();
      break;
    case 'l':
      Serial.println("left");
      motorLeft.setSpeed(speed);
      motorRight.setSpeed(speed);
      motorLeft.forward();
      motorRight.backward();
      break;
    case 'r':
      Serial.println("right");
      motorLeft.setSpeed(speed);
      motorRight.setSpeed(speed);
      motorLeft.backward();
      motorRight.forward();
      break;
    case 's':
      Serial.println("stop");
      motorLeft.stop();
      motorRight.stop();
      break;
    case 'z':
      Serial.println("only right forward");
      motorRight.setSpeed(speed);
      motorRight.forward();
      motorLeft.stop();
      break;
    case 'x':
      Serial.println("only left forward");
      motorLeft.setSpeed(speed);
      motorLeft.forward();
      motorRight.stop();
      break;
    case '1':
      Serial.println("speed 50");
      speed = 50;
      motorLeft.setSpeed(speed);
      motorRight.setSpeed(speed);
      break;
    case '2':
      Serial.println("speed 100");
      speed = 100;
      motorLeft.setSpeed(speed);
      motorRight.setSpeed(speed);
      break;
    case '3':
      Serial.println("speed 150");
      speed = 150;
      motorLeft.setSpeed(speed);
      motorRight.setSpeed(speed);
      break;

    default:
      break;
    }
  }
  //control speed
  //(pin, speed)

  //control direction
}