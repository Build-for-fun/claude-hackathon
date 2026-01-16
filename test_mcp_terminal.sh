#!/bin/bash

# Test MCP Server in Terminal
# This script demonstrates how to interact with the MCP server using JSON-RPC

echo "=== Testing User Memory MCP Server ==="
echo ""

# Build the server first
echo "Building server..."
npm run build

echo ""
echo "=== Test 1: Store Memory ==="
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"store_memory","arguments":{"key":"user_name","value":"Keshav","category":"profile","confidence":1.0}}}' | node build/index.js

echo ""
echo "=== Test 2: Retrieve Memory ==="
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"retrieve_memory","arguments":{"query":"name"}}}' | node build/index.js

echo ""
echo "=== Test 3: Store Another Memory ==="
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"store_memory","arguments":{"key":"favorite_language","value":"TypeScript","category":"preference","confidence":0.9}}}' | node build/index.js

echo ""
echo "=== Test 4: Search All Memories ==="
echo '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"retrieve_memory","arguments":{"query":""}}}' | node build/index.js

echo ""
echo "=== Test 5: Forget Memory ==="
echo '{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"forget_memory","arguments":{"key":"user_name"}}}' | node build/index.js

echo ""
echo "=== Tests Complete ==="
