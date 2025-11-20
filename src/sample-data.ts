import { Conversation, Message } from './types.js';

export class SampleDataGenerator {
  private conversationId = 0;

  generateSampleConversations(count: number = 3): Conversation[] {
    const conversations: Conversation[] = [];
    
    // Conversation 1: User preferences and interests
    conversations.push(this.createConversation([
      { role: 'user', content: 'Hi! I\'m Sarah and I love programming in TypeScript.' },
      { role: 'assistant', content: 'Hello Sarah! That\'s great. TypeScript is a powerful language. What kind of projects do you work on?' },
      { role: 'user', content: 'I mainly work on web applications. I really enjoy using React and Next.js.' },
      { role: 'assistant', content: 'Excellent choices! React and Next.js are very popular for modern web development.' },
      { role: 'user', content: 'Yeah, and I also like working with graph databases. Neo4j is my favorite.' },
      { role: 'assistant', content: 'Graph databases are fascinating! Neo4j is great for modeling complex relationships.' },
      { role: 'user', content: 'I\'m also interested in AI and machine learning, especially LLMs.' },
      { role: 'assistant', content: 'AI and LLMs are incredibly exciting fields right now. Are you working on any AI projects?' },
      { role: 'user', content: 'Yes, I\'m building a chatbot that uses Claude API. It\'s for customer support.' },
      { role: 'assistant', content: 'That sounds like a valuable project! Customer support is a great use case for LLMs.' },
    ], { topic: 'Programming Interests', participants: ['Sarah'] }));

    // Conversation 2: Personal relationships and connections
    conversations.push(this.createConversation([
      { role: 'user', content: 'I work with my colleague John on most projects.' },
      { role: 'assistant', content: 'It\'s great to have a reliable colleague. What does John specialize in?' },
      { role: 'user', content: 'John is really good at backend development. He knows Python and Go very well.' },
      { role: 'assistant', content: 'Python and Go are excellent for backend work. Do you collaborate on the architecture?' },
      { role: 'user', content: 'Yes, we do. My friend Emma also joins us sometimes. She\'s a UX designer.' },
      { role: 'assistant', content: 'Having a UX designer on the team is valuable. Does Emma work on the same projects?' },
      { role: 'user', content: 'Emma mainly works on the frontend design. She\'s amazing with Figma.' },
      { role: 'assistant', content: 'Figma is a powerful design tool. It sounds like you have a well-rounded team!' },
      { role: 'user', content: 'We do! John and Emma actually went to the same university.' },
      { role: 'assistant', content: 'That\'s a nice connection! It probably helps with team dynamics.' },
    ], { topic: 'Team and Relationships', participants: ['Sarah', 'John', 'Emma'] }));

    // Conversation 3: Preferences and dislikes
    conversations.push(this.createConversation([
      { role: 'user', content: 'I really don\'t like working with legacy PHP code.' },
      { role: 'assistant', content: 'Legacy code can be challenging. What makes PHP particularly difficult for you?' },
      { role: 'user', content: 'It\'s just messy and hard to maintain. I much prefer modern frameworks.' },
      { role: 'assistant', content: 'Modern frameworks do tend to have better structure and tooling.' },
      { role: 'user', content: 'I also dislike long meetings. They\'re usually unproductive.' },
      { role: 'assistant', content: 'Many people feel that way. Do you prefer asynchronous communication?' },
      { role: 'user', content: 'Yes! I love using Slack and GitHub for async collaboration.' },
      { role: 'assistant', content: 'Those are great tools for asynchronous work. What about video calls?' },
      { role: 'user', content: 'I don\'t mind short video calls, but I prefer them to be under 30 minutes.' },
      { role: 'assistant', content: 'That\'s a reasonable preference. Focused, time-boxed meetings can be effective.' },
    ], { topic: 'Work Preferences', participants: ['Sarah'] }));

    // Conversation 4: Technical facts and knowledge
    if (count > 3) {
      conversations.push(this.createConversation([
        { role: 'user', content: 'Did you know that TypeScript was created by Microsoft?' },
        { role: 'assistant', content: 'Yes! Anders Hejlsberg led the development. He also created C#.' },
        { role: 'user', content: 'That\'s right! TypeScript was first released in 2012.' },
        { role: 'assistant', content: 'It\'s come a long way since then. The type system has become very sophisticated.' },
        { role: 'user', content: 'React was created by Facebook, now Meta, in 2013.' },
        { role: 'assistant', content: 'Yes, Jordan Walke created it. It revolutionized frontend development.' },
        { role: 'user', content: 'I read that Next.js was created by Vercel in 2016.' },
        { role: 'assistant', content: 'That\'s correct! It\'s become one of the most popular React frameworks.' },
      ], { topic: 'Tech History', participants: ['Sarah'] }));
    }

    // Conversation 5: Events and timeline
    if (count > 4) {
      conversations.push(this.createConversation([
        { role: 'user', content: 'I started learning programming in 2018.' },
        { role: 'assistant', content: 'That\'s great! What was your first programming language?' },
        { role: 'user', content: 'I started with JavaScript. Then I moved to TypeScript in 2020.' },
        { role: 'assistant', content: 'That\'s a natural progression. TypeScript adds a lot of value to JavaScript.' },
        { role: 'user', content: 'I joined my current company in January 2022.' },
        { role: 'assistant', content: 'How has your experience been there?' },
        { role: 'user', content: 'It\'s been great! I got promoted to senior developer in 2023.' },
        { role: 'assistant', content: 'Congratulations on the promotion! That\'s excellent progress.' },
        { role: 'user', content: 'Thanks! I\'m planning to attend a tech conference in March 2024.' },
        { role: 'assistant', content: 'Conferences are great for learning and networking. Which one are you attending?' },
      ], { topic: 'Career Timeline', participants: ['Sarah'] }));
    }

    return conversations.slice(0, count);
  }

  private createConversation(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    metadata: { topic?: string; participants?: string[] } = {}
  ): Conversation {
    const baseTime = new Date('2024-01-15T10:00:00Z').getTime();
    const conversationMessages: Message[] = messages.map((msg, index) => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(baseTime + index * 60000).toISOString(), // 1 minute apart
    }));

    return {
      id: `conv_${++this.conversationId}`,
      messages: conversationMessages,
      metadata: {
        created: conversationMessages[0].timestamp,
        ...metadata,
      },
    };
  }

  generateCustomConversation(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    metadata?: { topic?: string; participants?: string[] }
  ): Conversation {
    return this.createConversation(messages, metadata);
  }
}
