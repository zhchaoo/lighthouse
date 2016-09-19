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
const log = require('../../lib/log.js');

const EventEmitter = require('events').EventEmitter;

/**
 * VERY MUCH WIP.
 * DevTools side of this patch (where most action is right now... ) is at:
 *    https://codereview.chromium.org/1933893003
 */

/* globals WebInspector, InspectorBackendClass */

class DevToolsDriver extends Driver {

  constructor() {
    super();
    this._listeners = {};
    // this.handleUnexpectedDetach();
  }

  connect() {
    console.info('starting to connect() in driver');
    this.beginLogging();

    if (!WebInspector.targetManager.mainTarget()) {
      Promise.reject(new Error('no target found'));
    }

    this._eventEmitter = new EventEmitter();

    InspectorFrontendHost.events.addEventListener(InspectorFrontendHostAPI.Events.DispatchMessage, this._dispatchMessage.bind(this), this);
    InspectorFrontendHost.events.addEventListener(InspectorFrontendHostAPI.Events.DispatchMessageChunk, this._dispatchMessageChunk.bind(this), this);

    return Promise.resolve();
  }

  disconnect() {
    this.ceaseLogging();
    // we dont' really disconnect in this scenario
    return Promise.resolve();
  }

  beginLogging() {
    // log everything
    InspectorBackendClass.Options.dumpInspectorProtocolMessages = true;
  }

  ceaseLogging() {
    InspectorBackendClass.Options.dumpInspectorProtocolMessages = false;
  }

  _dispatchMessage(event) {
    // log events received
    debugger;
    log.log('<=', method, params);

    this._eventEmitter.emit(method, params);
  }

  _dispatchMessageChunk(event) {
    console.log('evtchunk', arguments);
    var messageChunk = /** @type {string} */ (event.data["messageChunk"]);
    var messageSize = /** @type {number} */ (event.data["messageSize"]);
    if (messageSize) {
        this._messageBuffer = "";
        this._messageSize = messageSize;
    }
    this._messageBuffer += messageChunk;
    if (this._messageBuffer.length === this._messageSize) {
        this.dispatch(this._messageBuffer);
        this._messageBuffer = "";
        this._messageSize = 0;
    }
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

      WebInspector.sendOverProtocol(command, params).then(handleResponse);
    });
  }

  handleUnexpectedDetach(detachReason) {
    throw new Error('Lighthouse detached from browser: ' + detachReason);
  }
}

module.exports = DevToolsDriver;
