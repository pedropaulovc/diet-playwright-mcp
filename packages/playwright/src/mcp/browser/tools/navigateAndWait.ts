/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { z } from 'playwright-core/lib/mcpBundle';
import { defineTool } from './tool';

const navigateThenWaitFor = defineTool({
  capability: 'core',

  schema: {
    name: 'browser_navigate_then_wait_for',
    title: 'Navigate to URL and wait',
    description: 'Navigate to a URL and then wait for text to appear or disappear or a specified time to pass',
    inputSchema: z.object({
      url: z.string().describe('The URL to navigate to'),
      time: z.number().optional().describe('The time to wait in seconds after navigation'),
      text: z.string().optional().describe('The text to wait for after navigation'),
      textGone: z.string().optional().describe('The text to wait for to disappear after navigation'),
    }),
    type: 'action',
  },

  handle: async (context, params, response) => {
    if (!params.text && !params.textGone && !params.time)
      throw new Error('Either time, text or textGone must be provided');

    // Navigate to URL
    const tab = await context.ensureTab();
    await tab.navigate(params.url);
    response.addCode(`await page.goto('${params.url}');`);

    // Wait for condition
    if (params.time) {
      response.addCode(`await new Promise(f => setTimeout(f, ${params.time!} * 1000));`);
      await new Promise(f => setTimeout(f, Math.min(30000, params.time! * 1000)));
    }

    const locator = params.text ? tab.page.getByText(params.text).first() : undefined;
    const goneLocator = params.textGone ? tab.page.getByText(params.textGone).first() : undefined;

    if (goneLocator) {
      response.addCode(`await page.getByText(${JSON.stringify(params.textGone)}).first().waitFor({ state: 'hidden' });`);
      await goneLocator.waitFor({ state: 'hidden' });
    }

    if (locator) {
      response.addCode(`await page.getByText(${JSON.stringify(params.text)}).first().waitFor({ state: 'visible' });`);
      await locator.waitFor({ state: 'visible' });
    }

    response.addResult(`Navigated to ${params.url} and waited for ${params.text || params.textGone || params.time}`);
    response.setIncludeSnapshot();
  },
});

export default [
  navigateThenWaitFor,
];
