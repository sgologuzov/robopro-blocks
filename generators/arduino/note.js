/**
 * Visual Blocks Language
 *
 * Copyright 2021 openblock.cc.
 * https://github.com/sgologuzov/robopro-blocks
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

goog.provide('Blockly.Arduino.note');

goog.require('Blockly.Arduino');


Blockly.Arduino['note'] = function(block) {
  // Numeric value.
  var code = block.getFieldValue('NOTE');
  if (isNaN(code)) {
    code = 0;
  }
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};
