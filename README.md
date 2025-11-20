# User Memory MCP Server with Graph Reasoning

A Model Context Protocol (MCP) server that combines long-term memory with graph-based reasoning capabilities. It analyzes chat conversations, extracts entities and relationships, builds knowledge graphs, and uses LLM assistance to answer queries.

## Features

### Memory Management
- **Store Memory**: Save arbitrary data with a key, category, and confidence score.
- **Retrieve Memory**: Search memories by query.
- **Forget Memory**: Delete specific memories.
- **Persistence**: Data is saved to `memory.json` in the working directory.

### Graph Reasoning Analysis
- **Sample Data Generation**: Create realistic chat conversations for testing and analysis.
- **Entity Extraction**: Automatically identify people, topics, preferences, facts, and events from conversations.
- **Relationship Mapping**: Discover connections between entities (mentions, likes, dislikes, knows, etc.).
- **Knowledge Graph**: Build and maintain a graph structure of entities and their relationships.
- **Pattern Detection**: Find clusters, paths, and the most connected entities.
- **LLM Integration**: Query the graph with Claude AI assistance for intelligent answers.

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
4. (Optional) Set up Anthropic API key for LLM features:
   ```bash
   export ANTHROPIC_API_KEY=your_api_key_here
   ```

## Usage

### Running Locally (Testing)
Test the graph reasoning system:
```bash
npm run test:analysis
```

Test the memory manager:
```bash
npm run test
```

### Development
To run the server from source with auto-reloading (using `tsx`):
```bash
npm run dev
```

### Using with Claude Desktop
To use this memory module with Claude, add it to your `claude_desktop_config.json` (usually located at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS).

```json
{
  "mcpServers": {
    "user-memory": {
      "command": "node",
      "args": ["/absolute/path/to/your/repo/build/index.js"],
      "env": {
        "ANTHROPIC_API_KEY": "your_api_key_here"
      }
    }
  }
}
```
Replace `/absolute/path/to/your/repo` with the actual path to this repository.

## MCP Tools

### Memory Tools
- **`store_memory`**:
  - `key` (string): Unique identifier.
  - `value` (any): The data to store.
  - `category` (string): e.g., "preference", "fact".
  - `confidence` (number): 0.0 to 1.0.
- **`retrieve_memory`**:
  - `query` (string): Search term.
- **`forget_memory`**:
  - `key` (string): Key to delete.

### Graph Reasoning Tools
- **`generate_sample_data`**:
  - `count` (number, optional): Number of conversations to generate (1-5, default: 3).
  - Returns: List of generated conversation IDs with metadata.
  
- **`analyze_conversation`**:
  - `conversationId` (string): ID of the conversation to analyze.
  - Returns: Extracted entities, relationships, insights, and graph updates.
  
- **`query_insights`**:
  - `question` (string): Question to ask about the analyzed data.
  - `useGraph` (boolean, optional): Include graph insights (default: true).
  - Returns: Answer from LLM with graph context, insights, and confidence score.
  
- **`get_graph`**:
  - `format` (string, optional): "full" or "summary" (default: "summary").
  - Returns: Current knowledge graph structure with nodes, edges, and statistics.

## Example Workflow

1. **Generate sample conversations**:
   ```
   Tool: generate_sample_data
   Input: { "count": 3 }
   ```

2. **Analyze each conversation**:
   ```
   Tool: analyze_conversation
   Input: { "conversationId": "conv_1" }
   ```

3. **Query the knowledge graph**:
   ```
   Tool: query_insights
   Input: { "question": "What are Sarah's main interests?" }
   ```

4. **Export the graph**:
   ```
   Tool: get_graph
   Input: { "format": "summary" }
   ```

## How It Works

1. **Data Input**: Chat conversations are provided (either generated samples or real data).
2. **Entity Extraction**: The analyzer uses pattern matching to identify entities (people, topics, preferences, facts, events).
3. **Relationship Mapping**: Connections between entities are discovered (who mentions what, who likes/dislikes what, etc.).
4. **Graph Building**: Entities become nodes, relationships become edges in a knowledge graph.
5. **Pattern Analysis**: Graph algorithms find clusters, paths, and important connections.
6. **LLM Enhancement**: When querying, graph insights are provided to Claude AI for comprehensive answers.

## Architecture

- **`types.ts`**: Type definitions for all data structures.
- **`sample-data.ts`**: Generates realistic sample conversations.
- **`graph.ts`**: Graph data structure and operations (nodes, edges, traversal, clustering).
- **`analyzer.ts`**: Entity extraction and relationship mapping from conversations.
- **`llm.ts`**: Anthropic Claude API client for intelligent query answering.
- **`memory.ts`**: Persistent key-value memory storage.
- **`index.ts`**: MCP server with all tool implementations.

## License
ISC

