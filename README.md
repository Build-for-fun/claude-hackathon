# User Memory MCP Server

A Model Context Protocol (MCP) server that acts as a long-term memory module. It allows storing, retrieving, and managing user memories (key-value pairs with metadata) in a local JSON file.

## Features
- **Store Memory**: Save arbitrary data with a key, category, and confidence score.
- **Retrieve Memory**: Search memories by query.
- **Forget Memory**: Delete specific memories.
- **Persistence**: Data is saved to `memory.json` in the working directory.

## Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

## Usage

### Running Locally (Testing)
You can run the server directly to see it start, but it communicates via JSON-RPC over stdio, so it expects machine-readable input.
```bash
node build/index.js
```

### Using with Claude Desktop
To use this memory module with Claude, add it to your `claude_desktop_config.json` (usually located at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS).

```json
{
  "mcpServers": {
    "user-memory": {
      "command": "node",
      "args": ["/absolute/path/to/your/repo/build/index.js"]
    }
  }
}
```
Replace `/absolute/path/to/your/repo` with the actual path to this repository.

### Tools
- **`store_memory`**:
  - `key` (string): Unique identifier.
  - `value` (any): The data to store.
  - `category` (string): e.g., "preference", "fact".
  - `confidence` (number): 0.0 to 1.0.
- **`retrieve_memory`**:
  - `query` (string): Search term.
- **`forget_memory`**:
  - `key` (string): Key to delete.
