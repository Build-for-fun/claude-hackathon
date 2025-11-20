import { Conversation, Entity, Relationship, AnalysisResult, Node, Edge } from './types.js';
import { GraphManager } from './graph.js';

export class ConversationAnalyzer {
  private graphManager: GraphManager;

  constructor(graphManager: GraphManager) {
    this.graphManager = graphManager;
  }

  analyzeConversation(conversation: Conversation): AnalysisResult {
    const entities = this.extractEntities(conversation);
    const relationships = this.extractRelationships(conversation, entities);
    const insights = this.generateInsights(entities, relationships);
    
    // Build graph from entities and relationships
    const nodes = this.entitiesToNodes(entities);
    const edges = this.relationshipsToEdges(relationships);
    
    // Add to graph manager
    for (const node of nodes) {
      this.graphManager.addNode(node);
    }
    
    for (const edge of edges) {
      this.graphManager.addEdge(edge);
    }
    
    return {
      entities,
      relationships,
      insights,
      graph: {
        nodes,
        edges,
      },
    };
  }

  private extractEntities(conversation: Conversation): Entity[] {
    const entities: Entity[] = [];
    const userMessages = conversation.messages.filter(m => m.role === 'user');
    
    for (const message of userMessages) {
      const content = message.content;
      
      // Extract people (simple pattern matching - in production, use NER)
      const peoplePatterns = [
        /(?:my colleague|my friend|I work with)\s+([A-Z][a-z]+)/g,
        /([A-Z][a-z]+)\s+(?:is|was|works|specializes)/g,
      ];
      
      for (const pattern of peoplePatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const name = match[1];
          if (name && name.length > 1) {
            entities.push({
              text: name,
              type: 'person',
              confidence: 0.9,
              context: content,
            });
          }
        }
      }
      
      // Extract preferences (likes)
      const likePatterns = [
        /I (?:love|like|enjoy|prefer)\s+([^.!?]+)/gi,
        /I'm (?:interested in|into)\s+([^.!?]+)/gi,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+is (?:my favorite|great|amazing)/gi,
      ];
      
      for (const pattern of likePatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const preference = match[1].trim();
          if (preference && preference.length > 2) {
            entities.push({
              text: preference,
              type: 'preference',
              confidence: 0.85,
              context: content,
            });
          }
        }
      }
      
      // Extract dislikes
      const dislikePatterns = [
        /I (?:don't like|dislike|hate)\s+([^.!?]+)/gi,
        /I (?:really )?don't (?:like|enjoy)\s+([^.!?]+)/gi,
      ];
      
      for (const pattern of dislikePatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const dislike = match[1].trim();
          if (dislike && dislike.length > 2) {
            entities.push({
              text: dislike,
              type: 'preference',
              confidence: 0.85,
              context: content,
            });
          }
        }
      }
      
      // Extract topics/technologies
      const techPatterns = [
        /\b(TypeScript|JavaScript|Python|Go|React|Next\.js|Neo4j|Claude|Figma|Slack|GitHub|PHP)\b/g,
      ];
      
