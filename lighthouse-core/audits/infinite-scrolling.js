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

const Audit = require('./audit');
const TracingProcessor = require('../lib/traces/tracing-processor');
const TRACE_NAME = 'scrolling';

class InfiniteScrolling extends Audit {
  /**
   * @return {!AuditMeta}
   */
  static get meta() {
    return {
      category: 'Performance',
      name: 'infinite-scrolling',
      description: 'Infinite scrolling, List increment test.',
      requiredArtifacts: ['Scrolling']
    };
  }

  /**
   * @param {!Artifacts} artifacts
   * @return {!AuditResult}
   */
  static audit(artifacts) {
    if (typeof artifacts.Scrolling === 'undefined' ||
      typeof artifacts.Scrolling.scrollOffset === 'undefined' ||
      typeof artifacts.Scrolling.expectedOffset === 'undefined' ||
      typeof artifacts.Scrolling.heightDiff === 'undefined') {
      return InfiniteScrolling.generateAuditResult({
        rawValue: -1,
        debugString: 'Unable to find scroll.'
      });
    }

    const scrollThreshould = artifacts.Scrolling.expectedOffset / 3;
    if (artifacts.Scrolling.heightDiff < scrollThreshould) {
      return InfiniteScrolling.generateAuditResult({
        rawValue: -1,
        debugString: 'The page has no infinite scroll list'
      })
    }
    var scrollOffset = artifacts.Scrolling.scrollOffset - scrollThreshould;
    var expectedOffset = artifacts.Scrolling.expectedOffset - scrollThreshould;
    const scrollScore = Math.round(scrollOffset * 100 / expectedOffset);
    return InfiniteScrolling.generateAuditResult({
      rawValue: scrollScore
    });
  }
}

module.exports = InfiniteScrolling;
