/**
 * @license
 * Copyright 2016 Google Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

'use strict';

const Audit = require('./audit');
const TracingProcessor = require('../lib/traces/tracing-processor');
const FMPMetric = require('./first-meaningful-paint');

class TTIMetric extends Audit {
  /**
   * @return {!AuditMeta}
   */
  static get meta() {
    return {
      category: 'Performance',
      name: 'time-to-interactive',
      description: 'Time To Interactive',
      optimalValue: '<50ms at the 90% percentile',
      requiredArtifacts: ['traceContents', 'speedline']
    };
  }

  /**
   * Identify the time the page is "interactive"
   * @see https://docs.google.com/document/d/1oiy0_ych1v2ADhyG_QW7Ps4BNER2ShlJjx2zCbVzVyY/edit#
   *
   * The user thinks the page is ready - (They believe the page is done enough to start interacting with)
   *   - Layout has stabilized & key webfonts are visible.
   *     AKA: First meaningful paint has fired.
   *   - Page is nearly visually complete
   *     Visual completion is 85%
   *   - User-agent loading indicator is done
   *     Current definition: Top frame and all iframes have fired window load event
   *     Proposed definition (from cl/1860743002): top frame only: DCL ended and all layout-blocking resources, plus images that begun their request before DCL ended have finished.
   *     Alternative definition (from Chrome on Android Progress Bar Enhancements - google-only, sry): top frame's DOMContentLoaded + top frame's images (who started before DCL) are loaded
   *
   * The page is actually ready for user:
   *   - domContentLoadedEventEnd has fired
   *     Definition: HTML parsing has finished, all DOMContentLoaded handlers have run.
   *     No risk of DCL event handlers changing the page
   *     No surprises of inactive buttons/actions as DOM element event handlers should be bound
   *   - The main thread is available enough to handle user input
   *     first 500ms window where Est Input Latency is <50ms at the 90% percentile.
   * @param {!Artifacts} artifacts The artifacts from the gather phase.
   * @return {!AuditResult} The score from the audit, ranging from 0-100.
   */
  static audit(artifacts) {

    // Max(FMPMetric, DCLEnded, visProgress[0.85]) is where we begin looking
    FMPMetric.audit(artifacts).then(result => {
      const fMP = result.rawValue;

      // todo DCLEnded

      // look at speedline results for 85% starting at FMP
      // const visualProgress = artifacts.Speedline;
      // debugger;

      // TODO: Consider UA loading indicator

      const tracingProcessor = new TracingProcessor();
      const model = tracingProcessor.init(artifacts.traceContents);
      const endOfTraceTime = model.bounds.max;

      // Find first 500ms window where Est Input Latency is <50ms at the 90% percentile.
      let startTime = parseFloat(fMP) - 50; // Math.max(fMP, visualProgress);
      let endTime;
      let currentLatency = Infinity;
      const percentile = 0.9;
      const threshold = 50;
      let foundLatencies = [];

      while (currentLatency > threshold) {
        // While latency is too high, increment just 50ms and look again.
        startTime += 50;
        endTime = startTime + 500;
        // If there's no more room in the trace to look, we're done.
        if (endTime > endOfTraceTime) {
          // TODO return an error instead
          return;
        }
        // Get our expected latency for the time window
        const latencies = TracingProcessor.getRiskToResponsiveness(
          model, artifacts.traceContents, startTime, endTime);
        const estLatency = latencies.find(res => res.percentile === percentile);
        foundLatencies.push(Object.assign({}, estLatency, {startTime}));
        console.log('At', startTime, '90 percentile est latency is ~', estLatency.time);
        // If the expected latency is low enough, we have our TTI
        currentLatency = estLatency.time;
      }

      return TTIMetric.generateAuditResult({
        value: startTime,
        rawValue: startTime,
        optimalValue: this.meta.optimalValue,
        extendedInfo: foundLatencies
      });
    });
  }
}

module.exports = TTIMetric;
