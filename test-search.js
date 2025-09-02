// Quick test of the search function
import { searchTimezones } from './src/timezones.ts';

console.log('Testing search for "nebraska":');
const results = searchTimezones('nebraska');
console.log(results);

console.log('\nTesting search for "new":');
const results2 = searchTimezones('new');
console.log(results2.slice(0, 5)); // First 5 results