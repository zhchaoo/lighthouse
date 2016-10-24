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
const TimelineModel = require('../lib/traces/devtools-timeline-model');
const TracingProcessor = require('../lib/traces/tracing-processor');
const TRACE_NAME = 'scrolling';

/**
 * @param {!Array<!Object>} traceData
 * @return {!Array<!traceDataAfterFilter>}
 */
function filterTrace(traceData, filterName) {
  const timelineModel = new TimelineModel(traceData);
  const modeledTraceData = timelineModel.timelineModel();

  return modeledTraceData.inspectedTargetEvents()
    .filter(ut => {
      if (ut.name === filterName) {
        return true;
      }

      return false;
    });
}

/**
 * @param {!Array<!Object>} traceData
 * @return {!Array<!fpsInfos>}
 */
function calculateFps(traceData) {
  const FpsData = [];
  var lastFrameStartTime = 0;
  traceData.forEach(ut => {
    // skip too large frames
    if (ut.startTime - lastFrameStartTime > 150) {
      lastFrameStartTime = ut.startTime;
      return;
    }
    var fps = 1000 / (ut.startTime - lastFrameStartTime);
    lastFrameStartTime = ut.startTime;
    FpsData.push({FPS: fps, startTime: ut.startTime});
  });

  return FpsData;
}

class SmoothScrolling extends Audit {
  /**
   * @return {!AuditMeta}
   */
  static get meta() {
    return {
      category: 'Performance',
      name: 'smooth-scrolling',
      description: 'Smooth scrolling, scroll performance test(fps).',
      requiredArtifacts: ['Scrolling']
    };
  }

  /**
   * @param {!Artifacts} artifacts
   * @return {!AuditResult}
   */
  static audit(artifacts) {
    var smoothness = 0;
    var i;
    const traceContents =
      artifacts.traces[this.DEFAULT_PASS] &&
      artifacts.traces[this.DEFAULT_PASS].traceEvents;
    if (!traceContents || !Array.isArray(traceContents)) {
      throw new Error(FAILURE_MESSAGE);
    }

    const drawFrames = filterTrace(traceContents, "DrawFrame");
    // Process the trace
    const fpsData = calculateFps(drawFrames);
    var fpsAll = 0;
    for (i in fpsData) {
      fpsAll += fpsData[i].FPS;
    }
    smoothness = fpsAll / fpsData.length;
    smoothness = Math.floor(Math.min(smoothness, 60));

    return SmoothScrolling.generateAuditResult({
      rawValue: smoothness
    });
  }
}

module.exports = SmoothScrolling;
