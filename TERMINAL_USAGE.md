# Using MCP Server in Terminal

There are several ways to interact with your MCP server directly from the terminal:

## Method 1: Using MCP Inspector (Visual Interface)

The MCP Inspector provides a web-based UI to test your server:

```bash
# Start the inspector
npx @modelcontextprotocol/inspector node build/index.js
```

This will open a browser interface where you can:
- See all available tools
- Test tool calls with a GUI
- View responses in real-time

## Method 2: Direct JSON-RPC via stdin (Manual Testing)

MCP servers communicate using JSON-RPC over stdin/stdout. You can send commands directly:

### Step 1: Build your server
```bash
npm run build
```

### Step 2: Send JSON-RPC commands

**List available tools:**
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node build/index.js
```

**Store a memory:**
```bash
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"store_memory","arguments":{"key":"user_name","value":"Keshav","category":"profile","confidence":1.0}}}' | node build/index.js
```

**Retrieve memories:**
```bash
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"retrieve_memory","arguments":{"query":"name"}}}' | node build/index.js
```

**Forget a memory:**
```bash
echo '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"forget_memory","arguments":{"key":"user_name"}}}' | node build/index.js
```

## Method 3: Using the Test Script

We've provided a test script that runs all the commands:

```bash
chmod +x test_mcp_terminal.sh
./test_mcp_terminal.sh
```

## Method 4: Interactive Node REPL

For more interactive testing, you can use the MemoryManager class directly:

```bash
node --loader tsx/esm
```

Then in the REPL:
```javascript
import { MemoryManager } from './src/memory.js';

const manager = new MemoryManager('test_memory.json');
await manager.load();

// Store memory
await manager.add('user_name', 'Keshav', 'profile', 1.0);

// Get memory
await manager.get('user_name');

// Search memories
await manager.search('name');

// Delete memory
await manager.delete('user_name');
```

## Method 5: Using TypeScript Test File

Run the existing test file:

```bash
npx tsx test_server.ts
```

This runs comprehensive tests of all memory operations.

## Understanding JSON-RPC Format

All MCP communication uses JSON-RPC 2.0:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "store_memory",
    "arguments": {
      "key": "user_name",
      "value": "Keshav",
      "category": "profile",
      "confidence": 1.0
    }
  }
}
```

## Viewing Stored Data

All memories are stored in `memory.json`:

```bash
cat memory.json | jq .
```

## Tips

1. **Use `jq` for pretty output**: Pipe results through `jq` for formatted JSON
   ```bash
   echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node build/index.js | jq .
   ```

2. **Check server logs**: The server logs to stderr, so you'll see status messages

3. **Multiple instances**: Each server instance uses the same `memory.json` file, so data persists across runs

4. **Development mode**: Use `npm run dev` to run with auto-reload during development
