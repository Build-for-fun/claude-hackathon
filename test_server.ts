import { MemoryManager } from './src/memory.ts';
import assert from 'assert';
import fs from 'fs/promises';

async function testMemoryManager() {
  console.log('Starting MemoryManager tests...');
  
  // Clean up previous test file
  try {
    await fs.unlink('test_memory.json');
  } catch (e) {}

  const manager = new MemoryManager('test_memory.json');
  await manager.load();

  // Test Add
  console.log('Testing Add...');
  await manager.add('user_name', 'Keshav', 'profile', 1.0);
  const m1 = await manager.get('user_name');
  assert.strictEqual(m1?.value, 'Keshav');
  assert.strictEqual(m1?.category, 'profile');

  // Test Search
  console.log('Testing Search...');
  await manager.add('user_skill', 'TypeScript', 'skills', 0.9);
  const results = await manager.search('type');
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].key, 'user_skill');

  // Test Update
  console.log('Testing Update...');
  await manager.update('user_name', 'Keshav Dalmia');
  const m2 = await manager.get('user_name');
  assert.strictEqual(m2?.value, 'Keshav Dalmia');

  // Test Persistence (Load new instance)
  console.log('Testing Persistence...');
  const manager2 = new MemoryManager('test_memory.json');
  await manager2.load();
  const m3 = await manager2.get('user_name');
  assert.strictEqual(m3?.value, 'Keshav Dalmia');

  // Test Delete
  console.log('Testing Delete...');
  await manager2.delete('user_name');
  const m4 = await manager2.get('user_name');
  assert.strictEqual(m4, undefined);

  console.log('All tests passed!');
  
  // Cleanup
  try {
    await fs.unlink('test_memory.json');
  } catch (e) {}
}

testMemoryManager().catch(console.error);
