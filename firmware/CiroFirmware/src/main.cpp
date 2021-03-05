#include <Arduino.h>
#include <Adafruit_PWMServoDriver.h>
#include <L298N.h>
#include <NewPing.h>

const uint8_t CAM_LED_PIN = 13;
const uint8_t OPT_LED_PIN = 10;

const uint8_t MOTOR_RIGHT_E = 5; //pin for speed control en1
const uint8_t MOTOR_RIGHT_1 = 4;
const uint8_t MOTOR_RIGHT_2 = 7;

const uint8_t MOTOR_LEFT_E = 6; //pin for speed control en2
const uint8_t MOTOR_LEFT_1 = 8;
const uint8_t MOTOR_LEFT_2 = 12;
uint8_t speed = 150;

//Ultrasonic Sensor HC-SR04
const uint8_t TRIGGER_PIN = PIN_A1; // Arduino pin tied to trigger pin on the ultrasonic sensor.
const uint8_t ECHO_PIN = PIN_A0;    // Arduino pin tied to echo pin on the ultrasonic sensor.
const uint8_t MAX_DISTANCE = 200;   // Maximum distance we want to ping for (in centimeters). Maximum sensor distance is rated at 400-500cm.

NewPing sonar(TRIGGER_PIN, ECHO_PIN, MAX_DISTANCE); // NewPing setup of pins and maximum distance.

L298N motorRight(MOTOR_RIGHT_E, MOTOR_RIGHT_1, MOTOR_RIGHT_2);
L298N motorLeft(MOTOR_LEFT_E, MOTOR_LEFT_1, MOTOR_LEFT_2);

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();
const uint16_t SERVOMIN = 150; // This is the 'minimum' pulse length count (out of 4096)
const uint16_t SERVOMAX = 600; // This is the 'maximum' pulse length count (out of 4096)
#define USMIN 600              // This is the rounded 'minimum' microsecond length based on the minimum pulse of 150
#define USMAX 2400             // This is the rounded 'maximum' microsecond length based on the maximum pulse of 600
const uint16_t MIN_THROTTLE = 1000;
const uint16_t MAX_THROTTLE = 2000;
const uint8_t GUN_CH1 = 4;
const uint8_t GUN_CH2 = 5;
const uint8_t GUN_LEVER = 2;
const uint8_t GUN_LOADER = 3;

void initMotors()
{
  pwm.writeMicroseconds(GUN_CH1, MIN_THROTTLE);
  pwm.writeMicroseconds(GUN_CH2, MIN_THROTTLE);
  delay(2000);
}

void forward()
{
  motorLeft.setSpeed(speed);
  motorRight.setSpeed(speed);
  motorLeft.forward();
  motorRight.forward();
}

void backward()
{
  motorLeft.setSpeed(speed);
  motorRight.setSpeed(speed);
  motorLeft.backward();
  motorRight.backward();
}

void left()
{
  motorLeft.setSpeed(speed);
  motorRight.setSpeed(speed);
  motorLeft.forward();
  motorRight.backward();
}

void right()
{
  motorLeft.setSpeed(speed);
  motorRight.setSpeed(speed);
  motorLeft.backward();
  motorRight.forward();
}

void stop()
{
  motorLeft.stop();
  motorRight.stop();
}

void servoWrite(uint8_t channel, uint8_t degrees)
{
  int pulselength = map(degrees, 0, 180, SERVOMIN, SERVOMAX);
  pwm.setPWM(channel, 0, pulselength);
}

void gunShot()
{
  pwm.writeMicroseconds(GUN_CH1, 1250);
  pwm.writeMicroseconds(GUN_CH2, 1250);
  delay(200);
  servoWrite(GUN_LOADER, 90);
  delay(800);
  servoWrite(GUN_LOADER, 180);
  delay(400);
  pwm.writeMicroseconds(GUN_CH1, MIN_THROTTLE);
  pwm.writeMicroseconds(GUN_CH2, MIN_THROTTLE);
}

void toggleLeds(uint8_t ledPin)
{
  if (digitalRead(ledPin) == HIGH)
    analogWrite(ledPin, 0);
  else
    analogWrite(ledPin, 255);
}

void setup()
{
  Serial.begin(115200);
  pinMode(CAM_LED_PIN, OUTPUT);
  pinMode(OPT_LED_PIN, OUTPUT);
  motorLeft.stop();
  motorRight.stop();
  motorLeft.setSpeed(speed);
  motorRight.setSpeed(speed);

  pwm.begin();
  pwm.setOscillatorFrequency(27000000);
  pwm.setPWMFreq(50);
  delay(10);
  initMotors();
}

void loop()
{
  if (Serial.available())
  {
    char command = Serial.read();
    switch (command)
    {
    case 'f':
      forward();
      break;
    case 'b':
      forward();
      break;
    case 'l':
      forward();
      break;
    case 'r':
      forward();
      break;
    case 's':
      stop();
      break;
    case 'g':
      gunShot();
      break;
    case 'q':
      toggleLeds(CAM_LED_PIN);
      break;
    case 'w':
      toggleLeds(OPT_LED_PIN);
      break;
    case '1':
      servoWrite(GUN_LEVER, 40);
      break;
    default:
    case '2':
      servoWrite(GUN_LEVER, 100);
      break;
    case '3':
      servoWrite(GUN_LEVER, 160);
      break;
    }
  }

  Serial.print("Ping: ");
  Serial.print(sonar.ping_cm());
  Serial.println("cm");
}