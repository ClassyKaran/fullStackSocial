
const User = require('../models/User');
const Message = require('../models/Message');

module.exports = (io) => {
  let users = {}; // { socketId: { id, username } }

  io.on('connection', (socket) => {
    socket.on('join', async (userId) => {
      // Get username from DB
      let username = userId;
      try {
        const user = await User.findById(userId);
        if (user) username = user.username;
      } catch {}
      users[socket.id] = { id: userId, username };
      // Emit userList as array of { id, username }
      io.emit('userList', Object.values(users));

      // Deliver pending messages
      try {
        const pendingMessages = await Message.find({ to: userId, delivered: false }).populate('from');
        for (const msg of pendingMessages) {
          socket.emit('message', { from: msg.from._id, text: msg.text });
          msg.delivered = true;
          await msg.save();
        }
      } catch (err) {
        console.error('Error delivering pending messages:', err);
      }
    });

    socket.on('message', async ({ to, text }) => {
      // Find sender
      let sender = users[socket.id];
      if (!sender) {
        socket.emit('error', { message: 'Sender not found. Please join before sending messages.' });
        console.log('Sender not found for socket:', socket.id);
        return;
      }

      // Save message to DB
      try {
        await Message.create({ from: sender.id, to, text });
      } catch (err) {
        console.error('Error saving message:', err);
        socket.emit('error', { message: 'Failed to send message.' });
        return;
      }

      let recipientSocketId = null;
      for (let [id, user] of Object.entries(users)) {
        if (user.id === to) {
          recipientSocketId = id;
          break;
        }
      }
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('message', { from: sender.id, text });
      } else {
        console.log('Recipient not online, message stored for later delivery.');
      }
      // Also emit to sender (so both see the message)
      socket.emit('message', { from: sender.id, text });
    });

    socket.on('disconnect', () => {
      delete users[socket.id];
      io.emit('userList', Object.values(users));
    });
  });
};
