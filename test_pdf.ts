import { PDFConversationParser } from './src/pdf-parser.js';

async function testPDFParsing() {
  console.log('=== Testing PDF Conversation Parser ===\n');

  const parser = new PDFConversationParser('lsp-ep5-transcript-pdf.pdf');
  
  console.log('Parsing PDF transcript...\n');
  const conversations = await parser.parseConversations();
  
  console.log(`✓ Parsed ${conversations.length} conversations from PDF\n`);
  
  if (conversations.length > 0) {
    console.log('Sample conversation:');
    const sample = conversations[0];
    console.log(`  ID: ${sample.id}`);
    console.log(`  Topic: ${sample.metadata.topic}`);
    console.log(`  Messages: ${sample.messages.length}`);
    console.log(`  Created: ${sample.metadata.created}`);
    console.log('\n  First 3 messages:');
    sample.messages.slice(0, 3).forEach((msg, i) => {
      console.log(`    ${i + 1}. [${msg.role}]: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
    });
  }
  
  console.log('\n✅ PDF parsing test complete!');
}

testPDFParsing().catch(console.error);
