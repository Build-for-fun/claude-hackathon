# 🧠 Graph Memory MCP Server

A **Model Context Protocol (MCP) server** that gives Claude Desktop long-term memory and knowledge graph reasoning capabilities. It analyzes conversations, extracts entities and relationships, builds a knowledge graph, and uses this structured knowledge to provide intelligent, context-aware answers.

---

## 🎯 What Is This?

This MCP server acts as an **intelligent memory layer** for AI assistants. Instead of each conversation starting from scratch, this server:

1. **Remembers** key information from conversations
2. **Builds connections** between people, topics, preferences, and facts
3. **Reasons over relationships** using graph algorithms
4. **Enhances answers** by providing structured context to Claude

**Think of it as giving Claude a persistent brain that grows smarter over time.**

---

## ✨ Key Features

### 📝 Memory Management
- **Persistent Storage**: Key-value memory that persists across sessions (saved to `memory.json`)
- **Categorization**: Organize memories by category (preferences, facts, etc.)
- **Confidence Scoring**: Track the reliability of stored information

### 🔗 Knowledge Graph
- **Entity Extraction**: Automatically identifies people, topics, preferences, facts, and events from conversations
- **Relationship Mapping**: Discovers connections between entities (who likes what, who knows whom, etc.)
- **Graph Analysis**: Finds clusters, paths, most connected entities, and strongest relationships

### 🤖 LLM Integration
- **Context-Aware Queries**: When you ask a question, the graph is analyzed and relevant insights are passed to Claude
- **Intelligent Answers**: Claude generates comprehensive answers using both your question AND the knowledge graph context

### 📄 PDF Parsing
- **Transcript Analysis**: Parse PDF transcripts and extract conversations for analysis
- **Flexible Input**: Works with various transcript formats

---

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- (Optional) Anthropic API key for LLM-enhanced features

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/claude-hackathon.git
cd claude-hackathon

# Install dependencies
npm install

# Build the project
npm run build

# (Optional) Set up Anthropic API key for enhanced LLM features
export ANTHROPIC_API_KEY=your_api_key_here
```

---

## 🚀 Usage

### Running Locally (Testing)

```bash
# Test the graph reasoning system
npm run test:analysis

# Test the memory manager
npm run test

