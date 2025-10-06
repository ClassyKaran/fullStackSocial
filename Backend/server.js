const { app, server } = require('./app');
const mongoose = require('mongoose');
const config = require('./config/db');

const PORT = process.env.PORT || 5000;

mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
