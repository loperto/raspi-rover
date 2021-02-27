#include <Arduino.h>
#include <L298N.h>

//Pin Out
const uint8_t MOTOR_RIGHT_E = 10; //pin for speed control en1
const uint8_t MOTOR_RIGHT_1 = 6;
const uint8_t MOTOR_RIGHT_2 = 5;

const uint8_t MOTOR_LEFT_E = 9; //pin for speed control en2
const uint8_t MOTOR_LEFT_1 = 8;
const uint8_t MOTOR_LEFT_2 = 7;

L298N motorRight(MOTOR_RIGHT_E, MOTOR_RIGHT_1, MOTOR_RIGHT_2);
L298N motorLeft(MOTOR_LEFT_E, MOTOR_LEFT_1, MOTOR_LEFT_2);

const uint8_t speed = 50;

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

  Serial.print("Left Motor: ");
  Serial.print(motorLeft.getSpeed());
  Serial.print(" Right Motor: ");
  Serial.println(motorRight.getSpeed());
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
      motorLeft.backward();
      motorRight.forward();
      break;
    case 'r':
      Serial.println("right");
      motorLeft.setSpeed(speed);
      motorRight.setSpeed(speed);
      motorLeft.forward();
      motorRight.backward();
      break;
    case 's':
      Serial.println("stop");
      motorLeft.stop();
      motorRight.stop();
      break;
    case '1':
      Serial.println("only right forward");
      motorRight.setSpeed(speed);
      motorRight.forward();
      motorLeft.stop();
      break;
    case '2':
      Serial.println("only left forward");
      motorLeft.setSpeed(speed);
      motorLeft.forward();
      motorRight.stop();
      break;

    default:
      break;
    }
  }
  //control speed
  //(pin, speed)

  //control direction
}