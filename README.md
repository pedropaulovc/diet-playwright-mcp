# Claude Code Plugin Marketplace

A curated collection of high-quality Claude Code plugins with enhanced browser automation capabilities.

## Overview

This marketplace provides optimized plugins for Claude Code, focusing on browser automation with improved efficiency and token usage optimization.

## Available Plugins

### Diet Playwright MCP

**Location**: `external_plugins/diet-playwright-mcp`

An optimized browser automation MCP server with viewport filtering support that reduces token usage by up to 60%.

**Key Features**:
- Viewport-aware snapshots (60% token reduction)
- Scrollable container detection
- Full Playwright browser automation
- Screenshot and network monitoring support

**Installation**:
```bash
/plugin install diet-playwright-mcp@claude-plugin-directory
```

**NPM Package**: [@pedropaulovc/diet-playwright-mcp](https://www.npmjs.com/package/@pedropaulovc/diet-playwright-mcp)

[View Plugin Details →](external_plugins/diet-playwright-mcp/README.md)

## Installation

### Using Claude Code

Install plugins directly from Claude Code using the plugin manager:

```bash
/plugin install <plugin-name>@claude-plugin-directory
```

### Manual Configuration

Add to your Claude Code configuration file:

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

## Plugin Structure

Each plugin follows the standard Claude Code plugin structure:

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json       # Plugin metadata (required)
├── .mcp.json             # MCP server configuration
├── commands/             # Slash commands (optional)
├── agents/               # Agent definitions (optional)
├── skills/               # Skill definitions (optional)
└── README.md             # Documentation
```

## Repository Structure

```
diet-playwright-mcp/
├── external_plugins/           # Third-party plugins
│   └── diet-playwright-mcp/   # Diet Playwright plugin
│       ├── .claude-plugin/
│       │   └── plugin.json
│       ├── .mcp.json
│       └── README.md
├── packages/                   # Source code
│   ├── playwright/            # Main package
│   └── playwright-core/       # Core package
└── README.md                   # This file
```

## Development

This marketplace is built on top of Microsoft's Playwright browser automation library with viewport optimization enhancements.

### Building from Source

```bash
# Install dependencies
npm install

# Build packages
npm run build

# Run tests
npm test
```

### Publishing Updates

```bash
# Publish to npm
cd packages/playwright-core
npm publish --tag next

cd ../playwright
npm publish --tag next
```

## Token Optimization

The Diet Playwright MCP plugin provides significant token savings through viewport filtering:

| Tool | Snapshot Size | Token Usage |
|------|--------------|-------------|
| Standard `browser_snapshot` | 652 lines | 100% |
| Optimized `browser_snapshot_viewport` | 258 lines | 40% |

**Result**: 60% reduction in token usage while maintaining all visible interactive elements.

## Technical Details

### Viewport Filtering Implementation

The viewport optimization works through:

1. **Element Position Calculation**: Using `getBoundingClientRect()` to determine element positions
2. **Viewport Intersection**: Checking if elements intersect with the browser viewport
3. **Scrollable Container Detection**: Identifying elements clipped by `overflow: auto/scroll/hidden`
4. **Tolerance Buffer**: 200px tolerance to keep nearby elements
5. **ARIA Tree Filtering**: Removing non-viewport nodes from the accessibility tree

This approach maintains full functionality while significantly reducing context window usage.

## Requirements

- Node.js 18 or higher
- Claude Code CLI
- Chromium/Chrome browser (auto-installed on first use)

## Contributing

Contributions are welcome! To submit a new plugin:

1. Fork this repository
2. Create your plugin in `external_plugins/<plugin-name>/`
3. Follow the standard plugin structure
4. Submit a pull request

## Credits

**Original Playwright**: Copyright (c) Microsoft Corporation
**Viewport Optimizations**: Pedro Paulo Amorim ([@pedropaulovc](https://github.com/pedropaulovc))

Based on:
- [Microsoft Playwright](https://playwright.dev) - Browser automation library
- [Claude Code](https://claude.ai/code) - AI-powered coding assistant
- [Model Context Protocol](https://modelcontextprotocol.io) - MCP specification

## License

Apache-2.0

See [LICENSE](LICENSE) for details.

## Resources

- [Claude Code Documentation](https://code.claude.com/docs)
- [Playwright Documentation](https://playwright.dev)
- [MCP Specification](https://modelcontextprotocol.io)
- [Plugin Development Guide](https://code.claude.com/docs/en/plugins-reference)

## Support

- **Issues**: [GitHub Issues](https://github.com/pedropaulovc/diet-playwright-mcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/pedropaulovc/diet-playwright-mcp/discussions)

---

**Note**: This is a community marketplace. Always review plugin code and trust the source before installation.
