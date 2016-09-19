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

const DevToolsProtocol = require('../../lighthouse-core/gather/drivers/devtools.js');

const Runner = require('../../lighthouse-core/runner');
const Config = require('../../lighthouse-core/config/config');
const devtoolsConfig = require('../../lighthouse-core/config/devtools.json');

const LighthouseAPI = global.Lighthouse = {};

LighthouseAPI.runAudits = function(options) {
  const driver = new DevToolsProtocol();
  const url = options.url;

    // Always start with a freshly parsed default config.
  const runConfig = JSON.parse(JSON.stringify(devtoolsConfig));
  const config = new Config(runConfig);
  // Add url and config to fresh options object.
  const runOptions = Object.assign({}, options, {url, config});

  // Run Lighthouse.
  return Runner.run(driver, runOptions);
};

LighthouseAPI.config = devtoolsConfig;
