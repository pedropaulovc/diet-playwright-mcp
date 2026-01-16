const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class MCPClient {
  constructor() {
    this.server = null;
    this.messageId = 0;
    this.pendingRequests = new Map();
    this.buffer = '';
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.server = spawn('node', ['packages/playwright/cli.js', 'run-mcp-server'], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.server.stdout.on('data', (data) => {
        this.buffer += data.toString();
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop();

        lines.forEach(line => {
          if (!line.trim()) return;
          try {
            const msg = JSON.parse(line);
            if (msg.id && this.pendingRequests.has(msg.id)) {
              const { resolve, reject } = this.pendingRequests.get(msg.id);
              this.pendingRequests.delete(msg.id);
              if (msg.error) {
                reject(new Error(msg.error.message || JSON.stringify(msg.error)));
              } else {
                resolve(msg.result);
              }
            }
          } catch (e) {
            // Ignore
          }
        });
      });

      this.server.stderr.on('data', (data) => {
        const err = data.toString();
        if (!err.includes('DevTools') && !err.includes('listening')) {
          console.error('Server stderr:', err);
        }
      });

      setTimeout(() => resolve(), 3000);
    });
  }

  async call(toolName, args) {
    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      const request = {
        jsonrpc: '2.0',
        id,
        method: 'tools/call',
        params: { name: toolName, arguments: args }
      };

      this.pendingRequests.set(id, { resolve, reject });
      this.server.stdin.write(JSON.stringify(request) + '\n');

      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Timeout for ${toolName}`));
        }
      }, 60000);
    });
  }

  stop() {
    if (this.server) this.server.kill();
  }
}

function save(dir, filename, data) {
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  return fs.statSync(filepath).size;
}

async function scenario1() {
  console.log('\n=== SCENARIO 1: browser_navigate + browser_snapshot ===\n');

  const client = new MCPClient();
  const dir = path.join(__dirname, 'test-outputs', 'scenario-1');

  try {
    await client.start();
    console.log('✓ Server started\n');

    // 1. Navigate
    console.log('1. Navigate to codjiflo...');
    const r1 = await client.call('browser_navigate', {
      url: 'https://codjiflo.vza.net/pedropaulovc/codjiflo/219'
    });
    save(dir, '01-navigate.json', r1);
    console.log('   ✓\n');

    // 2. Wait for button
    console.log('2. Wait for "Use Personal Access Token"...');
    const r2 = await client.call('browser_wait_for', {
      text: 'Use Personal Access Token'
    });
    save(dir, '02-wait.json', r2);
    console.log('   ✓\n');

    // 3. Take snapshot before clicking
    console.log('3. Snapshot (to find button)...');
    const r3 = await client.call('browser_snapshot', {});
    const size3 = save(dir, '03-snapshot.json', r3);
    console.log(`   ✓ (${size3} bytes)\n`);

    // 4. Click button (we'd need to find ref from snapshot in real scenario)
    console.log('4. [Skipping click - requires ref from snapshot]\n');

    // 7-9. Second navigation sequence
    console.log('7. Navigate again...');
    const r7 = await client.call('browser_navigate', {
      url: 'https://codjiflo.vza.net/pedropaulovc/codjiflo/219'
    });
    save(dir, '07-navigate2.json', r7);
    console.log('   ✓\n');

    console.log('8. Wait for "package_lock.json"...');
    const r8 = await client.call('browser_wait_for', {
      text: 'package_lock.json',
      time: 5
    });
    save(dir, '08-wait2.json', r8);
    console.log('   ✓\n');

    console.log('9. Full snapshot...');
    const r9 = await client.call('browser_snapshot', {
      filename: 'full-snapshot.md'
    });
    const size9 = save(dir, '09-snapshot2.json', r9);
    console.log(`   ✓ (${size9} bytes)\n`);

    console.log('=== Scenario 1 Complete ===');
    console.log(`Snapshot 1: ${size3} bytes`);
    console.log(`Snapshot 2: ${size9} bytes`);
    console.log(`Total: ${size3 + size9} bytes\n`);

    return { calls: 5, totalSize: size3 + size9 };

  } catch (error) {
    console.error('✗ Failed:', error.message);
    throw error;
  } finally {
    client.stop();
  }
}

async function scenario2() {
  console.log('\n=== SCENARIO 2: browser_navigate_then_wait_for + browser_snapshot_viewport ===\n');

  const client = new MCPClient();
  const dir = path.join(__dirname, 'test-outputs', 'scenario-2');

  try {
    await client.start();
    console.log('✓ Server started\n');

    // 1-2. Combined navigate + wait
    console.log('1-2. Navigate + wait (combined)...');
    const r1 = await client.call('browser_navigate_then_wait_for', {
      url: 'https://codjiflo.vza.net/pedropaulovc/codjiflo/219',
      text: 'Use Personal Access Token'
    });
    save(dir, '01-navigate-wait.json', r1);
    console.log('   ✓\n');

    // 3. Viewport snapshot
    console.log('3. Viewport snapshot...');
    const r3 = await client.call('browser_snapshot_viewport', {});
    const size3 = save(dir, '03-viewport-snapshot.json', r3);
    console.log(`   ✓ (${size3} bytes)\n`);

    // 7-8. Second combined navigate + wait
    console.log('7-8. Navigate + wait (combined)...');
    const r7 = await client.call('browser_navigate_then_wait_for', {
      url: 'https://codjiflo.vza.net/pedropaulovc/codjiflo/219',
      text: 'package_lock.json',
      time: 5
    });
    save(dir, '07-navigate-wait2.json', r7);
    console.log('   ✓\n');

    console.log('9. Viewport snapshot...');
    const r9 = await client.call('browser_snapshot_viewport', {
      filename: 'viewport-snapshot.md'
    });
    const size9 = save(dir, '09-viewport-snapshot2.json', r9);
    console.log(`   ✓ (${size9} bytes)\n`);

    console.log('=== Scenario 2 Complete ===');
    console.log(`Snapshot 1: ${size3} bytes`);
    console.log(`Snapshot 2: ${size9} bytes`);
    console.log(`Total: ${size3 + size9} bytes\n`);

    return { calls: 4, totalSize: size3 + size9 };

  } catch (error) {
    console.error('✗ Failed:', error.message);
    throw error;
  } finally {
    client.stop();
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         MCP Tools Real-World Test                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  let s1, s2;

  try {
    s1 = await scenario1();
    await new Promise(r => setTimeout(r, 2000));
    s2 = await scenario2();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    RESULTS                                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const callReduction = ((s1.calls - s2.calls) / s1.calls * 100).toFixed(1);
    const sizeReduction = ((s1.totalSize - s2.totalSize) / s1.totalSize * 100).toFixed(1);

    console.log('Metric              | Scenario 1 | Scenario 2 | Improvement');
    console.log('--------------------|------------|------------|-------------');
    console.log(`MCP Calls           | ${s1.calls}          | ${s2.calls}          | ${callReduction}%`);
    console.log(`Total Snapshot Size | ${s1.totalSize.toLocaleString().padEnd(10)} | ${s2.totalSize.toLocaleString().padEnd(10)} | ${sizeReduction}%`);

    console.log('\n✅ Tests completed!');

  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  }
}

main();
