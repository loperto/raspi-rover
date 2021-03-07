#include <Arduino.h>
#include <Adafruit_PWMServoDriver.h>
#include <L298N.h>
#include <NewPing.h>
#include <MPU6050_tockn.h>

unsigned long lastTelemetrySend = 0;
const uint16_t telemetryFrequency = 500;
MPU6050 mpu6050(Wire);

unsigned long lastPingReceived = 0;
const unsigned int pingTimeout = 10000;
const uint8_t PING_LED_PIN = 11;

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

const uint8_t CAM_X_CH = 0;
const uint8_t CAM_Y_CH = 1;

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

void toggleLeds(uint8_t ledPin, uint8_t pwmValue)
{
  if (digitalRead(ledPin) == HIGH)
    analogWrite(ledPin, 0);
  else
    analogWrite(ledPin, pwmValue);
}

void changeMotorSpeed(uint8_t speed)
{
  motorLeft.setSpeed(speed);
  motorRight.setSpeed(speed);
}

void setup()
{
  Serial1.begin(115200);
  pinMode(CAM_LED_PIN, OUTPUT);
  pinMode(OPT_LED_PIN, OUTPUT);
  pinMode(PING_LED_PIN, OUTPUT);
  motorLeft.stop();
  motorRight.stop();
  motorLeft.setSpeed(speed);
  motorRight.setSpeed(speed);

  Wire.begin();
  mpu6050.begin();

  pwm.begin();
  pwm.setOscillatorFrequency(27000000);
  pwm.setPWMFreq(50);
  delay(10);
  initMotors();
}

void execCommand(uint8_t type, uint8_t value)
{
  Serial.println("command");
  switch (type)
  {
  case 1:
    forward();
    break;
  case 2:
    backward();
    break;
  case 3:
    left();
    break;
  case 4:
    right();
    break;
  case 5:
    stop();
    break;
  case 6:
    changeMotorSpeed(value);
    break;
  case 7:
    servoWrite(CAM_X_CH, value);
    break;
  case 8:
    servoWrite(CAM_Y_CH, value);
    break;
  case 9:
    // beep(value);
    break;
  case 10:
    toggleLeds(CAM_LED_PIN, value);
    break;
  case 11:
    gunShot();
    break;
  case 12:
    servoWrite(GUN_LEVER, value);
    break;
  case 13:
    toggleLeds(OPT_LED_PIN, value);
    break;
  case 99:
    Serial.println("ping");
    lastPingReceived = millis();
    digitalWrite(PING_LED_PIN, HIGH);
    break;
  default:
    Serial.print(type);
    Serial.print(" ");
    Serial.print(value);
    Serial.println(" command not found!");
    break;
  }
}

void float2Bytes(byte bytes_temp[4], float float_variable)
{
  union
  {
    float a;
    unsigned char bytes[4];
  } thing;
  thing.a = float_variable;
  memcpy(bytes_temp, thing.bytes, 4);
}

void sendTelemetry()
{
  long distance = sonar.ping_cm();
  mpu6050.update();
  float temp = mpu6050.getTemp();
  float angleX = mpu6050.getAccAngleX();
  float angleY = mpu6050.getAccAngleY();

  Serial.print("Ping: ");
  Serial.println(distance);
  uint8_t distanceBytes[4];
  float2Bytes(distanceBytes, distance);

  Serial.print("Temp: ");
  Serial.println(temp);
  uint8_t tempBytes[4];
  float2Bytes(tempBytes, temp);

  Serial.print("angleX: ");
  Serial.println(angleX);
  uint8_t angleXBytes[4];
  float2Bytes(angleXBytes, angleX);

  Serial.print("angleY: ");
  Serial.println(angleY);
  uint8_t angleYBytes[4];
  float2Bytes(angleYBytes, angleY);

  uint8_t allBytes[] = {
      distanceBytes[0],
      distanceBytes[1],
      distanceBytes[2],
      distanceBytes[3],
      tempBytes[0],
      tempBytes[1],
      tempBytes[2],
      tempBytes[3],
      angleXBytes[0],
      angleXBytes[1],
      angleXBytes[2],
      angleXBytes[3],
      angleYBytes[0],
      angleYBytes[1],
      angleYBytes[2],
      angleYBytes[3],
      '\0',
  };

  // Serial.write(allBytes, sizeof(allBytes));
  // Serial1.write(allBytes, sizeof(allBytes));
}

void loop()
{
  if (Serial1.available())
  {
    uint8_t command[3];
    Serial1.readBytesUntil('\0', command, 3);
    uint8_t test = command[0];
    uint8_t test2 = command[1] - 1;
    execCommand(test, test2);
  }
  else
  {
    unsigned long currentMillis = millis();
    if ((currentMillis - lastPingReceived) > pingTimeout)
    {
      digitalWrite(PING_LED_PIN, LOW);
    }
    if ((currentMillis - lastTelemetrySend) > telemetryFrequency)
    {
      sendTelemetry();
      lastTelemetrySend = currentMillis;
      // byte dataArray[17];
      // byte *b = (byte *)&distance;
      // for (size_t i = 0; i < 17; i++)
      // {
      //   dataArray[i] = ((uint8_t *)&distance)[0]
      // }
      // byte dataArray[4] = {
      //     ((uint8_t *)&a)[0],
      //     ((uint8_t *)&a)[1],
      //     ((uint8_t *)&a)[2],
      //     ((uint8_t *)&a)[3]};
    }
  }

  // if (Serial.available())
  // {
  //   char command = Serial.read();
  //   switch (command)
  //   {
  //   case 'f':
  //     forward();
  //     break;
  //   case 'b':
  //     forward();
  //     break;
  //   case 'l':
  //     forward();
  //     break;
  //   case 'r':
  //     forward();
  //     break;
  //   case 's':
  //     stop();
  //     break;
  //   case 'g':
  //     gunShot();
  //     break;
  //   case 'q':
  //     toggleLeds(CAM_LED_PIN);
  //     break;
  //   case 'w':
  //     toggleLeds(OPT_LED_PIN);
  //     break;
  //   case '1':
  //     servoWrite(GUN_LEVER, 40);
  //     break;
  //   default:
  //   case '2':
  //     servoWrite(GUN_LEVER, 100);
  //     break;
  //   case '3':
  //     servoWrite(GUN_LEVER, 160);
  //     break;
  //   }
  // }
}