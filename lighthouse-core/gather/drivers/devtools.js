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
    console.log('devtoolsDriver', 'initializing...');
    // this.handleUnexpectedDetach();
  }

  connect() {
    console.info('starting to connect() in driver');
    this.beginLogging();

    if (!WebInspector.targetManager.mainTarget()) {
      Promise.reject(new Error('no target found'));
    }

    this._eventEmitter = new EventEmitter();

    this._connection = WebInspector.targetManager.mainTarget().connection();
    this._origConnectionDispatch = this._connection.dispatch.bind(this._connection);
    // overwrite handler
    this._connection.dispatch = this._connectionDispatchHijack.bind(this);

    return Promise.resolve();
  }

  disconnect() {
    this.ceaseLogging();
    this._connection.dispatch = this._origConnectionDispatch;
    this._eventEmitter = null;
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

  /**
   * Intercept all messages being received by DevTools, passing along events if we find them.
   * @param  {!MessageEvent} message
   */
  _connectionDispatchHijack(message) {
    var messageObject = /** @type {!Object} */ ((typeof message === 'string') ?
        JSON.parse(message) : message);

    // handle response to a method
    if ('id' in messageObject) {
      this._origConnectionDispatch(message);
      return;
    }

    // handle it as an event
    const method = messageObject.method;
    const params = messageObject.params;

    console.log('<=', method, params);
    // tell lighthouse about the event
    this._eventEmitter.emit(method, params);
    // let devtools know about these events, too.
    this._origConnectionDispatch(message);
  }

  /**
   * Call protocol methods
   * @param {!string} command
   * @param {!Object} params
   * @return {!Promise}
   */
  sendCommand(command, params) {
    return new Promise((resolve, reject) => {
      function handleResponse(result) {
        console.log('method <= browser OK', command, result);
        resolve(result);
      }

      console.log('method => browser', command, params);
      WebInspector.sendOverProtocol(command, params).then(handleResponse.bind(this));
    });
  }

  handleUnexpectedDetach(detachReason) {
    throw new Error('Lighthouse detached from browser: ' + detachReason);
  }
}

module.exports = DevToolsDriver;
