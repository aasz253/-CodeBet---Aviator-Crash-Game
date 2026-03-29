const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

console.log('Testing MongoDB Atlas connection...');
console.log('Connection string:', process.env.MONGODB_URI ? 'Set (hidden)' : 'NOT SET');

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in .env file');
  process.exit(1);
}

console.log('\nAttempting to connect to MongoDB Atlas...');

// Set connection timeout to 10 seconds
const connectionOptions = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 10000
};

mongoose.connect(process.env.MONGODB_URI, connectionOptions)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('Connection state:', mongoose.connection.readyState);
    console.log('Database name:', mongoose.connection.db.databaseName);
    
    // Test a simple operation
    return mongoose.connection.db.listCollections().toArray();
  })
  .then(collections => {
    console.log('Collections in database:', collections.map(c => c.name));
    
    // Close connection
    return mongoose.connection.close();
  })
  .then(() => {
    console.log('\n✅ MongoDB Atlas connection test completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ MongoDB connection failed:', err.message);
    console.error('Error code:', err.code);
    console.error('Error name:', err.name);
    
    if (err.message.includes('ETIMEOUT')) {
      console.error('\n💡 This looks like a DNS or network timeout issue.');
      console.error('   - Check your internet connection');
      console.error('   - Try using a different DNS (8.8.8.8)');
      console.error('   - Check firewall settings');
    } else if (err.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Connection refused - cluster might be paused or down');
    } else if (err.message.includes('authentication')) {
      console.error('\n💡 Authentication failed - check username and password');
    }
    
    process.exit(1);
  });