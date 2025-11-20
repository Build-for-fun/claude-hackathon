#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { MemoryManager } from "./memory.js";

const memoryManager = new MemoryManager();

const server = new Server(
  {
    name: "user-memory-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const StoreMemorySchema = z.object({
  key: z.string().describe("The unique key for the memory"),
  value: z.any().describe("The value to store (can be any JSON serializable data)"),
  category: z.string().optional().describe("Category of the memory (e.g., 'preference', 'fact')"),
  confidence: z.number().optional().describe("Confidence score (0.0 to 1.0)"),
});

const RetrieveMemorySchema = z.object({
  query: z.string().describe("Search query to find relevant memories"),
});

const ForgetMemorySchema = z.object({
  key: z.string().describe("The key of the memory to delete"),
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "store_memory",
        description: "Store a new memory or update an existing one.",
        inputSchema: {
          type: "object",
          properties: {
            key: { type: "string", description: "The unique key for the memory" },
            value: { type: "string", description: "The value to store" }, // Simplified to string for now, but logic handles any
            category: { type: "string", description: "Category of the memory" },
            confidence: { type: "number", description: "Confidence score (0.0 to 1.0)" },
          },
          required: ["key", "value"],
        },
      },
      {
        name: "retrieve_memory",
        description: "Retrieve memories based on a search query.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
          },
          required: ["query"],
        },
      },
      {
        name: "forget_memory",
        description: "Delete a memory by its key.",
        inputSchema: {
          type: "object",
          properties: {
            key: { type: "string", description: "The key of the memory to delete" },
          },
          required: ["key"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "store_memory": {
      const { key, value, category, confidence } = StoreMemorySchema.parse(request.params.arguments);
      const memory = await memoryManager.add(key, value, category, confidence);
      return {
        content: [
          {
            type: "text",
            text: `Memory stored: ${JSON.stringify(memory, null, 2)}`,
          },
        ],
      };
    }
    case "retrieve_memory": {
      const { query } = RetrieveMemorySchema.parse(request.params.arguments);
      const memories = await memoryManager.search(query);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(memories, null, 2),
          },
        ],
      };
    }
    case "forget_memory": {
      const { key } = ForgetMemorySchema.parse(request.params.arguments);
      const deleted = await memoryManager.delete(key);
      return {
        content: [
          {
            type: "text",
            text: deleted ? `Memory '${key}' deleted.` : `Memory '${key}' not found.`,
          },
        ],
      };
    }
    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
  }
});

async function main() {
  await memoryManager.load();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("User Memory MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