# Development mode with auto-reload
npm run dev
```

### Integrating with Claude Desktop

Add this server to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "graph-memory": {
      "command": "node",
      "args": ["/absolute/path/to/claude-hackathon/build/index.js"],
      "env": {
        "ANTHROPIC_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Then restart Claude Desktop.

---

## 🔧 Available MCP Tools

### Memory Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `store_memory` | Save a memory with key, value, category, and confidence | `key` (string), `value` (any), `category` (string), `confidence` (0.0-1.0) |
| `retrieve_memory` | Search memories by query | `query` (string) |
| `forget_memory` | Delete a specific memory | `key` (string) |

### Graph Reasoning Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `generate_sample_data` | Generate sample conversations for testing | `count` (1-5, default: 3) |
| `analyze_conversation` | Extract entities and relationships, build knowledge graph | `conversationId` (string) |
| `query_insights` | Ask questions with graph-enhanced LLM answers | `question` (string), `useGraph` (boolean) |
| `get_graph` | Export the knowledge graph | `format` ("full" or "summary") |

---

## 📖 Example Workflow

Here's how to use the graph reasoning system in Claude Desktop:

### Step 1: Generate Sample Data
```
"Generate 3 sample conversations"
```

### Step 2: Analyze Conversations
```
"Analyze conv_1, conv_2, and conv_3"
```

### Step 3: Query the Knowledge Graph
```
"What are Sarah's main interests?"
"Who does Sarah work with?"
"What technologies does Sarah like vs dislike?"
```

The system will:
1. Analyze the knowledge graph for relevant entities
2. Extract insights about connections and preferences
3. Provide these insights as context to Claude
4. Generate a comprehensive answer

---

## 🔄 How It Works

```
┌──────────────────────┐
│   User Conversation  │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│   Entity Extraction  │  ◀── People, Topics, Preferences, Facts, Events
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Relationship Mapping │  ◀── likes, dislikes, knows, mentions, related_to
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│   Knowledge Graph    │  ◀── Nodes (entities) + Edges (relationships)
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│   Graph Analysis     │  ◀── Clusters, Paths, Centrality, Weights
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│   LLM Enhancement    │  ◀── Graph insights provide context for Claude
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Intelligent Response │
└──────────────────────┘
```

---

## 🌐 Real-World Applications

This MCP server can be adapted for numerous powerful applications:

### 1. **Personal AI Assistant with Memory**
- Remember user preferences, past discussions, and context
- Provide personalized recommendations based on historical interactions
- Never ask the same questions twice

### 2. **Customer Support Intelligence**
- Build knowledge graphs from support tickets and customer conversations
- Identify common issues and their solutions
- Provide agents with relevant context from past interactions

### 3. **Research & Knowledge Management**
- Analyze research papers, notes, or transcripts
- Build concept maps showing how ideas connect
- Answer questions using accumulated knowledge

### 4. **Team Collaboration Analysis**
- Analyze Slack/Teams conversations
- Map who knows what and who works with whom
- Identify knowledge silos and experts in specific domains

### 5. **Meeting Intelligence**
- Parse meeting transcripts (including PDFs)
- Extract action items, decisions, and key topics
- Build a searchable knowledge base of organizational decisions

### 6. **User Research & Interviews**
- Analyze user interview transcripts
- Extract themes, pain points, and feature requests
- Visualize relationships between user needs and product features

### 7. **Content Recommendation Engine**
- Track user interests and preferences over time
- Build preference graphs for personalized recommendations
- Understand why users like certain content based on connected concepts

### 8. **Code Repository Understanding**
- Analyze discussions in PRs, issues, and documentation
- Map relationships between contributors, features, and components
- Answer questions about project history and decisions

---

## 🏗️ Architecture

```
claude-hackathon/
├── src/
│   ├── index.ts          # MCP server with all tool implementations
│   ├── analyzer.ts       # Entity extraction & relationship mapping
│   ├── graph.ts          # Knowledge graph data structure & algorithms
│   ├── llm.ts            # Anthropic Claude API client
│   ├── memory.ts         # Persistent key-value memory storage
│   ├── pdf-parser.ts     # PDF transcript parsing
│   ├── sample-data.ts    # Sample conversation generator
│   └── types.ts          # TypeScript type definitions
├── build/                # Compiled JavaScript (generated)
├── USAGE_GUIDE.md        # Quick start guide
├── TERMINAL_USAGE.md     # Terminal integration docs
└── README.md             # This file
```

### Key Components

| File | Purpose |
|------|---------|
| `index.ts` | Main MCP server that exposes all tools and handles requests |
| `analyzer.ts` | Pattern matching to extract entities (people, topics, preferences) and relationships |
| `graph.ts` | Graph data structure with algorithms for clustering, path finding, centrality analysis |
| `llm.ts` | Anthropic SDK integration for enhanced query answering |
| `memory.ts` | Simple persistent memory storage with file-based persistence |
| `pdf-parser.ts` | Parses PDF transcripts into conversation format for analysis |
| `types.ts` | TypeScript interfaces for Memory, Node, Edge, Conversation, etc. |

---

## 🧪 Testing

```bash
# Run all graph reasoning tests
npm run test:analysis

# Run memory manager tests  
npm run test

# Build the project
npm run build
```

---

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Anthropic API key for LLM features | Optional (enhances query_insights) |

Without an API key, the `query_insights` tool will return graph insights but cannot generate LLM-powered answers.

---

## 📄 License

ISC

---

## 🤝 Contributing

Contributions are welcome! Areas for improvement:

- **Enhanced NLP**: Replace pattern matching with proper NER/NLP models
- **Graph Persistence**: Save and load the knowledge graph across sessions
- **Visualization**: Add graph visualization tools
- **More Data Sources**: Support for more transcript and document formats
- **Advanced Algorithms**: PageRank, community detection, temporal analysis

---

## 📚 Learn More

- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) - The protocol this server implements
- [Claude Desktop](https://claude.ai/download) - AI assistant that can use this server
- [Anthropic API](https://docs.anthropic.com/) - API documentation for LLM features
