# Mini Social Platform Backend (Node.js + Express + MongoDB)

## Features
- JWT Authentication (Login/Register)
- Posts CRUD (Create, Like, Comment)
- User Profile, Follow/Unfollow
- Real-time Chat (Socket.io)
- Proper MVC structure

## Folder Structure
```
backend/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── middlewares/
 ├── utils/
 ├── config/
 ├── app.js
 ├── server.js
 └── .env.example
```

## Setup
1. `npm install`
2. `.env` file बनाएँ (example देखिए)
3. `npm start` या `node server.js`

## API Endpoints
- `POST /auth/register` — Register
- `POST /auth/login` — Login
- `GET /posts` — Get all posts
- `POST /posts` — Create post
- `POST /posts/:id/like` — Like post
- `POST /posts/:id/comment` — Comment on post
- `GET /users/:userId` — Get user profile
- `POST /users/follow` — Follow user
- `POST /users/unfollow` — Unfollow user
- Socket.io — Real-time chat


# MONGO_URI=mongodb://localhost:27017/minisocial
JWT_SECRET=your_jwt_secret
PORT=5000
# MONGO_URI=mongodb+srv://karanrajput:karanrajput@cluster0.sirchf4.mongodb.net/minisocial?retryWrites=true&w=majority&appName=minisocial
MONGO_URI=mongodb+srv://Karan_Rajput:karanrajput@cluster0.0xby2o2.mongodb.net/minisocial?retryWrites=true&w=majority&appName=minisocial
SOCKET_URL=http://localhost:5000
---

**Frontend:** React + Bootstrap + React Query + Axios + Socket.io-client
**Backend:** Node.js + Express + MongoDB + Socket.io
