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

/* global document, window, chrome, __returnResults */

'use strict';

const Gatherer = require('./gatherer');

function scrollPage() {
  const distance = document.body.offsetHeight - window.innerHeight;
  chrome.gpuBenchmarking.smoothScrollBy(distance, __returnResults);
}

class Scrolling extends Gatherer {
  pass(options) {
    const driver = options.driver;
    return driver.evaluateAsync(`(${scrollPage.toString()}())`)
      .then(_ => {
        this.artifact = 'lols';
      })
      .catch(_ => {
        this.artifact = 'fail';
      });
  }
}

module.exports = Scrolling;
