export interface Memory {
  key: string;
  value: any;
  category: string;
  confidence: number;
  timestamp: string;
}

// Graph Types
export interface Node {
  id: string;
  type: 'person' | 'topic' | 'preference' | 'fact' | 'event';
  label: string;
  properties: Record<string, any>;
  timestamp: string;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type: 'mentions' | 'likes' | 'dislikes' | 'related_to' | 'discussed' | 'knows';
  weight: number;
  properties: Record<string, any>;
  timestamp: string;
}

export interface Graph {
  nodes: Map<string, Node>;
  edges: Map<string, Edge>;
  metadata: {
    created: string;
    updated: string;
    nodeCount: number;
    edgeCount: number;
  };
}

// Conversation Types
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  messages: Message[];
  metadata: {
    created: string;
    topic?: string;
    participants?: string[];
  };
}

// Analysis Types
export interface Entity {
  text: string;
  type: 'person' | 'topic' | 'preference' | 'fact' | 'event';
  confidence: number;
  context: string;
}

export interface Relationship {
  from: string;
  to: string;
  type: string;
  strength: number;
}

export interface AnalysisResult {
  entities: Entity[];
  relationships: Relationship[];
  insights: string[];
  graph: {
    nodes: Node[];
    edges: Edge[];
  };
}

// LLM Types
export interface LLMQuery {
  question: string;
  context?: string;
  graphInsights?: string[];
}

export interface LLMResponse {
  answer: string;
  confidence: number;
  sources: string[];
}
