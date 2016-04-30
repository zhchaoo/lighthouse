/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const Driver = require('./driver.js');
const log = require('../log.js');

/* globals WebInspector, InspectorBackendClass */

class DevToolsDriver extends Driver {

  constructor() {
    super();
    this._listeners = {};
    // this.handleUnexpectedDetach();
  }

  connect() {
    console.info('success! tring to connect() in driver');
    this.beginLogging();

    if (WebInspector.targetManager._targets.length) {
      Promise.resolve();
    }

    return Promise.resolve();
  }

  disconnect() {
    this.ceaseLogging();
    // we dont' really disconnect in this scenario
    return Promise.resolve();
  }

  beginLogging() {
    // log everything
    InspectorBackendClass.Options.dumpLighthouseProtocolMessages = true;
  }

  ceaseLogging() {
    InspectorBackendClass.Options.dumpLighthouseProtocolMessages = false;
  }

  /**
   * Bind listeners for protocol events
   * @param {!string} eventName
   * @param {function(...)} cb
   */
  on(eventName, cb) {
    if (typeof this._listeners[eventName] === 'undefined') {
      this._listeners[eventName] = [];
    }
    // log event listeners being bound
    log.log('NOT IMPLEMENTED listen for event =>', eventName);
    this._listeners[eventName].push(cb);
  }

  _onEvent(source, method, params) {
    if (typeof this._listeners[method] === 'undefined') {
      return;
    }

    this._listeners[method].forEach(cb => {
      cb(params);
    });

    // Reset the listeners;
    this._listeners[method].length = 0;
  }

  /**
   * Call protocol methods
   * @param {!string} command
   * @param {!Object} params
   * @return {!Promise}
   */
  sendCommand(command, params) {
    return new Promise((resolve, reject) => {
      const handleResponse = result => {
        log.log('method <= browser OK', command, result);
        resolve(result);
      };

      log.log('method => browser', command, params);

      window.lighthouseConnection.sendCommand(command, params, handleResponse);
    });
  }

  handleUnexpectedDetach(detachReason) {
    throw new Error('Lighthouse detached from browser: ' + detachReason);
  }

  off(eventName, cb) {
    if (typeof this._listeners[eventName] === 'undefined') {
      console.warn(`Unable to remove listener ${eventName}; no such listener found.`);
      return;
    }

    const callbackIndex = this._listeners[eventName].indexOf(cb);
    if (callbackIndex === -1) {
      return;
    }

    this._listeners[eventName].splice(callbackIndex, 1);
  }
}

module.exports = DevToolsDriver;
