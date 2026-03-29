const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const testUserId = '507f1f77bcf86cd799439011';
const token = jwt.sign({ id: testUserId }, process.env.JWT_SECRET, { expiresIn: '7d' });
console.log('Test Token:', token);
console.log('Use this token to test protected endpoints');