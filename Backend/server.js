const { app, server } = require('./app');
const mongoose = require('mongoose');
const config = require('./config/db');

const PORT = process.env.PORT || 5000;

mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    // attach an error handler so we can give a friendly message if the port is busy
    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the process using this port or set a different PORT in environment variables.`);
        // exit with a non-zero code so process managers know it failed
        process.exit(1);
      }
      console.error('Server error:', err);
      process.exit(1);
    });

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
