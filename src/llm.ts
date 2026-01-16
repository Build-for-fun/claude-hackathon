import Anthropic from '@anthropic-ai/sdk';
import { LLMQuery, LLMResponse } from './types.js';

export class LLMClient {
  private client: Anthropic | null = null;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (this.apiKey) {
      this.client = new Anthropic({
        apiKey: this.apiKey,
      });
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async query(query: LLMQuery): Promise<LLMResponse> {
    if (!this.client) {
      return {
        answer: 'LLM is not available. Please set ANTHROPIC_API_KEY environment variable.',
        confidence: 0,
        sources: [],
      };
    }

    try {
      // Build the prompt with graph insights
      const prompt = this.buildPrompt(query);
      
      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const answer = message.content[0].type === 'text' ? message.content[0].text : '';
      
      return {
        answer,
        confidence: 0.9,
        sources: query.graphInsights || [],
      };
    } catch (error: any) {
      console.error('LLM query error:', error);
      return {
        answer: `Error querying LLM: ${error.message}`,
        confidence: 0,
        sources: [],
      };
    }
  }

  private buildPrompt(query: LLMQuery): string {
    let prompt = '';
    
    if (query.graphInsights && query.graphInsights.length > 0) {
      prompt += 'Based on the following knowledge graph insights:\n\n';
      prompt += query.graphInsights.map((insight, i) => `${i + 1}. ${insight}`).join('\n');
      prompt += '\n\n';
    }
    
    if (query.context) {
      prompt += `Context: ${query.context}\n\n`;
    }
    
    prompt += `Question: ${query.question}\n\n`;
    prompt += 'Please provide a comprehensive answer based on the information provided above. ';
    prompt += 'If the graph insights contain relevant information, incorporate them into your answer. ';
    prompt += 'Be specific and cite the insights when applicable.';
    
    return prompt;
  }

  async analyzeWithContext(
    question: string,
    graphInsights: string[],
    additionalContext?: string
  ): Promise<LLMResponse> {
    return this.query({
      question,
      graphInsights,
      context: additionalContext,
    });
  }

  async summarizeGraph(
    nodes: Array<{ id: string; type: string; label: string }>,
    edges: Array<{ source: string; target: string; type: string; weight: number }>
  ): Promise<string> {
    if (!this.client) {
      return 'LLM is not available for graph summarization.';
    }

    const prompt = `Analyze this knowledge graph and provide a comprehensive summary:

Nodes (${nodes.length}):
${nodes.slice(0, 20).map(n => `- ${n.label} (${n.type})`).join('\n')}
${nodes.length > 20 ? `... and ${nodes.length - 20} more` : ''}

Edges (${edges.length}):
${edges.slice(0, 20).map(e => `- ${e.source} --[${e.type}]--> ${e.target} (weight: ${e.weight})`).join('\n')}
${edges.length > 20 ? `... and ${edges.length - 20} more` : ''}

Please provide:
1. A summary of the main entities and their relationships
2. Key patterns or clusters you observe
3. Notable insights about the knowledge structure`;

    try {
      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      return message.content[0].type === 'text' ? message.content[0].text : '';
    } catch (error: any) {
      console.error('Graph summarization error:', error);
      return `Error summarizing graph: ${error.message}`;
    }
  }
}
