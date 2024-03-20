'use strict';
goog.provide('Blockly.Arduino.roboProBot');
goog.require('Blockly.Arduino');

Blockly.Arduino.ROBO_PRO_BOT_PINS_MAP = {
  // RoboPro
  LeftMotorReverse: 4,
  LeftMotorPwm: 5,
  RightMotorPwm: 6,
  RightMotorReverse: 7
};

Blockly.Arduino.Direction = {
  Forward: 'FORWARD',
  Backward: 'BACKWARD',
  TurnLeft: 'TURN_LEFT',
  TurnRight: 'TURN_RIGHT'
};

Blockly.Arduino.DEGREE_RATIO = 120;

Blockly.Arduino['arduino_roboProBot_motorsOnForSeconds'] = function(block) {
  Blockly.Arduino.setupMotors_();
  var arg0 = Blockly.Arduino.valueToCode(block, 'SECONDS',
      Blockly.Arduino.ORDER_UNARY_POSTFIX);
  return Blockly.Arduino.motorsOnForSeconds_(arg0);
};

Blockly.Arduino['arduino_roboProBot_motorsOn'] = function() {
  Blockly.Arduino.setupMotors_();
  return "//Включение моторов\n_motorsOn();\n";
};

Blockly.Arduino['arduino_roboProBot_motorsOff'] = function() {
  Blockly.Arduino.setupMotors_();
  return "//Выключение моторов\n_motorsOff();\n";
};

Blockly.Arduino['arduino_roboProBot_setDirectionTo'] = function(block) {
  Blockly.Arduino.setupMotors_();
  var arg0 = block.getFieldValue('DIRECTION') || Blockly.Arduino.Direction.Forward;
  return Blockly.Arduino.setDirection_(arg0);
};

Blockly.Arduino['arduino_roboProBot_turnRight'] = function(block) {
  Blockly.Arduino.setupMotors_();
  var arg0 = Blockly.Arduino.valueToCode(block, 'DEGREES',
      Blockly.Arduino.ORDER_UNARY_POSTFIX);
  var code = `//Поворот направо на ${arg0} градусов\n`;
  code += Blockly.Arduino.setDirection_(Blockly.Arduino.Direction.TurnRight);
  code += Blockly.Arduino.motorsOnForSeconds_(arg0 / Blockly.Arduino.DEGREE_RATIO);
  return code;
};

Blockly.Arduino['arduino_roboProBot_turnLeft'] = function(block) {
  Blockly.Arduino.setupMotors_();
  var arg0 = Blockly.Arduino.valueToCode(block, 'DEGREES',
      Blockly.Arduino.ORDER_UNARY_POSTFIX);
  var code = `//Поворот налево на ${arg0} градусов\n`;
  code += Blockly.Arduino.setDirection_(Blockly.Arduino.Direction.TurnLeft);
  code += Blockly.Arduino.motorsOnForSeconds_(arg0 / Blockly.Arduino.DEGREE_RATIO);
  return code;
};

Blockly.Arduino['arduino_roboProBot_setMotorsPower'] = function(block) {
  Blockly.Arduino.setupMotors_();
  var arg0 = Blockly.Arduino.valueToCode(block, 'POWER',
      Blockly.Arduino.ORDER_UNARY_POSTFIX);
  var code = `//Установка мощности моторов на ${arg0}%\n`;
  code += `leftMotor.power = _convertPercentPower(${arg0});\n`;
  code += `rightMotor.power = _convertPercentPower(${arg0});\n`;
  return code;
};

Blockly.Arduino['arduino_roboProBot_setMotorsPowerLR'] = function(block) {
  Blockly.Arduino.setupMotors_();
  var arg0 = Blockly.Arduino.valueToCode(block, 'POWER_LEFT',
      Blockly.Arduino.ORDER_UNARY_POSTFIX);
  var arg1 = Blockly.Arduino.valueToCode(block, 'POWER_RIGHT',
      Blockly.Arduino.ORDER_UNARY_POSTFIX);
  var code = `//Установка мощности моторов. Левый: ${arg0}%, правый: ${arg1}%\n`;
  code += `leftMotor.power = _convertPercentPower(${arg0});\n`;
  code += `rightMotor.power = _convertPercentPower(${arg1});\n`;
  return code;
};

Blockly.Arduino['arduino_roboProBot_setPowerAndDirection'] = function(block) {
  Blockly.Arduino.setupMotors_();
  var arg0 = block.getFieldValue('DIRECTION_LEFT') || Blockly.Arduino.Direction.Forward;
  var arg1 = Blockly.Arduino.valueToCode(block, 'POWER_LEFT',
      Blockly.Arduino.ORDER_UNARY_POSTFIX);
  var arg2 = block.getFieldValue('DIRECTION_RIGHT') || Blockly.Arduino.Direction.Forward;
  var arg3 = Blockly.Arduino.valueToCode(block, 'POWER_RIGHT',
      Blockly.Arduino.ORDER_UNARY_POSTFIX);
  var code = `//Установка направления и мощности моторов. Левый: ${arg0} ${arg1}%, правый: ${arg2} ${arg3}%\n`;
  code += Blockly.Arduino.setSingleMotorDirection_('leftMotor', arg0);
  code += `leftMotor.power = _convertPercentPower(${arg1});\n`;
  code += Blockly.Arduino.setSingleMotorDirection_('rightMotor', arg2);
  code += `rightMotor.power = _convertPercentPower(${arg3});\n`;
  return code;
};

