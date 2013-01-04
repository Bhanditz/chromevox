// Copyright 2012 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A simple container object for the description of a
 * navigation from one object to another.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */


goog.provide('cvox.NavDescription');

goog.require('cvox.AbstractTts');
goog.require('cvox.ChromeVox');
goog.require('cvox.CursorSelection');

/**
 * A class representing the description of navigation from one object to
 * another.
 * @param {{context: (undefined|string),
 *          text: (undefined|string),
 *          userValue: (undefined|string),
 *          annotation: (undefined|string),
 *          earcons: (undefined|Array.<number>),
 *          personality: (undefined|Object)}} kwargs The arguments for this
 *  description.
 *  context The context, for example descriptions of objects
 *     that were crossed into, like "Toolbar" or "Menu Bar" or "List with
 *     5 items". This is all spoken with an annotation voice.
 *  text The text of the object itself, including text from
 *     titles, labels, etc.
 *  userValue The text that the user has entered.
 *  annotation The role and state of the object.
 *  earcons A list of the earcon ids to play along
 *     with the spoken description of this object.
 *  personality Optional TTS personality to use for the text.
 * @constructor
 */
cvox.NavDescription = function(kwargs) {
  this.context = kwargs.context ? kwargs.context : '';
  this.text = kwargs.text ? kwargs.text : '';
  this.userValue = kwargs.userValue ? kwargs.userValue : '';
  this.annotation = kwargs.annotation ? kwargs.annotation : '';
  this.earcons = kwargs.earcons ? kwargs.earcons : [];
  this.personality = kwargs.personality;
};


/**
 * @return {boolean} true if this description is empty.
 */
cvox.NavDescription.prototype.isEmpty = function() {
  return (this.context.length == 0 &&
          this.earcons.length == 0 &&
          this.text.length == 0 &&
          this.userValue.length == 0 &&
          this.annotation.length == 0);
};


/**
 * @return {string} A string representation of this object.
 */
cvox.NavDescription.prototype.toString = function() {
  return 'NavDescription(context="' + this.context + '" ' +
         ' text="' + this.text + '" ' +
         ' userValue="' + this.userValue + '" ' +
         ' annotation="' + this.annotation + '")';
};


/**
 * Modifies the earcon to play along with the spoken description of the object.
 * @param {number} earconId An earcon id to be pushed on to the list of earcon
 * ids to play along with the spoken description of this object.
 */
cvox.NavDescription.prototype.pushEarcon = function(earconId) {
  this.earcons.push(earconId);
};


/**
 * Speak this nav description with the given queue mode.
 * @param {number=} queueMode The queue mode: cvox.AbstractTts.QUEUE_MODE_FLUSH
 *     for flush, cvox.AbstractTts.QUEUE_MODE_QUEUE for adding to queue.
 * @param {function()=} startCallback Function called when this starts speaking.
 * @param {function()=} endCallback Function called when this ends speaking.
 */
cvox.NavDescription.prototype.speak = function(
    queueMode, startCallback, endCallback) {
  /**
   * Return a deep copy of PERSONALITY_ANNOTATION for modifying.
   * @return {Object} The newly created properties object.
   */
  function makeAnnotationProps() {
    var properties = {};
    var src = cvox.AbstractTts.PERSONALITY_ANNOTATION;
    for (var key in src) {
      properties[key] = src[key];
    }
    return properties;
  }

  var speakArgs = new Array();
  if (this.context) {
    speakArgs.push([this.context, queueMode, makeAnnotationProps()]);
    queueMode = 1;
  }

  speakArgs.push([this.text,
                  queueMode,
                  this.personality ? this.personality : {}]);
  queueMode = 1;

  if (this.userValue) {
    speakArgs.push([this.userValue, queueMode, {}]);
  }

  if (this.annotation) {
    speakArgs.push([this.annotation, queueMode, makeAnnotationProps()]);
  }

  var length = speakArgs.length;
  for (var i = 0; i < length; i++) {
    if (i == 0 && startCallback) {
      speakArgs[i][2]['startCallback'] = startCallback;
    }
    if (i == length - 1 && endCallback) {
      speakArgs[i][2]['endCallback'] = endCallback;
    }
    cvox.ChromeVox.tts.speak.apply(cvox.ChromeVox.tts, speakArgs[i]);
  }
};
