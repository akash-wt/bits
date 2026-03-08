# Bits

A decentralized peer-to-peer messaging application built on Solana blockchain with real-time communication.

## Overview

Bits is a secure messaging platform that uses Solana wallet authentication for user identity. Users connect with their Solana wallet and can chat with anyone using their public key. All messages are stored securely with real-time delivery powered by WebSockets.

## Features

- Wallet-based authentication using Solana Mobile Wallet Adapter
- Real-time messaging with Socket.io
- Message status tracking (sent, delivered, read)
- Unread message counts
- Search and filter conversations
- Persistent local storage with MMKV
- Retro pixel art UI design

## Tech Stack

### Mobile App (React Native + Expo)

- React Native with Expo Router
- Solana Web3.js for blockchain integration
- Socket.io client for real-time messaging
- Zustand for state management
- MMKV for fast local storage
- TypeScript

### Backend (Node.js + Express)

- Express.js REST API
- Socket.io server for WebSockets
- Prisma ORM with PostgreSQL
- JWT authentication
- Message verification with TweetNaCl

## Project Structure

```
bits/
├── app/                    # React Native mobile app
│   ├── app/               # Expo Router pages
│   │   ├── (auth)/       # Authentication screens
│   │   ├── (tabs)/       # Main tab navigation
│   │   └── chat/         # Chat detail screens
│   ├── src/
│   │   ├── config/       # App configuration
│   │   ├── lib/          # Utilities and helpers
│   │   ├── socket/       # Socket.io client setup
│   │   └── stores/       # Zustand state stores
│   └── assets/           # Images and static files
│
└── server/                # Node.js backend
    ├── src/
    │   ├── routes/       # API routes
    │   ├── lib/          # Database client
    │   └── types/        # TypeScript types
    └── prisma/           # Database schema and migrations
```

## Getting Started

### Prerequisites

- Node.js 18+
- Solana wallet app (Phantom, Solflare, etc.)
- PostgreSQL database
- Android device or emulator with wallet app installed

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp env.example .env
```

Edit `.env` and add your database URL:
```
DATABASE_URL="postgresql://user:password@localhost:5432/bits"
JWT_PASSWORD="your-secret-key"
```

4. Run database migrations:
```bash
npx prisma migrate deploy
```

5. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

### Mobile App Setup

1. Navigate to app directory:
```bash
cd app
```

2. Install dependencies:
```bash
npm install
```

3. Update backend URL in `src/config/index.ts`:
```typescript
export const BACKEND_URL = "http://YOUR_IP:3000/api/v1"
```

4. Start Expo development server:
```bash
npm start
```

5. Build development client:
```bash
npx expo run:android
```

## Usage

1. Launch the app on your Android device
2. Click "Connect Solana Wallet" to authenticate
3. Approve the connection in your wallet app
4. Sign the verification message
5. Start chatting by entering a recipient's Solana public key

## Authentication Flow

1. User initiates wallet connection
2. Backend generates a random nonce
3. User signs the nonce with their wallet
4. Backend verifies the signature
5. JWT token issued for authenticated sessions

## Database Schema

### User
- Stores Solana public keys
- Generates unique nonce for each auth attempt
- Tracks created/updated timestamps

### Message
- Links sender and receiver by public key
- Stores message text and status
- Indexed for fast queries

## API Endpoints

### POST `/api/v1/user/check`
Check if user exists and get auth nonce

### POST `/api/v1/auth/verify/nonce`
Verify signed message and issue JWT

## Socket Events

### Client → Server
- `register` - Register user's socket connection
- `send_message` - Send a new message
- `get_messages` - Fetch conversation history
- `get_everything` - Get all conversations

### Server → Client
- `receive_message` - Incoming message notification
- `message_delivered` - Delivery confirmation
- `message_history` - Historical messages
- `all_talked_users` - List of all conversations

## Security

- Cryptographic signature verification using Ed25519
- Nonce rotation to prevent replay attacks
- JWT tokens with 30-day expiration
- No password storage required
- Client-side encryption ready

## Development

### Running Tests
```bash
cd server
npm test
```

### Database Management
```bash
# Create new migration
npx prisma migrate dev --name migration_name

# View database
npx prisma studio
```

### Building for Production

Backend:
```bash
cd server
npm run build
npm start
```

Mobile:
```bash
cd app
eas build --platform android
```

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome. Please open an issue first to discuss proposed changes.

## Support

For issues or questions, please open a GitHub issue.

## Acknowledgments

- Solana Mobile Stack for wallet integration
- Socket.io for real-time communication
- Expo team for excellent developer experience
