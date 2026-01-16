import { SampleDataGenerator } from './src/sample-data.js';
import { GraphManager } from './src/graph.js';
import { ConversationAnalyzer } from './src/analyzer.js';
import { LLMClient } from './src/llm.js';

/**
 * Example: Analyzing a custom conversation
 * This shows how to use the system with your own conversation data
 */

async function analyzeCustomConversation() {
  console.log('=== Custom Conversation Analysis Example ===\n');

  // 1. Create your own conversation
  const generator = new SampleDataGenerator();
  const customConversation = generator.generateCustomConversation(
    [
      { role: 'user', content: 'Hi! I\'m Alex and I love building web applications.' },
      { role: 'assistant', content: 'Hello Alex! That\'s great. What technologies do you use?' },
      { role: 'user', content: 'I mainly use Vue.js and Node.js. I also work with MongoDB.' },
      { role: 'assistant', content: 'Excellent stack! Do you work with anyone else?' },
      { role: 'user', content: 'Yes, my colleague Maria is great with DevOps. She knows Docker and Kubernetes.' },
      { role: 'assistant', content: 'That\'s a valuable skill set. What about your preferences?' },
      { role: 'user', content: 'I really enjoy pair programming, but I don\'t like long standup meetings.' },
      { role: 'assistant', content: 'That makes sense. Efficient meetings are important!' },
    ],
    {
      topic: 'Alex\'s Tech Stack',
      participants: ['Alex', 'Maria'],
    }
  );

  console.log('Custom Conversation Created:');
  console.log(`- Topic: ${customConversation.metadata.topic}`);
  console.log(`- Messages: ${customConversation.messages.length}`);
  console.log(`- Participants: ${customConversation.metadata.participants?.join(', ')}\n`);

  // 2. Initialize analyzer
  const graphManager = new GraphManager();
  const analyzer = new ConversationAnalyzer(graphManager);

  // 3. Analyze the conversation
  console.log('Analyzing conversation...\n');
  const result = analyzer.analyzeConversation(customConversation);

  // 4. Display results
  console.log('📊 Analysis Results:');
  console.log(`\nEntities Found (${result.entities.length}):`);
  
  const entitiesByType = result.entities.reduce((acc, e) => {
    if (!acc[e.type]) acc[e.type] = [];
    acc[e.type].push(e.text);
    return acc;
  }, {} as Record<string, string[]>);

  for (const [type, entities] of Object.entries(entitiesByType)) {
    console.log(`  ${type}: ${entities.join(', ')}`);
  }

  console.log(`\nRelationships Found (${result.relationships.length}):`);
  result.relationships.slice(0, 10).forEach(rel => {
    console.log(`  ${rel.from} --[${rel.type}]--> ${rel.to} (strength: ${rel.strength})`);
  });
  if (result.relationships.length > 10) {
    console.log(`  ... and ${result.relationships.length - 10} more`);
  }

  console.log('\n💡 Insights:');
  result.insights.forEach(insight => console.log(`  • ${insight}`));

  // 5. Explore the graph
  console.log('\n🕸️  Knowledge Graph:');
  const graph = graphManager.exportGraph();
  console.log(`  Nodes: ${graph.nodes.length}`);
  console.log(`  Edges: ${graph.edges.length}`);

  // Find connections
  const people = graphManager.getNodesByType('person');
  const topics = graphManager.getNodesByType('topic');

  if (people.length > 0) {
    console.log(`\n👥 People in graph: ${people.map(p => p.label).join(', ')}`);
    
    // Show what each person is connected to
    for (const person of people) {
      const connections = graphManager.getConnectedNodes(person.id);
      console.log(`  ${person.label} is connected to: ${connections.map(n => n.label).join(', ')}`);
    }
  }

  if (topics.length > 0) {
    console.log(`\n💻 Technologies mentioned: ${topics.map(t => t.label).join(', ')}`);
  }

  // 6. Query with LLM (if available)
  const llmClient = new LLMClient();
  
  if (llmClient.isAvailable()) {
    console.log('\n🤖 Querying LLM with graph insights...\n');
    
    const graphInsights = [
      `Knowledge graph contains ${graph.nodes.length} nodes and ${graph.edges.length} edges.`,
      `People: ${people.map(p => p.label).join(', ')}`,
      `Technologies: ${topics.map(t => t.label).join(', ')}`,
      ...result.insights,
    ];

    const questions = [
      "What technologies does Alex use?",
      "Who does Alex work with and what are their skills?",
      "What are Alex's work preferences?",
    ];

    for (const question of questions) {
      console.log(`Q: ${question}`);
      const response = await llmClient.query({ question, graphInsights });
      console.log(`A: ${response.answer}\n`);
    }
  } else {
    console.log('\n⚠️  LLM not available (set ANTHROPIC_API_KEY to enable)');
    console.log('Graph insights are still available without LLM:\n');
    result.insights.forEach(insight => console.log(`  • ${insight}`));
  }

  console.log('\n✅ Analysis complete!');
  console.log('\nThis example shows how to:');
  console.log('  1. Create custom conversations');
  console.log('  2. Extract entities and relationships');
  console.log('  3. Build a knowledge graph');
  console.log('  4. Query with LLM assistance');
}

analyzeCustomConversation().catch(console.error);
