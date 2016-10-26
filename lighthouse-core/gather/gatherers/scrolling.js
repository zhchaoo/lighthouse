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

function scrollPage(distance, speed) {
  var oldTitle = document.title;
  var ratio = document.body.clientWidth / screen.width;
  var oldBodyHeight = document.body.clientHeight;
  var oldDocHeight = document.documentElement.clientHeight;
  var start = performance.now();
  document.title = "Scrolling";
  return new Promise((resolve, reject) => {
    chrome.gpuBenchmarking.smoothScrollBy(distance * ratio, resolve,
      0, 0, 0, "down", speed);
  }).then(_ => {
    var scrollTime = performance.now() - start;
    var scrollOffset = window.pageYOffset / ratio;
    var bodyHeightDiff = (document.body.clientHeight - oldBodyHeight) / ratio;
    var docHeightDiff = (document.documentElement.clientHeight - oldDocHeight) / ratio;
    document.title = oldTitle;
    return ({scrollOffset: scrollOffset, expectedOffset: distance,
      heightDiff: bodyHeightDiff > docHeightDiff ? bodyHeightDiff : docHeightDiff});
  });
}

class Scrolling extends Gatherer {
  beforePass(options) {
    return options.driver.goOnline(options);
  }

  pass(options) {
    const driver = options.driver;
    const scrollDistance = options.config.scrollDistance ? options.config.scrollDistance : 10000;
    const scrollSpeed = options.config.scrollSpeed ? options.config.scrollSpeed : 1000;
    return driver.evaluateAsync(`(${scrollPage.toString()}(${scrollDistance}, ${scrollSpeed}))`)
      .then(returnedValue => {
        this.artifact = returnedValue;
      })
      .catch(_ => {
        this.artifact = {scrollOffset: -1, heightDiff: -1, expectedOffset: scrollDistance};
      });
  }
}

module.exports = Scrolling;
