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

import fs from 'fs';

import { z } from 'playwright-core/lib/mcpBundle';

import { defineTool } from './tool';

const snapshotViewport = defineTool({
  capability: 'core',
  schema: {
    name: 'browser_snapshot_viewport',
    title: 'Viewport snapshot',
    description: 'Capture accessibility snapshot of only what is visible in the current viewport',
    inputSchema: z.object({
      filename: z.string().optional().describe('Save snapshot to markdown file instead of returning it in the response.'),
    }),
    type: 'readOnly',
  },

  handle: async (context, params, response) => {
    const tab = await context.ensureTab();

    // Get the ARIA snapshot
    const snapshot = await tab.page._snapshotForAI({ track: 'response' });

    // For viewport-only, use incremental which is more focused on current view
    // The full snapshot includes off-screen content
    const viewportSnapshot = snapshot.incremental || snapshot.full;

    if (params.filename) {
      const fileName = await response.addFile(params.filename, { origin: 'llm', reason: 'Saved viewport snapshot' });
      await fs.promises.writeFile(fileName, viewportSnapshot);
      response.setIncludeMetaOnly();
    } else {
      response.addResult(viewportSnapshot);
    }
  },
});

export default [
  snapshotViewport,
];
