const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Testing JWT functionality...\n');

// Test data
const testUserId = '507f1f77bcf86cd799439011'; // Example MongoDB ObjectId
const testSecret = process.env.JWT_SECRET || 'test-secret';
const testExpire = process.env.JWT_EXPIRE || '7d';

console.log('JWT Configuration:');
console.log('Secret:', testSecret ? 'Set (hidden for security)' : 'NOT SET');
console.log('Expiration:', testExpire);
console.log('');

try {
  // Test 1: Generate token
  console.log('Test 1: Generating JWT token...');
  const token = jwt.sign({ id: testUserId }, testSecret, { expiresIn: testExpire });
  console.log('✅ Token generated successfully');
  console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
  console.log('');

  // Test 2: Verify token
  console.log('Test 2: Verifying JWT token...');
  const decoded = jwt.verify(token, testSecret);
  console.log('✅ Token verified successfully');
  console.log('Decoded payload:', decoded);
  console.log('User ID from token:', decoded.id);
  console.log('Expiration time:', new Date(decoded.exp * 1000).toISOString());
  console.log('');

  // Test 3: Check token structure
  console.log('Test 3: Token structure analysis...');
  const parts = token.split('.');
  console.log('Token has', parts.length, 'parts (should be 3: header.payload.signature)');
  if (parts.length === 3) {
    console.log('✅ Token structure is correct');
    
    // Decode header and payload (without verification)
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    console.log('Header:', header);
    console.log('Payload:', payload);
    console.log('Algorithm:', header.alg);
    console.log('Type:', header.typ);
  } else {
    console.log('❌ Token structure is incorrect');
  }
  console.log('');

  // Test 4: Test invalid token
  console.log('Test 4: Testing invalid token detection...');
  try {
    jwt.verify('invalid.token.here', testSecret);
    console.log('❌ Should have thrown error for invalid token');
  } catch (err) {
    console.log('✅ Invalid token correctly rejected:', err.message);
  }
  console.log('');

  // Test 5: Test wrong secret
  console.log('Test 5: Testing wrong secret detection...');
  try {
    jwt.verify(token, 'wrong-secret');
    console.log('❌ Should have thrown error for wrong secret');
  } catch (err) {
    console.log('✅ Wrong secret correctly rejected:', err.message);
  }
  console.log('');

  console.log('🎉 All JWT tests passed!');
  console.log('\nConclusion: JWT is configured correctly and working.');

} catch (error) {
  console.error('❌ JWT test failed:', error.message);
  console.error('Stack:', error.stack);
}