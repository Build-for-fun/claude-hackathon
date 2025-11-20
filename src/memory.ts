import fs from 'fs/promises';
import path from 'path';
import { Memory } from './types.js';

export class MemoryManager {
  private memoryFile: string;
  private memories: Map<string, Memory>;

  constructor(memoryFile: string = 'memory.json') {
    this.memoryFile = path.resolve(process.cwd(), memoryFile);
    this.memories = new Map();
  }

  async load() {
    try {
      const data = await fs.readFile(this.memoryFile, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        this.memories = new Map(parsed.map((m: Memory) => [m.key, m]));
      }
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        console.error('Error loading memories:', error);
      }
      // If file doesn't exist, start with empty memory
    }
  }

  async save() {
    try {
      const data = JSON.stringify(Array.from(this.memories.values()), null, 2);
      await fs.writeFile(this.memoryFile, data, 'utf-8');
    } catch (error) {
      console.error('Error saving memories:', error);
    }
  }

  async add(key: string, value: any, category: string = 'general', confidence: number = 1.0): Promise<Memory> {
    const memory: Memory = {
      key,
      value,
      category,
      confidence,
      timestamp: new Date().toISOString(),
    };
    this.memories.set(key, memory);
    await this.save();
    return memory;
  }

  async get(key: string): Promise<Memory | undefined> {
    return this.memories.get(key);
  }

  async search(query: string): Promise<Memory[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.memories.values()).filter(m => 
      m.key.toLowerCase().includes(lowerQuery) || 
      JSON.stringify(m.value).toLowerCase().includes(lowerQuery) ||
      m.category.toLowerCase().includes(lowerQuery)
    );
  }

  async update(key: string, value: any): Promise<Memory | undefined> {
    const memory = this.memories.get(key);
    if (!memory) return undefined;

    memory.value = value;
    memory.timestamp = new Date().toISOString();
    this.memories.set(key, memory);
    await this.save();
    return memory;
  }

  async delete(key: string): Promise<boolean> {
    const deleted = this.memories.delete(key);
    if (deleted) {
      await this.save();
    }
    return deleted;
  }
  
  async list(): Promise<Memory[]> {
      return Array.from(this.memories.values());
  }
}
