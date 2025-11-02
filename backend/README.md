# RealityNet Backend

Express.js + TypeScript backend with PostgreSQL database for Instagram-like social features.

## Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Database

#### Option A: Using Docker (Recommended)
```bash
docker-compose up -d
```

#### Option B: Manual PostgreSQL
Create a PostgreSQL database and update `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/realitynet?schema=public"
```

### 3. Run Migrations
```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Configure Environment
Copy `.env.example` to `.env` and fill in:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `PORT` - Server port (default: 4000)
- `FRONTEND_URL` - Frontend URL for CORS

### 5. Start Server
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/wallet` - Authenticate with wallet
- `GET /api/auth/me` - Get current user

### Posts
- `POST /api/posts` - Create new post (multipart/form-data)
- `GET /api/posts/:id` - Get post details
- `GET /api/posts/user/:userId` - Get user's posts
- `DELETE /api/posts/:id` - Delete post

### Feed
- `GET /api/feed` - Get main feed (trending/recent/verified)
- `GET /api/feed/following` - Get following feed

### Stakes
- `POST /api/stakes` - Stake on post (correct/incorrect)
- `GET /api/stakes/post/:postId` - Get stakes for post
- `POST /api/stakes/:postId/resolve` - Resolve post

### Users
- `GET /api/users/:id` - Get user profile
- `PATCH /api/users/:id` - Update profile
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow` - Unfollow user
- `POST /api/users/posts/:postId/like` - Like/unlike post
- `POST /api/users/posts/:postId/comment` - Comment on post

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read

## Database Schema

- **User** - User profiles linked to wallet addresses
- **Post** - Reality events with media, GPS, metadata
- **Comment** - Comments on posts
- **Like** - Likes on posts
- **Stake** - Stakes on post correctness
- **Follow** - User follow relationships
- **Notification** - Real-time notifications

## Features

✅ Instagram-like feed with posts
✅ Like, comment, follow functionality
✅ Staking system for truth verification
✅ Real-time updates via Socket.io
✅ IPFS media storage
✅ AI authenticity scoring
✅ Trending algorithm
✅ Notification system

