# CodeBet - Aviator Crash Game Simulator

A real-time multiplayer crash game simulator inspired by Aviator, built with Node.js, Express, Socket.io, and MongoDB.

## Features

- Real-time multiplayer gameplay with Socket.io
- JWT authentication with phone number registration
- Virtual wallet system with balance management
- Admin dashboard for game control
- Analytics module for game statistics
- Responsive client interface

## Tech Stack

**Backend:**
- Node.js
- Express.js
- Socket.io for real-time communication
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing

**Frontend:**
- React (located in `/client`)
- Socket.io client

**Analytics:**
- Separate analytics dashboard (located in `/analytics`)

## Prerequisites

- Node.js 14.x or higher
- MongoDB instance (local or cloud)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd codebet
```

2. Install all dependencies:
```bash
npm run install-all
```

This will install dependencies for the server, client, and analytics modules.

3. Create a `.env` file in the server directory:
```bash
cd server
touch .env
```

4. Configure environment variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/codebet
JWT_SECRET=your_jwt_secret_key_here
```

## Usage

### Development Mode

Run both server and client concurrently:
```bash
npm run dev
```

Or run them separately:
```bash
# Server only
npm run server

# Client only
npm run client

# Analytics only
npm run analytics
```

### Production Build

1. Build the client application:
```bash
cd client
npm run build
```

2. Start the server:
```bash
npm run server
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/deposit` - Deposit funds
- `POST /api/wallet/withdraw` - Withdraw funds

### Game
- `GET /api/game/status` - Get current game state
- `POST /api/game/bet` - Place a bet
- `POST /api/game/cashout` - Cash out before crash
- `GET /api/game/history` - Get game history

### Health Check
- `GET /api/health` - Server health check

## Game Mechanics

1. **Game States**: waiting → betting → flying → crashed
2. **Multiplier**: Starts at 1.0x and increases exponentially
3. **Crash Point**: Randomly determined each round
4. **Betting**: Players place bets before round starts
5. **Cashout**: Players can cash out at any multiplier before crash

## Project Structure

```
codebet/
├── server/
│   └── src/
│       ├── index.js          # Server entry point
│       ├── models/           # Mongoose schemas
│       ├── routes/           # Express routes
│       ├── services/         # Business logic
│       ├── sockets/          # Socket.io handlers
│       └── middleware/       # Auth middleware
├── client/                   # React frontend
├── analytics/                # Analytics dashboard
├── package.json
└── README.md
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/codebet |
| JWT_SECRET | Secret key for JWT tokens | - |

## Socket Events

**Client → Server:**
- `join_game` - Join game room
- `place_bet` - Place a bet
- `cashout` - Cash out before crash

**Server → Client:**
- `game_state` - Current game state update
- `bet_placed` - Bet confirmation
- `cashout_success` - Cashout confirmation
- `game_crash` - Round crash event
- `new_round` - New round started

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Use ES6+ JavaScript features
- Follow Express.js best practices
- Use async/await for asynchronous operations
- Handle errors appropriately

## Security Considerations

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Input validation on all routes
- CORS configured for allowed origins

## Troubleshooting

### MongoDB Connection Issues
Ensure MongoDB is running and connection string is correct in `.env`.

### Port Already in Use
Change the PORT in `.env` file or kill the process using the port.

### Socket Connection Issues
Check CORS configuration in `server/src/index.js` for allowed origins.

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
