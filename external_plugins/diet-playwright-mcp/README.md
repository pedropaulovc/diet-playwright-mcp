# Diet Playwright MCP Plugin

An optimized browser automation MCP server with viewport filtering support for Claude Code.

## Overview

Diet Playwright MCP is an enhanced version of the Playwright MCP server that reduces token usage by up to 60% through intelligent viewport-aware snapshots. It enables Claude to interact with web pages while being more efficient with context window usage.

## Key Features

- **Viewport Filtering**: New `browser_snapshot_viewport` tool that captures only visible elements, reducing token usage by ~60%
- **Scrollable Container Detection**: Intelligently detects and filters content clipped by overflow containers
- **Full Browser Automation**: Complete Playwright functionality including navigation, clicking, typing, form filling
- **Screenshot Support**: Take full page or element-specific screenshots
- **Network Monitoring**: Track network requests and responses
- **Console Access**: Capture browser console messages
- **Dialog Handling**: Programmatically handle alerts, confirms, and prompts

## Installation

```bash
/plugin install diet-playwright-mcp@claude-plugin-directory
```

Or manually configure in your Claude Code settings:

```json
{
  "mcpServers": {
    "diet-playwright-mcp": {
      "command": "npx",
      "args": ["@pedropaulovc/diet-playwright-mcp@next", "mcp"]
    }
  }
}
```

## Available Tools

### Viewport-Optimized Tools

- `browser_snapshot_viewport` - Capture only visible viewport content (60% smaller than full snapshot)

### Standard Browser Tools

- `browser_navigate` - Navigate to URLs
- `browser_snapshot` - Full accessibility snapshot of the page
- `browser_click` - Click elements
- `browser_type` - Type text into elements
- `browser_fill_form` - Fill multiple form fields at once
- `browser_take_screenshot` - Capture screenshots
- `browser_evaluate` - Run JavaScript in the browser
- `browser_press_key` - Press keyboard keys
- `browser_wait_for` - Wait for text to appear/disappear
- `browser_console_messages` - Get browser console output
- `browser_network_requests` - View network activity
- `browser_handle_dialog` - Handle browser dialogs
- `browser_tabs` - Manage browser tabs
- `browser_navigate_back` - Go back in history
- `browser_close` - Close the browser
- `browser_resize` - Change viewport size

## Token Optimization Comparison

When viewing a typical code file in an IDE (e.g., VSCode):

| Tool | Snapshot Lines | Off-screen Comments | Token Usage |
|------|----------------|---------------------|-------------|
| `browser_snapshot` | 652 | 9 | 100% |
| `browser_snapshot_viewport` | 258 | 3 | 40% |

**Result**: 60% reduction in snapshot size, 67% reduction in off-screen content.

## Usage Example

```typescript
// Standard full snapshot
const fullSnapshot = await client.call('browser_snapshot');
// Returns ~652 lines with all page content

// Optimized viewport snapshot
const viewportSnapshot = await client.call('browser_snapshot_viewport');
// Returns ~258 lines with only visible content (60% smaller)
```

## Configuration Options

The MCP server supports various configuration options via environment variables or config file:

```bash
# Viewport filtering
PLAYWRIGHT_MCP_VIEWPORT_FILTERING=true

# Browser options
PLAYWRIGHT_MCP_HEADLESS=false
PLAYWRIGHT_MCP_BROWSER=chromium

# Network options
PLAYWRIGHT_MCP_TIMEOUT=30000
```

See the [full documentation](https://github.com/pedropaulovc/diet-playwright-mcp) for all available options.

## Technical Details

### Viewport Filtering Implementation

The viewport filtering works by:

1. Computing `getBoundingClientRect()` for each element
2. Checking intersection with browser viewport dimensions
3. Detecting scrollable containers with `overflow: auto/scroll/hidden`
4. Applying 200px tolerance to keep nearby elements
5. Filtering ARIA tree nodes based on viewport visibility

This reduces the accessibility snapshot size while maintaining all interactive elements that are actually visible to the user.

## Requirements

- Node.js 18 or higher
- Chromium/Chrome browser (auto-installed on first use)

## Source Code

This plugin wraps the [@pedropaulovc/diet-playwright-mcp](https://www.npmjs.com/package/@pedropaulovc/diet-playwright-mcp) npm package.

Source code: https://github.com/pedropaulovc/diet-playwright-mcp

## Credits

Based on Microsoft's Playwright browser automation library and the original Playwright MCP server, with viewport optimization enhancements by Pedro Paulo Amorim.

## License

Apache-2.0

Original Playwright: Copyright (c) Microsoft Corporation
Viewport optimizations: Copyright (c) Pedro Paulo Amorim
