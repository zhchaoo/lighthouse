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
const Formatter = require('../formatters/formatter');

class MediaSized extends Audit {
  /**
   * @return {!AuditMeta}
   */
  static get meta() {
    return {
      category: 'Layout Stability',
      name: 'media-sized',
      description: 'Media elements have width and height attributes inline or in CSS',
      requiredArtifacts: ['MediaSized']
    };
  }

  /**
   * @param {!Artifacts} artifacts
   * @return {!AuditResult}
   */
  static audit(artifacts) {
    const violations = artifacts.MediaSized;

    if (violations === -1 || typeof violations === 'undefined') {
      return MediaSized.generateAuditResult({
        rawValue: false,
        debugString: 'Unable to retrieve media size information.'
      });
    }

    return MediaSized.generateAuditResult({
      rawValue: (violations.length === 0),
      extendedInfo: {
        formatter: Formatter.SUPPORTED_FORMATS.MEDIA_SIZED,
        value: violations
      }
    });
  }
}

module.exports = MediaSized;
