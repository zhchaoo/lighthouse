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
 * @fileoverview Audit a page to see if it is using Mutation Events (and suggest
 *     MutationObservers instead).
 */

'use strict';

const url = require('url');
const Audit = require('../audit');
const Formatter = require('../../formatters/formatter');

class NoMutationEventsAudit extends Audit {

  /**
   * @return {!AuditMeta}
   */
  static get meta() {
    return {
      category: 'JavaScript',
      name: 'no-mutation-events',
      description: 'Site does not use Mutation Events in its own scripts',
      helpText: 'Using <a href="https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Mutation_events" target="_blank">Mutation events</a> degrades application performance. They are deprecated in the DOM events spec, replaced by <a href="https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver" target="_blank">MutationObservers</a>.',
      requiredArtifacts: ['URL', 'MutationEventUse']
    };
  }

  /**
   * @param {!Artifacts} artifacts
   * @return {!AuditResult}
   */
  static audit(artifacts) {
    if (typeof artifacts.MutationEventUse === 'undefined' ||
        artifacts.MutationEventUse === -1) {
      return NoMutationEventsAudit.generateAuditResult({
        rawValue: -1,
        debugString: 'MutationEventUse gatherer did not run'
      });
    }

    const pageHost = url.parse(artifacts.URL.finalUrl).host;
    // Filter usage from other hosts.
    const results = artifacts.MutationEventUse.usage.filter(err => {
      return url.parse(err.url).host === pageHost;
    }).map(err => {
      return Object.assign({
        label: `line: ${err.line}, col: ${err.col}`
      }, err);
    });

    return NoMutationEventsAudit.generateAuditResult({
      rawValue: results.length === 0,
      extendedInfo: {
        formatter: Formatter.SUPPORTED_FORMATS.URLLIST,
        value: results
      }
    });
  }
}

module.exports = NoMutationEventsAudit;
