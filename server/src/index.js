const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const walletRoutes = require('./routes/wallet');
const gameRoutes = require('./routes/game');
const { setupSocket } = require('./sockets/gameSocket');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/game', gameRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const GameState = require('./models/GameState');
const { startGameLoop } = require('./services/gameEngine');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codebet')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    let gameState = await GameState.findOne();
    if (!gameState) {
      gameState = new GameState({
        status: 'waiting',
        currentMultiplier: 1.0,
        crashPoint: null,
        history: []
      });
      await gameState.save();
    }
    
    startGameLoop(io);
    console.log('Game loop started');
  })
  .catch(err => console.error('MongoDB connection error:', err));

setupSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
