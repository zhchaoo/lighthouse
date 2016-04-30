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

const DevToolsProtocol = require('../../src/lib/drivers/devtools.js');
const lighthouse = require('../../src/lighthouse');
const NO_SCORE_PROVIDED = '-1';


global.runAudits = function(options) {
  const driver = new DevToolsProtocol();
  const url = options.url;
  return lighthouse(driver, Object.assign({}, options, {url}));
};

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
    .replace(/`/g, '&#96;');
}

global.createResultsHTML = function(results) {
  let resultsHTML = '';

  results.aggregations.forEach(item => {
    const score = (item.score.overall * 100).toFixed(0);
    const groupHasErrors = (score < 100);
    const groupClass = 'group ' +
        (groupHasErrors ? 'errors expanded' : 'no-errors collapsed');

    // Skip any tests that didn't run.
    if (score === NO_SCORE_PROVIDED) {
      return;
    }

    let groupHTML = '';
    item.score.subItems.forEach(subitem => {
      const debugString = subitem.debugString ? ` title="${escapeHTML(subitem.debugString)}"` : '';

      const status = subitem.value ?
          `<span class="pass" ${debugString}>Pass</span>` :
          `<span class="fail" ${debugString}>Fail</span>`;
      const rawValue = subitem.rawValue ? `(${escapeHTML(subitem.rawValue)})` : '';
      groupHTML += `<li>${escapeHTML(subitem.description)}: ${status} ${rawValue}</li>`;
    });

    resultsHTML +=
      `<li class="${groupClass}">
        <span class="group-name">${escapeHTML(item.name)}</span>
        <span class="group-score">(${score}%)</span>
        <ul>
          ${groupHTML}
        </ul>
      </li>`;
  });

  return resultsHTML;
};
