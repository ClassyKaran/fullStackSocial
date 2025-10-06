const express = require('express');
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('socket.io');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: '*' } });

app.use(cors({
  origin: 'http://localhost:5173', // Specify frontend origin, not '*'
  credentials: true
}));

app.use(express.json());
// Serve uploads folder as static
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));


// Routes
// app.use('/', (req, res) => {
//   res.send('API is running...');
// });

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/users', userRoutes);

// Error handler
app.use(errorHandler);

// Socket.io setup
require('./controllers/chatController')(io);

module.exports = { app, server };
