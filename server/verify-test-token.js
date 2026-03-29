const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTc3NDc4NzYxMSwiZXhwIjoxNzc1MzkyNDExfQ.ybd3iyjlGwhGVm7YGh89z0KOoiNJJYb7ORAocxkwy-I';

console.log('Testing token verification...');
console.log('Using JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'NOT SET');

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('✅ Token verification SUCCESSFUL');
  console.log('Decoded:', decoded);
} catch (error) {
  console.log('❌ Token verification FAILED:', error.message);
  console.log('Error:', error);
}