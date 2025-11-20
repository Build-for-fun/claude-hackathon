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
import { SampleDataGenerator } from "./sample-data.js";
import { GraphManager } from "./graph.js";
import { ConversationAnalyzer } from "./analyzer.js";
import { LLMClient } from "./llm.js";

const memoryManager = new MemoryManager();
const sampleDataGenerator = new SampleDataGenerator();
const graphManager = new GraphManager();
const analyzer = new ConversationAnalyzer(graphManager);
const llmClient = new LLMClient();

const server = new Server(
  {
    name: "user-memory-mcp",
    version: "0.2.0",
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

const GenerateSampleDataSchema = z.object({
  count: z.number().optional().describe("Number of sample conversations to generate (default: 3)"),
});

const AnalyzeConversationSchema = z.object({
  conversationId: z.string().describe("ID of the conversation to analyze (from generated samples)"),
});

const QueryInsightsSchema = z.object({
  question: z.string().describe("Question to ask about the analyzed data"),
  useGraph: z.boolean().optional().describe("Whether to include graph insights (default: true)"),
});

const GetGraphSchema = z.object({
  format: z.enum(['full', 'summary']).optional().describe("Format of graph data (default: 'summary')"),
});

// Store generated conversations
const conversationStore = new Map();

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
            value: { type: "string", description: "The value to store" },
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
      {
        name: "generate_sample_data",
        description: "Generate sample chat conversations for analysis and testing.",
        inputSchema: {
          type: "object",
          properties: {
            count: { type: "number", description: "Number of conversations to generate (1-5, default: 3)" },
          },
        },
      },
      {
        name: "analyze_conversation",
        description: "Analyze a conversation to extract entities, relationships, and build a knowledge graph.",
        inputSchema: {
          type: "object",
          properties: {
            conversationId: { type: "string", description: "ID of the conversation to analyze" },
          },
          required: ["conversationId"],
        },
      },
      {
        name: "query_insights",
        description: "Query the knowledge graph with LLM assistance to answer questions about analyzed conversations.",
        inputSchema: {
          type: "object",
          properties: {
            question: { type: "string", description: "Question to ask" },
            useGraph: { type: "boolean", description: "Include graph insights (default: true)" },
          },
          required: ["question"],
        },
      },
      {
        name: "get_graph",
        description: "Export the current knowledge graph structure.",
        inputSchema: {
          type: "object",
          properties: {
            format: { type: "string", enum: ["full", "summary"], description: "Format (default: 'summary')" },
          },
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
    
    case "generate_sample_data": {
      const { count = 3 } = GenerateSampleDataSchema.parse(request.params.arguments || {});
      const conversations = sampleDataGenerator.generateSampleConversations(Math.min(count, 5));
      
      // Store conversations
      conversationStore.clear();
      for (const conv of conversations) {
        conversationStore.set(conv.id, conv);
      }
      
      const summary = conversations.map(c => ({
        id: c.id,
        topic: c.metadata.topic,
        messageCount: c.messages.length,
        participants: c.metadata.participants,
      }));
      
      return {
        content: [
          {
            type: "text",
            text: `Generated ${conversations.length} sample conversations:\n\n${JSON.stringify(summary, null, 2)}\n\nUse 'analyze_conversation' with these IDs to build the knowledge graph.`,
          },
        ],
      };
    }
    
    case "analyze_conversation": {
      const { conversationId } = AnalyzeConversationSchema.parse(request.params.arguments);
      const conversation = conversationStore.get(conversationId);
      
      if (!conversation) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Conversation '${conversationId}' not found. Generate sample data first.`
        );
      }
      
      const result = analyzer.analyzeConversation(conversation);
      
      return {
        content: [
          {
            type: "text",
            text: `Analysis complete for conversation '${conversationId}':\n\n` +
                  `Entities: ${result.entities.length}\n` +
                  `Relationships: ${result.relationships.length}\n\n` +
                  `Insights:\n${result.insights.map(i => `- ${i}`).join('\n')}\n\n` +
                  `Graph updated with ${result.graph.nodes.length} nodes and ${result.graph.edges.length} edges.`,
          },
        ],
      };
    }
    
    case "query_insights": {
      const { question, useGraph = true } = QueryInsightsSchema.parse(request.params.arguments);
      
      let graphInsights: string[] = [];
      
      if (useGraph) {
        const graph = graphManager.exportGraph();
        
        // Generate insights from graph
        graphInsights.push(`Knowledge graph contains ${graph.nodes.length} nodes and ${graph.edges.length} edges.`);
        
        // Get most connected nodes
        const topNodes = graphManager.getMostConnectedNodes(5);
        if (topNodes.length > 0) {
          graphInsights.push(
            `Most connected entities: ${topNodes.map(n => `${n.node.label} (${n.degree} connections)`).join(', ')}`
          );
        }
        
        // Get strongest connections
        const strongEdges = graphManager.getStrongestConnections(5);
        if (strongEdges.length > 0) {
          graphInsights.push(
            `Strongest relationships: ${strongEdges.map(e => {
              const source = graphManager.getNode(e.source);
              const target = graphManager.getNode(e.target);
              return `${source?.label} --[${e.type}]--> ${target?.label}`;
            }).join(', ')}`
          );
        }
        
        // Get entity type distribution
        const nodesByType = {
          person: graphManager.getNodesByType('person').length,
          topic: graphManager.getNodesByType('topic').length,
          preference: graphManager.getNodesByType('preference').length,
          fact: graphManager.getNodesByType('fact').length,
          event: graphManager.getNodesByType('event').length,
        };
        
        graphInsights.push(
          `Entity distribution: ${Object.entries(nodesByType)
            .filter(([_, count]) => count > 0)
            .map(([type, count]) => `${count} ${type}(s)`)
            .join(', ')}`
        );
      }
      
      // Query LLM
      const response = await llmClient.query({
        question,
        graphInsights: graphInsights.length > 0 ? graphInsights : undefined,
      });
      
      return {
        content: [
          {
            type: "text",
            text: `Question: ${question}\n\n` +
                  (graphInsights.length > 0 ? `Graph Insights:\n${graphInsights.map(i => `- ${i}`).join('\n')}\n\n` : '') +
                  `Answer:\n${response.answer}\n\n` +
                  `Confidence: ${response.confidence}`,
          },
        ],
      };
    }
    
    case "get_graph": {
      const { format = 'summary' } = GetGraphSchema.parse(request.params.arguments || {});
      const graph = graphManager.exportGraph();
      
      if (format === 'full') {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(graph, null, 2),
            },
          ],
        };
      } else {
        // Summary format
        const summary = {
          metadata: graph.metadata,
          nodeTypes: {
            person: graph.nodes.filter(n => n.type === 'person').map(n => n.label),
            topic: graph.nodes.filter(n => n.type === 'topic').map(n => n.label),
            preference: graph.nodes.filter(n => n.type === 'preference').map(n => n.label),
            fact: graph.nodes.filter(n => n.type === 'fact').map(n => n.label),
            event: graph.nodes.filter(n => n.type === 'event').map(n => n.label),
          },
          topConnections: graphManager.getMostConnectedNodes(10).map(n => ({
            label: n.node.label,
            type: n.node.type,
            connections: n.degree,
          })),
          strongestRelationships: graphManager.getStrongestConnections(10).map(e => {
            const source = graphManager.getNode(e.source);
            const target = graphManager.getNode(e.target);
            return {
              from: source?.label,
              to: target?.label,
              type: e.type,
              weight: e.weight,
            };
          }),
        };
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(summary, null, 2),
            },
          ],
        };
      }
    }
    
    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
  }
});

async function main() {
  await memoryManager.load();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("User Memory MCP Server with Graph Reasoning running on stdio");
  console.error(`LLM Available: ${llmClient.isAvailable()}`);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
