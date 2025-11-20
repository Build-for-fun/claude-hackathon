import fs from 'fs/promises';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { Conversation, Message } from './types.js';

export class PDFConversationParser {
  private pdfPath: string;

  constructor(pdfPath: string = 'lsp-ep5-transcript-pdf.pdf') {
    this.pdfPath = path.resolve(process.cwd(), pdfPath);
  }

  async parseConversations(): Promise<Conversation[]> {
    try {
      // Read PDF file
      const dataBuffer = await fs.readFile(this.pdfPath);
      
      // Load PDF document
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(dataBuffer),
        useSystemFonts: true,
      });
      
      const pdf = await loadingTask.promise;
      let fullText = '';
      
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      // Parse the transcript into conversations
      return this.parseTranscript(fullText);
    } catch (error) {
      console.error('Error parsing PDF:', error);
      return [];
    }
  }

  private parseTranscript(text: string): Conversation[] {
    const conversations: Conversation[] = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let currentMessages: Message[] = [];
    let conversationId = 1;
    let messageCount = 0;
    
    // Common patterns for speaker identification in transcripts
    const speakerPatterns = [
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*[:：]\s*(.+)$/,  // "Name: message"
      /^([A-Z]+)\s*[:：]\s*(.+)$/,  // "NAME: message"
      /^\[([^\]]+)\]\s*[:：]?\s*(.+)$/,  // "[Name]: message"
      /^([A-Z][a-z]+)\s+says?\s*[:：]?\s*(.+)$/i,  // "Name says: message"
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip page numbers, headers, footers
      if (/^page\s+\d+/i.test(line) || /^\d+$/.test(line)) {
        continue;
      }

      let matched = false;
      
      // Try to match speaker patterns
      for (const pattern of speakerPatterns) {
        const match = line.match(pattern);
        if (match) {
          const speaker = match[1].trim();
          const content = match[2].trim();
          
          if (content.length > 0) {
            // Determine role based on speaker
            const role = this.determineRole(speaker);
            
            currentMessages.push({
              role,
              content,
              timestamp: new Date(Date.now() + messageCount * 60000).toISOString(),
            });
            
            messageCount++;
            matched = true;
            break;
          }
        }
      }
      
      // If no speaker pattern matched but we have messages, append to last message
      if (!matched && currentMessages.length > 0 && line.length > 20) {
        const lastMessage = currentMessages[currentMessages.length - 1];
        lastMessage.content += ' ' + line;
      }
      
      // Create conversation chunks every 10-15 messages
      if (currentMessages.length >= 12) {
        conversations.push(this.createConversation(conversationId++, currentMessages));
        currentMessages = [];
      }
    }
    
    // Add remaining messages as final conversation
    if (currentMessages.length > 0) {
      conversations.push(this.createConversation(conversationId++, currentMessages));
    }
    
    return conversations;
  }

  private determineRole(speaker: string): 'user' | 'assistant' {
    const speakerLower = speaker.toLowerCase();
    
    // Common assistant/AI/system names
    const assistantKeywords = ['assistant', 'ai', 'bot', 'system', 'claude', 'gpt', 'model'];
    
    for (const keyword of assistantKeywords) {
      if (speakerLower.includes(keyword)) {
        return 'assistant';
      }
    }
    
    // Default to user for human names
    return 'user';
  }

  private createConversation(id: number, messages: Message[]): Conversation {
    // Extract participants from messages
    const participants = new Set<string>();
    
    // Try to infer topic from first few messages
    const firstMessages = messages.slice(0, 3).map(m => m.content).join(' ');
    const topic = this.inferTopic(firstMessages);
    
    return {
      id: `conv_${id}`,
      messages: [...messages],
      metadata: {
        created: messages[0]?.timestamp || new Date().toISOString(),
        topic,
        participants: Array.from(participants),
      },
    };
  }

  private inferTopic(text: string): string {
    const textLower = text.toLowerCase();
    
    // Common topic keywords
    const topics = [
      { keywords: ['code', 'programming', 'software', 'development'], label: 'Software Development' },
      { keywords: ['design', 'ui', 'ux', 'interface'], label: 'Design' },
      { keywords: ['data', 'analysis', 'analytics', 'database'], label: 'Data Analysis' },
      { keywords: ['ai', 'machine learning', 'ml', 'model'], label: 'AI/ML' },
      { keywords: ['project', 'management', 'planning'], label: 'Project Management' },
      { keywords: ['business', 'strategy', 'market'], label: 'Business' },
    ];
    
    for (const topic of topics) {
      for (const keyword of topic.keywords) {
        if (textLower.includes(keyword)) {
          return topic.label;
        }
      }
    }
    
    return 'General Discussion';
  }

  async getConversationCount(): Promise<number> {
    const conversations = await this.parseConversations();
    return conversations.length;
  }

  async getConversation(index: number): Promise<Conversation | null> {
    const conversations = await this.parseConversations();
    return conversations[index] || null;
  }
}
