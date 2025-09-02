// Test localStorage functionality
console.log('Testing localStorage...');

// Test basic localStorage
try {
  localStorage.setItem('test-key', 'test-value');
  const value = localStorage.getItem('test-key');
  console.log('Basic localStorage test:', value === 'test-value' ? 'PASSED' : 'FAILED');
  localStorage.removeItem('test-key');
} catch (error) {
  console.error('localStorage not available:', error);
}

// Test with complex objects like our friends data
const testFriend = {
  id: 'test-123',
  name: 'Test Friend',
  timezone: 'America/New_York',
  timezoneDisplay: 'New York, NY',
  addedAt: new Date()
};

try {
  localStorage.setItem('test-friends', JSON.stringify([testFriend]));
  const retrieved = JSON.parse(localStorage.getItem('test-friends'));
  console.log('Complex object test:', retrieved.length === 1 ? 'PASSED' : 'FAILED');
  console.log('Retrieved friend:', retrieved[0]);
  localStorage.removeItem('test-friends');
} catch (error) {
  console.error('Complex object test failed:', error);
}

// Check what's currently in localStorage
console.log('\nCurrent localStorage keys:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`- ${key}: ${localStorage.getItem(key)?.substring(0, 100)}...`);
}