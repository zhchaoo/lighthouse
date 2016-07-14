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
'use strict';

const Gather = require('./gather');

/* global document, URL, __returnResults */

/* istanbul ignore next */
function getUnsizedMediaElements() {
  var hasSizeAttributes = function(element) {
    // Simple early exit for an element with declared attributes.
    if (element.getAttribute('width') && element.getAttribute('height')) {
      return true;
    }

    // For all other cases you need to step through CSS rules and find the ones
    // that match the element in question, then interrogate it for width & height
    // properties
    var rules = [];
    for (let sheet of document.styleSheets) {
      for (let rule of sheet.rules) {
        if (element.matches(rule.selectorText)) {
          rules.push(rule);
        }
      }
    }

    var definesSizes = rules.find(r => r.style.width !== '' && r.style.height !== '');
    return (definesSizes !== undefined);
  };

  var unsizedElements =
      [...document.querySelectorAll('img, video, svg')]
      .filter(el => !hasSizeAttributes(el))
      .map(el => {
        let fileName;
        if (el.src) {
          fileName = new URL(el.src).pathname.split('/').slice(-1)[0];
        }

        return `${el.nodeName.toLowerCase()}${el.className ? '.' + el.className : ''}` +
            `${fileName ? ` (${fileName})` : ''}`;
      });

  __returnResults(unsizedElements);
}

class MediaSized extends Gather {

  afterPass(options) {
    return options.driver.evaluateAsync(`(${getUnsizedMediaElements.toString()}())`)
        .then(returnedValue => {
          this.artifact = returnedValue;
        }, _ => {
          this.artifact = -1;
        });
  }
}

module.exports = MediaSized;
