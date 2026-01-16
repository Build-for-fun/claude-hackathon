#!/bin/bash

# Demo script for Graph Reasoning Analysis System
# This demonstrates the complete workflow

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Graph Reasoning Analysis System - Demo                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 This demo shows the complete workflow:"
echo "   1. Generate sample chat conversations"
echo "   2. Analyze conversations to build knowledge graph"
echo "   3. Extract entities and relationships"
echo "   4. Query the graph with insights"
echo ""

echo "🔧 Running comprehensive test suite..."
echo ""

npm run test:analysis

echo ""
echo "✅ Demo complete!"
echo ""
echo "📚 Next steps:"
echo "   • Set ANTHROPIC_API_KEY to enable LLM features"
echo "   • Run 'npm run build' to compile"
echo "   • Use MCP Inspector: npx @modelcontextprotocol/inspector node build/index.js"
echo "   • Integrate with Claude Desktop (see README.md)"
echo ""
echo "🛠️  Available MCP Tools:"
echo "   • generate_sample_data - Create sample conversations"
echo "   • analyze_conversation - Build knowledge graph from chat"
echo "   • query_insights - Ask questions with LLM assistance"
echo "   • get_graph - Export graph structure"
echo ""
