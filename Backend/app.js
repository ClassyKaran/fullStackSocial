const express = require("express");
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const socketio = require("socket.io");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const userRoutes = require("./routes/users");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();
const server = http.createServer(app);





const io = socketio(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // from .env
    credentials: true,
  },
});

// ✅ CORS config using env
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // FRONTEND_URL from .env
    credentials: true,
  })
);


app.use(express.json());
// Serve uploads folder as static
app.use("/uploads", express.static(require("path").join(__dirname, "uploads")));



app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/users", userRoutes);

// Error handler
app.use(errorHandler);

// Serve frontend static files (Vite build output)
// const path = require('path');
// app.use(express.static(path.join(__dirname, '../Frontend/dist')));

// SPA fallback: send index.html for any GET request not handled above (except uploads/api)
// app.get('*', (req, res, next) => {
//   if (
//     req.method !== 'GET' ||
//     req.path.startsWith('/uploads') ||
//     req.path.startsWith('/auth') ||
//     req.path.startsWith('/posts') ||
//     req.path.startsWith('/users')
//   ) {
//     return next();
//   }
//   res.sendFile(path.join(__dirname, '../Frontend/dist/index.html'));
// });

// Socket.io setup
require("./controllers/chatController")(io);

module.exports = { app, server };
