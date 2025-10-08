
// const User = require('../models/User');
// const Message = require('../models/Message');

// module.exports = (io) => {
//   let users = {}; // { socketId: { id, username } }

//   io.on('connection', (socket) => {
//     socket.on('join', async (userId) => {
//       // Get username from DB
//       let username = userId;
//       try {
//         const user = await User.findById(userId);
//         if (user) username = user.username;
//       } catch {}
//       users[socket.id] = { id: userId, username };
//       // Emit userList as array of { id, username }
//       io.emit('userList', Object.values(users));

//       // Deliver pending messages
//       try {
//         const pendingMessages = await Message.find({ to: userId, delivered: false }).populate('from');
//         for (const msg of pendingMessages) {
//           socket.emit('message', { from: msg.from._id, text: msg.text });
//           msg.delivered = true;
//           await msg.save();
//         }
//       } catch (err) {
//         console.error('Error delivering pending messages:', err);
//       }
//     });

//     socket.on('message', async ({ to, text }) => {
//       // Find sender
//       let sender = users[socket.id];
//       if (!sender) {
//         socket.emit('error', { message: 'Sender not found. Please join before sending messages.' });
//         console.log('Sender not found for socket:', socket.id);
//         return;
//       }

//       // Save message to DB
//       try {
//         await Message.create({ from: sender.id, to, text });
//       } catch (err) {
//         console.error('Error saving message:', err);
//         socket.emit('error', { message: 'Failed to send message.' });
//         return;
//       }

//       let recipientSocketId = null;
//       for (let [id, user] of Object.entries(users)) {
//         if (user.id === to) {
//           recipientSocketId = id;
//           break;
//         }
//       }
//       if (recipientSocketId) {
//         io.to(recipientSocketId).emit('message', { from: sender.id, text });
//       } else {
//         console.log('Recipient not online, message stored for later delivery.');
//       }
//       // Also emit to sender (so both see the message)
//       socket.emit('message', { from: sender.id, text });
//     });

//     socket.on('disconnect', () => {
//       delete users[socket.id];
//       io.emit('userList', Object.values(users));
//     });
//   });
// };





const User = require('../models/User');
const Message = require('../models/Message');

module.exports = (io) => {
  let users = {}; // { socketId: { id, username } }

  io.on('connection', (socket) => {
    console.log('⚡ New socket connected:', socket.id);

    socket.on('join', async (userId) => {
      try {
        // Get username from DB
        let username = userId;
        const user = await User.findById(userId);
        if (user) username = user.username;

        // Store mapping for reference (not strictly needed now)
        users[socket.id] = { id: userId, username };

        // ✅ Join room using userId (important change)
        socket.join(userId);

        console.log(`✅ User joined: ${username} (${userId})`);

        // Emit updated user list
        io.emit('userList', Object.values(users));

        // ✅ Deliver any pending messages
        const pendingMessages = await Message.find({ to: userId, delivered: false }).populate('from');
        for (const msg of pendingMessages) {
          socket.emit('message', { from: msg.from._id, text: msg.text });
          msg.delivered = true;
          await msg.save();
        }

      } catch (err) {
        console.error('❌ Error in join event:', err);
      }
    });

    // ✅ Handle message sending
    socket.on('message', async ({ to, text }) => {
      const sender = users[socket.id];
      if (!sender) {
        socket.emit('error', { message: 'Sender not found. Please join before sending messages.' });
        console.log('Sender not found for socket:', socket.id);
        return;
      }

      try {
        // Save message in DB
        const savedMsg = await Message.create({ from: sender.id, to, text });

        // Send full message object to receiver room
        io.to(to).emit('message', savedMsg);

        // Send full message object to sender as well
        io.to(sender.id).emit('message', savedMsg);

      } catch (err) {
        console.error('❌ Error saving/sending message:', err);
        socket.emit('error', { message: 'Failed to send message.' });
      }
    });

    // ✅ Handle message deletion (from both sides)
    socket.on('deleteMessage', async ({ messageId }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) {
          socket.emit('error', { message: 'Message not found.' });
          return;
        }
        // Only sender or receiver can delete
        const user = users[socket.id];
        if (!user || (String(msg.from) !== String(user.id) && String(msg.to) !== String(user.id))) {
          socket.emit('error', { message: 'Unauthorized to delete this message.' });
          return;
        }
        await Message.deleteOne({ _id: messageId });
        // Notify both users to remove message from UI
        io.to(msg.from.toString()).emit('messageDeleted', { messageId });
        io.to(msg.to.toString()).emit('messageDeleted', { messageId });
      } catch (err) {
        console.error('❌ Error deleting message:', err);
        socket.emit('error', { message: 'Failed to delete message.' });
      }
    });

    // ✅ Handle disconnect
    socket.on('disconnect', () => {
      console.log('🔌 User disconnected:', socket.id);
      delete users[socket.id];
      io.emit('userList', Object.values(users));
    });
  });
};