Blockly.Arduino['arduino_roboProBot_readSensor'] = function(block) {
  Blockly.Arduino.setupSensors_();
  var arg0 = block.getFieldValue('PIN') || 'A1';
  var code = `_mapSensorValue(${arg0}, analogRead(${arg0}))`;
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino.motorsOnForSeconds_ = function(seconds) {
  var code = "//Включение моторов на " + seconds + " секунд\n";
  code += "_motorsOn();\n";
  code += "delay(" + seconds + " * 1000" + ");\n";
  code += "_motorsOff();\n";
  return code;
};

Blockly.Arduino.setDirection_ = function(direction) {
  var code = "//Установка направления движения " + direction + "\n";
  switch (direction) {
    case Blockly.Arduino.Direction.Forward:
      code += "leftMotor.reverse = false;\n";
      code += "rightMotor.reverse = false;\n";
      break;
    case Blockly.Arduino.Direction.Backward:
      code += "leftMotor.reverse = true;\n";
      code += "rightMotor.reverse = true;\n";
      break;
    case Blockly.Arduino.Direction.TurnLeft:
      code += "leftMotor.reverse = true;\n";
      code += "rightMotor.reverse = false;\n";
      break;
    case Blockly.Arduino.Direction.TurnRight:
      code += "leftMotor.reverse = false;\n";
      code += "rightMotor.reverse = true;\n";
      break;
  }
  return code;
};

Blockly.Arduino.setSingleMotorDirection_ = function(motor, direction) {
  var code = "";
  switch (direction) {
    case Blockly.Arduino.Direction.Forward:
      code += motor + ".reverse = false;\n";
      break;
    case Blockly.Arduino.Direction.Backward:
      code += motor + ".reverse = true;\n";
      break;
  }
  return code;
};

Blockly.Arduino.setupSensors_ = function() {
  Blockly.Arduino.definitions_['SENSOR_CONSTANTS'] = `const int IN_SENSOR_MIN = 0;
const int IN_SENSOR_MAX = 255;
const int OUT_SENSOR_MIN = 0;
const int OUT_SENSOR_MAX = 100;\n`;

  Blockly.Arduino.customFunctions_['_mapSensorValue'] = `int _mapSensorValue(int pin, int value) {
    switch (pin) {
      case A3:
        value = IN_SENSOR_MAX - value;
        break;
    }
    value = map(value, IN_SENSOR_MIN, IN_SENSOR_MAX, OUT_SENSOR_MIN, OUT_SENSOR_MAX);
    return round(value);
}\n`;
};

Blockly.Arduino.setupMotors_ = function() {
  Blockly.Arduino.definitions_['MOTOR_POWER_CONSTANTS'] = `const int MIN_MOTOR_POWER = 0;
const int MAX_MOTOR_POWER = 255;\n`;

  Blockly.Arduino.definitions_['Motor_struct'] = `struct Motor {
  int pwmPin;
  int reversePin;
  int power;
  bool reverse;
};

Motor leftMotor;
Motor rightMotor;`;

  Blockly.Arduino.customFunctions_['_motorsOn'] = `void _motorsOn() {
  analogWrite(leftMotor.pwmPin, leftMotor.power);
  analogWrite(leftMotor.reversePin, leftMotor.reverse ? HIGH : LOW);
  analogWrite(rightMotor.pwmPin, rightMotor.power);
  analogWrite(rightMotor.reversePin, rightMotor.reverse ? HIGH : LOW);
}\n`;

  Blockly.Arduino.customFunctions_['_motorsOff'] = `void _motorsOff() {
  analogWrite(leftMotor.pwmPin, MIN_MOTOR_POWER);
  analogWrite(leftMotor.reversePin, LOW);
  analogWrite(rightMotor.pwmPin, MIN_MOTOR_POWER);
  analogWrite(rightMotor.reversePin, LOW);
}\n`;

  Blockly.Arduino.customFunctions_['_convertPercentPower'] = `int _convertPercentPower (int percentPower) {
    if (percentPower < 0) {
      percentPower = 0;
    } else if (percentPower > 100) {
      percentPower = 100;
    }
    return ((percentPower * (MAX_MOTOR_POWER - MIN_MOTOR_POWER)) / 100) + MIN_MOTOR_POWER;
}\n`;

  Blockly.Arduino.setups_['leftMotor'] = `// Инициализация состояния левого мотора
  leftMotor.pwmPin = ${Blockly.Arduino.ROBO_PRO_BOT_PINS_MAP.LeftMotorPwm};
  leftMotor.reversePin = ${Blockly.Arduino.ROBO_PRO_BOT_PINS_MAP.LeftMotorReverse};
  leftMotor.power = MAX_MOTOR_POWER;
  leftMotor.reverse = false;\n`;

  Blockly.Arduino.setups_['rightMotor'] = `// Инициализация состояния правого мотора
  rightMotor.pwmPin = ${Blockly.Arduino.ROBO_PRO_BOT_PINS_MAP.RightMotorPwm};
  rightMotor.reversePin = ${Blockly.Arduino.ROBO_PRO_BOT_PINS_MAP.RightMotorReverse};
  rightMotor.power = MAX_MOTOR_POWER;
  rightMotor.reverse = false;\n`;

  Blockly.Arduino.setups_['motorPins'] = `// Инициализация пинов моторов
  analogWrite(leftMotor.pwmPin, MIN_MOTOR_POWER);
  analogWrite(leftMotor.reversePin, LOW);
  analogWrite(rightMotor.pwmPin, MIN_MOTOR_POWER);
  analogWrite(rightMotor.reversePin, LOW);\n`;
};
