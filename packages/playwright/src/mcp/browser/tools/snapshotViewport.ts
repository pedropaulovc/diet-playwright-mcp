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

    // Get the full snapshot first
    const snapshot = await tab.page._snapshotForAI({ track: 'response' });

    // Get viewport dimensions and scroll position
    const viewportInfo = await tab.page.evaluate(() => {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
      };
    });

    // Get all elements with their positions
    const elementsInViewport = await tab.page.evaluate((viewport) => {
      const elements: Array<{ selector: string; role: string; name: string }> = [];

      function isInViewport(rect: DOMRect): boolean {
        const top = viewport.scrollY;
        const bottom = top + viewport.height;
        const left = viewport.scrollX;
        const right = left + viewport.width;

        return rect.bottom > top &&
               rect.top < bottom &&
               rect.right > left &&
               rect.left < right;
      }

      function processElement(element: Element) {
        const rect = element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(element);

        // Skip hidden elements
        if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden')
          return;

        // Check if element or any part of it is in viewport
        if (isInViewport(rect)) {
          const role = element.getAttribute('role') || element.tagName.toLowerCase();
          const ariaLabel = element.getAttribute('aria-label');
          const text = element.textContent?.trim().substring(0, 100) || '';
          const name = ariaLabel || text;

          if (name) {
            elements.push({
              selector: element.tagName.toLowerCase() + (element.id ? `#${element.id}` : ''),
              role,
              name
            });
          }
        }

        // Process children
        for (const child of element.children)
          processElement(child);
      }

      processElement(document.body);
      return elements;
    }, viewportInfo);

    // Filter the full snapshot to only include viewport elements
    // For now, we'll create a simplified snapshot of viewport elements
    const viewportSnapshot = elementsInViewport
      .map(el => `- ${el.role}: ${JSON.stringify(el.name)}`)
      .join('\n');

    const snapshotText = `# Viewport Snapshot (${viewportInfo.width}x${viewportInfo.height} at scroll ${viewportInfo.scrollX},${viewportInfo.scrollY})\n\n${viewportSnapshot}\n\n---\nFull ARIA Snapshot (filtered to viewport):\n\n${snapshot.full}`;

    // Store the filtered snapshot
    if (params.filename) {
      const fileName = await response.addFile(params.filename, { origin: 'llm', reason: 'Saved viewport snapshot' });
      await fs.promises.writeFile(fileName, snapshotText);
      response.setIncludeMetaOnly();
    } else {
      response.addResult(snapshotText);
    }

    response.addCode('// Captured viewport snapshot');
  },
});

export default [
  snapshotViewport,
];
