#include <Arduino.h>
#include <Wire.h>

unsigned long lastPingReceived = 0;
unsigned int pingTimeout = 10000;
const uint8_t readyPin = 4;

void setup()
{
  pinMode(readyPin, OUTPUT);
  Serial.begin(115200);
  digitalWrite(readyPin, HIGH);
  delay(500);
  digitalWrite(readyPin, LOW);
}

void execCommand(uint8_t type, uint8_t value)
{
  switch (type)
  {
  // case 1:
  //   forward();
  //   break;
  // case 2:
  //   backward();
  //   break;
  // case 3:
  //   left();
  //   break;
  // case 4:
  //   right();
  //   break;
  // case 5:
  //   stop();
  //   break;
  // case 6:
  //   setSpeed(value);
  //   break;
  // case 7:
  //   moveServoProgressive(cameraServoXChannel, cameraAxisX, value);
  //   break;
  // case 8:
  //   moveServoProgressive(cameraServoYChannel, cameraAxisY, value);
  //   break;
  // case 9:
  //   beep(value);
  //   break;
  // case 10:
  //   toggleLed();
  //   break;
  // case 11:
  //   gunShot();
  //   break;
  // case 12:
  //   value = map(value, 0, 180, GUN_LEVER_MIN, GUN_LEVER_MAX);
  //   moveServoProgressive(gunLeverServoChannel, gunLeverAxisValue, value);
  //   break;
  case 99:
    lastPingReceived = millis();
    digitalWrite(readyPin, HIGH);
    break;
  default:
    Serial.print(type);
    Serial.print(" ");
    Serial.print(value);
    Serial.println(" command not found!");
    break;
  }
}

void loop()
{
  if (Serial.available())
  {
    uint8_t command[3];
    Serial.readBytesUntil('\0', command, 3);
    uint8_t test = command[0];
    uint8_t test2 = command[1] - 1;
    execCommand(test, test2);
  }
  else
  {
    // if ((millis() - lastTelemetrySend) > telemetryFrequency)
    // {
    //   sendTelemetry();
    //   lastTelemetrySend = millis();
    // }
    if ((millis() - lastPingReceived) > pingTimeout)
    {
      digitalWrite(readyPin, LOW);
    }
  }
}
