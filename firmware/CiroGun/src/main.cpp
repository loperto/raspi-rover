/*************************************************** 
  This is an example for our Adafruit 16-channel PWM & Servo driver
  Servo test - this will drive 8 servos, one after the other on the
  first 8 pins of the PCA9685

  Pick one up today in the adafruit shop!
  ------> http://www.adafruit.com/products/815
  
  These drivers use I2C to communicate, 2 pins are required to  
  interface.

  Adafruit invests time and resources providing this open source code, 
  please support Adafruit and open-source hardware by purchasing 
  products from Adafruit!

  Written by Limor Fried/Ladyada for Adafruit Industries.  
  BSD license, all text above must be included in any redistribution
 ****************************************************/

#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>
#include <Servo.h>

// called this way, it uses the default address 0x40
Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();
// you can also call it with a different address you want
//Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x41);
// you can also call it with a different address and I2C interface
//Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x40, Wire);

// Depending on your servo make, the pulse width min and max may vary, you
// want these to be as small/large as possible without hitting the hard stop
// for max range. You'll have to tweak them as necessary to match the servos you
// have!
#define SERVOMIN 150  // This is the 'minimum' pulse length count (out of 4096)
#define SERVOMAX 600  // This is the 'maximum' pulse length count (out of 4096)
#define USMIN 600     // This is the rounded 'minimum' microsecond length based on the minimum pulse of 150
#define USMAX 2400    // This is the rounded 'maximum' microsecond length based on the maximum pulse of 600
#define SERVO_FREQ 50 // Analog servos run at ~50 Hz updates
#define MIN_THROTTLE 1000
#define MAX_THROTTLE 2000
// our servo # counter
uint8_t servonum = 0;
const uint8_t GUN_CH1 = 4;
const uint8_t GUN_CH2 = 5;
const uint8_t GUN_LEVER = 2;
const uint8_t GUN_LOADER = 3;

void initMotors()
{
  pwm.writeMicroseconds(4, 2000);
  pwm.writeMicroseconds(5, 2000);
  delay(5000);
  pwm.writeMicroseconds(4, 1000);
  pwm.writeMicroseconds(5, 1000);
  delay(2000);
}

void setup()
{
  Serial.begin(9600);
  Serial.println("8 channel Servo test!");
  //taratura motore brushless: Avviare questo codice, scollegare le 2 esc. Mandare via seriale h (livello alto), collegare le esc e attende il beep. Attendere 2 secondi e mandare il low
  //https://howtomechatronics.com/tutorials/arduino/arduino-brushless-motor-control-tutorial-esc-bldc/
  pwm.begin();
  /*
   * In theory the internal oscillator (clock) is 25MHz but it really isn't
   * that precise. You can 'calibrate' this by tweaking this number until
   * you get the PWM update frequency you're expecting!
   * The int.osc. for the PCA9685 chip is a range between about 23-27MHz and
   * is used for calculating things like writeMicroseconds()
   * Analog servos run at ~50 Hz updates, It is importaint to use an
   * oscilloscope in setting the int.osc frequency for the I2C PCA9685 chip.
   * 1) Attach the oscilloscope to one of the PWM signal pins and ground on
   *    the I2C PCA9685 chip you are setting the value for.
   * 2) Adjust setOscillatorFrequency() until the PWM update frequency is the
   *    expected value (50Hz for most ESCs)
   * Setting the value here is specific to each individual I2C PCA9685 chip and
   * affects the calculations for the PWM update frequency. 
   * Failure to correctly set the int.osc value will cause unexpected PWM results
   */
  pwm.setOscillatorFrequency(27000000);
  pwm.setPWMFreq(SERVO_FREQ); // Analog servos run at ~50 Hz updates
  delay(10);
  // initMotors();
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
  pwm.writeMicroseconds(GUN_CH1, 1000);
  pwm.writeMicroseconds(GUN_CH2, 1000);
}

void loop()
{
  if (Serial.available())
  {
    char command = Serial.read();
    switch (command)
    {
    case 'f':
      gunShot();
      break;
    case 's':
      gunShot();
      break;
    case 'h':
      pwm.writeMicroseconds(4, 2000);
      pwm.writeMicroseconds(5, 2000);
      break;
    case 'l':
      pwm.writeMicroseconds(4, 1000);
      pwm.writeMicroseconds(5, 1000);
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
}