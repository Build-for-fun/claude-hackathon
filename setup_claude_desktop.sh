#!/bin/bash

# Script to update Claude Desktop configuration for the Graph Reasoning MCP Server

CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
PROJECT_PATH="/Users/keshavdalmia/Desktop/claude-hackathon"

echo "🔧 Updating Claude Desktop Configuration..."
echo ""

# Backup existing config
if [ -f "$CONFIG_FILE" ]; then
    cp "$CONFIG_FILE" "$CONFIG_FILE.backup"
    echo "✓ Backed up existing config to: $CONFIG_FILE.backup"
fi

# Create the new configuration
cat > "$CONFIG_FILE" << 'EOF'
{
  "mcpServers": {
    "user-memory-graph": {
      "command": "node",
      "args": ["/Users/keshavdalmia/Desktop/claude-hackathon/build/index.js"]
    }
  }
}
EOF

echo "✓ Updated Claude Desktop configuration"
echo ""
echo "📝 Configuration Details:"
echo "   Server Name: user-memory-graph"
echo "   Command: node"
echo "   Script: $PROJECT_PATH/build/index.js"
echo ""
echo "🔑 Optional: Add API Key for LLM Features"
echo "   If you want to enable LLM-powered query_insights, edit:"
echo "   $CONFIG_FILE"
echo ""
echo "   Add this under the server configuration:"
echo '   "env": {'
echo '     "ANTHROPIC_API_KEY": "your_actual_api_key_here"'
echo '   }'
echo ""
echo "🔄 Next Steps:"
echo "   1. Restart Claude Desktop app"
echo "   2. The server will appear with these tools:"
echo "      • generate_sample_data"
echo "      • analyze_conversation"
echo "      • query_insights"
echo "      • get_graph"
echo "      • store_memory"
echo "      • retrieve_memory"
echo "      • forget_memory"
echo ""
echo "✅ Setup complete!"
