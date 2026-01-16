# Graph Reasoning MCP Server - Ready to Use!

## ✅ What's Working

Your MCP server now has **graph reasoning capabilities** that:

1. **Takes in data** → Sample conversations about Sarah (a developer)
2. **Analyzes through graph reasoning** → Extracts entities (people, topics, preferences) and relationships
3. **Uses findings with LLM** → Provides context to Claude for answering queries

## 🎯 How It Works

### Workflow
```
User Query in Claude Desktop
    ↓
query_insights tool called
    ↓
Graph analyzed for relevant information
    ↓
Graph insights provided to LLM as context
    ↓
LLM generates answer using graph knowledge
```

### Example Usage in Claude Desktop

1. **Generate sample data**:
   ```
   Use the generate_sample_data tool to create 3 conversations
   ```

2. **Analyze conversations**:
   ```
   Analyze conv_1, conv_2, and conv_3 to build the knowledge graph
   ```

3. **Ask questions** (this is where it all comes together):
   ```
   What are Sarah's main interests?
   Who does Sarah work with?
   What technologies does Sarah like?
   What does Sarah dislike?
   ```

The `query_insights` tool will:
- Extract relevant info from the graph (Sarah likes TypeScript, React, works with John, etc.)
- Provide this context to the LLM
- Generate a comprehensive answer

## 🛠️ Available Tools

### Graph Reasoning Tools
- **`generate_sample_data`** - Creates sample conversations
- **`analyze_conversation`** - Builds knowledge graph from conversations
- **`query_insights`** - Answers questions using graph + LLM
- **`get_graph`** - Exports graph structure

### Memory Tools (original functionality)
- **`store_memory`** - Store key-value data
- **`retrieve_memory`** - Search memories
- **`forget_memory`** - Delete memories

## 📊 Sample Data

The system includes 3 pre-built conversations about Sarah:

1. **Programming Interests** - Sarah likes TypeScript, React, Next.js, Neo4j, Claude API
2. **Team & Relationships** - Sarah works with John (Python/Go expert) and Emma (UX designer)
3. **Work Preferences** - Sarah likes async communication (Slack/GitHub), dislikes legacy PHP and long meetings

## 🚀 Next Steps

### 1. Restart Claude Desktop
Close and reopen the Claude Desktop app to load the new server.

### 2. Verify Tools Are Available
In Claude Desktop, you should see the 7 tools listed above.

### 3. Try the Workflow
```
1. "Generate 3 sample conversations"
2. "Analyze all 3 conversations"
3. "What are Sarah's interests and who does she work with?"
```

### 4. (Optional) Add API Key for Enhanced LLM Features
Edit: `~/Library/Application Support/Claude/claude_desktop_config.json`

Add under the server config:
```json
"env": {
  "ANTHROPIC_API_KEY": "your_key_here"
}
```

## 📁 Project Structure

```
claude-hackathon/
├── src/
│   ├── index.ts          # MCP server with all tools
│   ├── sample-data.ts    # Sample conversation generator
│   ├── analyzer.ts       # Entity extraction & relationship mapping
│   ├── graph.ts          # Graph data structure & algorithms
│   ├── llm.ts            # Claude API client
│   ├── memory.ts         # Persistent memory storage
│   └── types.ts          # TypeScript type definitions
├── build/                # Compiled JavaScript
└── README.md             # Full documentation
```

## 🧪 Testing

```bash
# Test the graph reasoning system
npm run test:analysis

# Test memory manager
npm run test

# Build the project
npm run build
```

## 💡 How the Graph Reasoning Works

1. **Entity Extraction**: Pattern matching identifies:
   - People (John, Emma)
   - Topics (TypeScript, React, Python)
   - Preferences (likes/dislikes)
   - Facts & Events

2. **Relationship Mapping**: Connections are discovered:
   - Sarah → likes → TypeScript
   - Sarah → knows → John
   - John → related_to → Python

3. **Graph Analysis**: Algorithms find:
   - Most connected entities
   - Strongest relationships
   - Clusters of related concepts
   - Paths between entities

4. **LLM Integration**: When you ask a question:
   - Graph is analyzed for relevant info
   - Insights are formatted as context
   - LLM receives both your question AND graph insights
   - LLM generates answer using this rich context

## 🎉 You're All Set!

The system is ready to use in Claude Desktop. Just restart the app and start asking questions!
