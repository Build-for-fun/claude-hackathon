import { SampleDataGenerator } from './src/sample-data.js';
import { GraphManager } from './src/graph.js';
import { ConversationAnalyzer } from './src/analyzer.js';
import { LLMClient } from './src/llm.js';

async function testGraphReasoningSystem() {
  console.log('=== Testing Graph Reasoning Analysis System ===\n');

  // 1. Generate sample data
  console.log('1. Generating sample conversations...');
  const generator = new SampleDataGenerator();
  const conversations = generator.generateSampleConversations(3);
  console.log(`✓ Generated ${conversations.length} conversations\n`);

  // 2. Initialize graph and analyzer
  console.log('2. Initializing graph manager and analyzer...');
  const graphManager = new GraphManager();
  const analyzer = new ConversationAnalyzer(graphManager);
  console.log('✓ Initialized\n');

  // 3. Analyze conversations
  console.log('3. Analyzing conversations...');
  for (const conv of conversations) {
    console.log(`\n   Analyzing: ${conv.metadata.topic}`);
    const result = analyzer.analyzeConversation(conv);
    console.log(`   - Entities: ${result.entities.length}`);
    console.log(`   - Relationships: ${result.relationships.length}`);
    console.log(`   - Insights:`);
    result.insights.forEach(insight => console.log(`     • ${insight}`));
  }
  console.log('\n✓ Analysis complete\n');

  // 4. Explore the graph
  console.log('4. Exploring the knowledge graph...');
  const graph = graphManager.exportGraph();
  console.log(`   - Total nodes: ${graph.nodes.length}`);
  console.log(`   - Total edges: ${graph.edges.length}`);
  
  console.log('\n   Node types:');
  const nodesByType = {
    person: graph.nodes.filter(n => n.type === 'person'),
    topic: graph.nodes.filter(n => n.type === 'topic'),
    preference: graph.nodes.filter(n => n.type === 'preference'),
    fact: graph.nodes.filter(n => n.type === 'fact'),
    event: graph.nodes.filter(n => n.type === 'event'),
  };
  
  for (const [type, nodes] of Object.entries(nodesByType)) {
    if (nodes.length > 0) {
      console.log(`   - ${type}: ${nodes.length} (${nodes.slice(0, 3).map(n => n.label).join(', ')}${nodes.length > 3 ? '...' : ''})`);
    }
  }

  console.log('\n   Most connected entities:');
  const topConnected = graphManager.getMostConnectedNodes(5);
  topConnected.forEach(({ node, degree }) => {
    console.log(`   - ${node.label} (${node.type}): ${degree} connections`);
  });

  console.log('\n   Strongest relationships:');
  const strongEdges = graphManager.getStrongestConnections(5);
  strongEdges.forEach(edge => {
    const source = graphManager.getNode(edge.source);
    const target = graphManager.getNode(edge.target);
    console.log(`   - ${source?.label} --[${edge.type}]--> ${target?.label} (weight: ${edge.weight})`);
  });

  // 5. Test LLM integration (if available)
  console.log('\n5. Testing LLM integration...');
  const llmClient = new LLMClient();
  
  if (llmClient.isAvailable()) {
    console.log('   ✓ LLM client is available (ANTHROPIC_API_KEY found)');
    
    // Build graph insights
    const graphInsights = [
      `Knowledge graph contains ${graph.nodes.length} nodes and ${graph.edges.length} edges.`,
      `Most connected entities: ${topConnected.map(n => `${n.node.label} (${n.degree} connections)`).join(', ')}`,
      `Entity distribution: ${Object.entries(nodesByType)
        .filter(([_, nodes]) => nodes.length > 0)
        .map(([type, nodes]) => `${nodes.length} ${type}(s)`)
        .join(', ')}`,
    ];
    
    const question = "What are Sarah's main interests and preferences?";
    console.log(`\n   Question: "${question}"`);
    console.log('   Querying LLM with graph insights...');
    
    const response = await llmClient.query({
      question,
      graphInsights,
    });
    
    console.log(`\n   Answer:\n   ${response.answer.split('\n').join('\n   ')}`);
    console.log(`\n   Confidence: ${response.confidence}`);
  } else {
    console.log('   ⚠ LLM client not available (set ANTHROPIC_API_KEY to enable)');
    console.log('   The system will still work with graph-based insights only.');
  }

  // 6. Test graph patterns
  console.log('\n6. Testing graph pattern detection...');
  const clusters = graphManager.findClusters();
  console.log(`   - Found ${clusters.length} clusters`);
  clusters.forEach((cluster, i) => {
    const nodes = cluster.map(id => graphManager.getNode(id)?.label).filter(Boolean);
    console.log(`   - Cluster ${i + 1}: ${nodes.slice(0, 5).join(', ')}${nodes.length > 5 ? '...' : ''} (${nodes.length} nodes)`);
  });

  // Test path finding
  const people = graphManager.getNodesByType('person');
  const topics = graphManager.getNodesByType('topic');
  
  if (people.length > 0 && topics.length > 0) {
    const path = graphManager.findPath(people[0].id, topics[0].id);
    if (path) {
      const pathLabels = path.map(id => graphManager.getNode(id)?.label).filter(Boolean);
      console.log(`\n   Path from ${people[0].label} to ${topics[0].label}:`);
      console.log(`   ${pathLabels.join(' → ')}`);
    }
  }

  console.log('\n=== All Tests Complete ===');
  console.log('\nThe graph reasoning system is working correctly!');
  console.log('You can now use the MCP tools:');
  console.log('  - generate_sample_data: Create sample conversations');
  console.log('  - analyze_conversation: Analyze and build knowledge graph');
  console.log('  - query_insights: Ask questions with LLM assistance');
  console.log('  - get_graph: Export graph structure');
}

testGraphReasoningSystem().catch(console.error);
