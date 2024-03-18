'use strict';
goog.provide('Blockly.Arduino.roboProBot');
goog.require('Blockly.Arduino');

// motorsOnForSeconds
// motorsOn
// motorsOff
// setDirectionTo
// turnRight
// turnLeft
// setMotorsPower
// setMotorsPowerLR
// setPowerAndDirection

Blockly.Arduino['arduino_roboProBot_readSensor'] = function(block) {
  var arg0 = block.getFieldValue('PIN') || 'A1';
  var code = "analogRead(" + arg0 + ")";
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};
