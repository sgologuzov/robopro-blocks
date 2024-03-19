'use strict';
goog.provide('Blockly.Arduino.roboProBot');
goog.require('Blockly.Arduino');

const ROBO_PRO_BOT_PINS_MAP = {
  // RoboPro
  LeftMotorReverse: 4,
  LeftMotorPwm: 5,
  RightMotorPwm: 6,
  RightMotorReverse: 7
};

const Direction = {
  Forward: 'FORWARD',
  Backward: 'BACKWARD',
  TurnLeft: 'TURN_LEFT',
  TurnRight: 'TURN_RIGHT'
};

// motorsOnForSeconds
// motorsOn
// motorsOff
// setDirectionTo
// turnRight
// turnLeft
// setMotorsPower
// setMotorsPowerLR
// setPowerAndDirection

Blockly.Arduino['arduino_roboProBot_motorsOnForSeconds'] = function(block) {
  setupMotors();
  // Numeric value.
  var delay = parseFloat(block.getFieldValue('SECONDS'));
  if (isNaN(delay)) {
    delay = 0;
  }
  var code = "//Включение моторов на " + delay + " секунд\n_motorsOn();\ndelay(" + delay * 1000 + ");";
  return code;
};

Blockly.Arduino['arduino_roboProBot_motorsOn'] = function(block) {
  setupMotors();
  var code = "//Включение моторов\n_motorsOn();";
  return code;
};

Blockly.Arduino['arduino_roboProBot_motorsOff'] = function(block) {
  setupMotors();
  var code = "//Выключение моторов\n_motorsOff();";
  return code;
};

Blockly.Arduino['arduino_roboProBot_setDirectionTo'] = function(block) {
  var arg0 = block.getFieldValue('DIRECTION') || Direction.Forward;
  var code = "//Установка направления движения " + arg0 + "\n";
  switch (arg0) {
    case Direction.Forward:
      code += "leftMotor.reverse = false;\n";
      code += "rightMotor.reverse = false;";
      break;
    case Direction.Backward:
      code += "leftMotor.reverse = true;\n";
      code += "rightMotor.reverse = true;";
      break;
    case Direction.TurnLeft:
      code += "leftMotor.reverse = true;\n";
      code += "rightMotor.reverse = false;";
      break;
    case Direction.TurnRight:
      code += "leftMotor.reverse = false;\n";
      code += "rightMotor.reverse = true;";
      break;
  }
  return code;
};

Blockly.Arduino['arduino_roboProBot_readSensor'] = function(block) {
  var arg0 = block.getFieldValue('PIN') || 'A1';
  var code = "analogRead(" + arg0 + ")";
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

function setupMotors() {
  Blockly.Arduino.definitions_['MOTOR_POWER_CONSTANTS'] = 'const int MIN_MOTOR_POWER = 0;\nconst int MAX_MOTOR_POWER = 255\n';

  //Blockly.Arduino.definitions_['DIRECTION_ENUM'] = `enum DIRECTION {FORWARD, BACKWARD, TURN_LEFT, TURN_RIGHT};\nDIRECTION directionLeft = FORWARD;\nDIRECTION directionRight = FORWARD;`;

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

  Blockly.Arduino.setups_['leftMotor'] = `// Инициализация состояния левого мотора
  leftMotor.pwmPin = ${ROBO_PRO_BOT_PINS_MAP.LeftMotorPwm};
  leftMotor.reversePin = ${ROBO_PRO_BOT_PINS_MAP.LeftMotorReverse};
  leftMotor.power = MIN_MOTOR_POWER;
  leftMotor.reverse = false;\n`;

  Blockly.Arduino.setups_['rightMotor'] = `// Инициализация состояния правого мотора
  rightMotor.pwmPin = ${ROBO_PRO_BOT_PINS_MAP.RightMotorPwm};
  rightMotor.reversePin = ${ROBO_PRO_BOT_PINS_MAP.RightMotorReverse};
  rightMotor.power = MIN_MOTOR_POWER;
  rightMotor.reverse = false;\n`;

  Blockly.Arduino.setups_['motorPins'] = `// Инициализация пинов моторов
  analogWrite(leftMotor.pwmPin, MIN_MOTOR_POWER);
  analogWrite(leftMotor.reversePin, LOW);
  analogWrite(rightMotor.pwmPin, MIN_MOTOR_POWER);
  analogWrite(rightMotor.reversePin, LOW);\n`;
}
