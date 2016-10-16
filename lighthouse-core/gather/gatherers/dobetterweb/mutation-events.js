/**
 * @license
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Tests whether the page is using Date.now().
 */

'use strict';

const Gatherer = require('../gatherer');

const MUTATION_EVENTS = [
  'DOMAttrModified',
  'DOMAttributeNameChanged',
  'DOMCharacterDataModified',
  'DOMElementNameChanged',
  'DOMNodeInserted',
  'DOMNodeInsertedIntoDocument',
  'DOMNodeRemoved',
  'DOMNodeRemovedFromDocument',
  'DOMSubtreeModified'
];

class MutationEventUse extends Gatherer {

  beforePass(options) {
    this.collectUsage = options.driver.captureFunctionCallSites('addEventListener');
    this.collectUsage2 = options.driver.captureFunctionCallSites('document.addEventListener');
    // TODO: document.body appears to not be defined by this time.
    // this.collectUsage3 = options.driver.captureFunctionCallSites('document.body.addEventListener');
  }

  afterPass() {
    const promise = this.collectUsage().then(results1 => {
      return this.collectUsage2().then(results2 => results1.concat(results2));
    });

    return promise.then(uses => {
      uses = uses.filter(use => {
        const eventName = use.args[0];
        return MUTATION_EVENTS.indexOf(eventName) !== -1;
      });
      this.artifact.usage = uses;
    }, _ => {
      this.artifact = -1;
      return;
    });
  }
}

module.exports = MutationEventUse;