      for (const pattern of techPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          entities.push({
            text: match[1],
            type: 'topic',
            confidence: 1.0,
            context: content,
          });
        }
      }
      
      // Extract facts
      const factPatterns = [
        /(?:was created|was first released|created by|developed by)\s+([^.!?]+)/gi,
        /\b(\d{4})\b/g, // Years
      ];
      
      for (const pattern of factPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const fact = match[1] || match[0];
          if (fact && fact.trim().length > 0) {
            entities.push({
              text: fact.trim(),
              type: 'fact',
              confidence: 0.8,
              context: content,
            });
          }
        }
      }
      
      // Extract events
      const eventPatterns = [
        /I (?:started|joined|got promoted|attended)\s+([^.!?]+)/gi,
        /in (?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/gi,
      ];
      
      for (const pattern of eventPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const event = match[0];
          if (event && event.length > 3) {
            entities.push({
              text: event,
              type: 'event',
              confidence: 0.85,
              context: content,
            });
          }
        }
      }
    }
    
    return this.deduplicateEntities(entities);
  }

  private extractRelationships(conversation: Conversation, entities: Entity[]): Relationship[] {
    const relationships: Relationship[] = [];
    const userMessages = conversation.messages.filter(m => m.role === 'user');
    
    // Get speaker (assume first person mentioned or from metadata)
    const speaker = conversation.metadata.participants?.[0] || 'User';
    
    for (const message of userMessages) {
      const content = message.content.toLowerCase();
      
      // Find entities mentioned in this message
      const mentionedEntities = entities.filter(e => 
        content.includes(e.text.toLowerCase())
      );
      
      for (const entity of mentionedEntities) {
        // Speaker mentions entity
        relationships.push({
          from: speaker,
          to: entity.text,
          type: 'mentions',
          strength: 0.7,
        });
        
        // Check for likes/preferences
        if (content.includes('love') || content.includes('like') || content.includes('enjoy')) {
          if (content.includes(entity.text.toLowerCase())) {
            relationships.push({
              from: speaker,
              to: entity.text,
              type: 'likes',
              strength: 0.9,
            });
          }
        }
        
        // Check for dislikes
        if (content.includes('don\'t like') || content.includes('dislike') || content.includes('hate')) {
          if (content.includes(entity.text.toLowerCase())) {
            relationships.push({
              from: speaker,
              to: entity.text,
              type: 'dislikes',
              strength: 0.9,
            });
          }
        }
        
        // Check for knowledge relationships
        if (content.includes('work with') || content.includes('colleague')) {
          if (entity.type === 'person') {
            relationships.push({
              from: speaker,
              to: entity.text,
              type: 'knows',
              strength: 0.95,
            });
          }
        }
      }
      
      // Find relationships between entities in the same message
      for (let i = 0; i < mentionedEntities.length; i++) {
        for (let j = i + 1; j < mentionedEntities.length; j++) {
          const entity1 = mentionedEntities[i];
          const entity2 = mentionedEntities[j];
          
          relationships.push({
            from: entity1.text,
            to: entity2.text,
            type: 'related_to',
            strength: 0.6,
          });
        }
      }
    }
    
    return this.deduplicateRelationships(relationships);
  }

  private generateInsights(entities: Entity[], relationships: Relationship[]): string[] {
    const insights: string[] = [];
    
    // Count entity types
    const entityCounts = entities.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    insights.push(`Extracted ${entities.length} entities: ${Object.entries(entityCounts).map(([type, count]) => `${count} ${type}(s)`).join(', ')}`);
    
    // Find most mentioned entities
    const entityMentions = new Map<string, number>();
    for (const rel of relationships) {
      entityMentions.set(rel.to, (entityMentions.get(rel.to) || 0) + 1);
    }
    
    const topEntities = Array.from(entityMentions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    if (topEntities.length > 0) {
      insights.push(`Most discussed: ${topEntities.map(([entity, count]) => `${entity} (${count} mentions)`).join(', ')}`);
    }
    
    // Find preferences
    const likes = relationships.filter(r => r.type === 'likes');
    const dislikes = relationships.filter(r => r.type === 'dislikes');
    
    if (likes.length > 0) {
      insights.push(`User likes: ${likes.map(r => r.to).join(', ')}`);
    }
    
    if (dislikes.length > 0) {
      insights.push(`User dislikes: ${dislikes.map(r => r.to).join(', ')}`);
    }
    
    // Find people connections
    const people = entities.filter(e => e.type === 'person');
    if (people.length > 0) {
      insights.push(`People mentioned: ${people.map(p => p.text).join(', ')}`);
    }
    
    // Find topics
    const topics = entities.filter(e => e.type === 'topic');
    if (topics.length > 0) {
      insights.push(`Topics discussed: ${topics.map(t => t.text).join(', ')}`);
    }
    
    return insights;
  }

  private entitiesToNodes(entities: Entity[]): Node[] {
    return entities.map(entity => ({
      id: this.normalizeId(entity.text),
      type: entity.type,
      label: entity.text,
      properties: {
        confidence: entity.confidence,
        context: entity.context,
      },
      timestamp: new Date().toISOString(),
    }));
  }

  private relationshipsToEdges(relationships: Relationship[]): Edge[] {
    return relationships.map(rel => {
      const edgeId = `${this.normalizeId(rel.from)}_${rel.type}_${this.normalizeId(rel.to)}`;
      return {
        id: edgeId,
        source: this.normalizeId(rel.from),
        target: this.normalizeId(rel.to),
        type: rel.type as Edge['type'],
        weight: rel.strength,
        properties: {},
        timestamp: new Date().toISOString(),
      };
    });
  }

  private normalizeId(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  }

  private deduplicateEntities(entities: Entity[]): Entity[] {
    const seen = new Map<string, Entity>();
    
    for (const entity of entities) {
      const key = `${entity.type}:${entity.text.toLowerCase()}`;
      const existing = seen.get(key);
      
      if (!existing || entity.confidence > existing.confidence) {
        seen.set(key, entity);
      }
    }
    
    return Array.from(seen.values());
  }

  private deduplicateRelationships(relationships: Relationship[]): Relationship[] {
    const seen = new Map<string, Relationship>();
    
    for (const rel of relationships) {
      const key = `${rel.from}:${rel.type}:${rel.to}`;
      const existing = seen.get(key);
      
      if (!existing || rel.strength > existing.strength) {
        seen.set(key, rel);
      }
    }
    
    return Array.from(seen.values());
  }
}
