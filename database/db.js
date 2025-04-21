const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://nintupunnoose:nintu@cluster0.y2zmw5s.mongodb.net/medical?retryWrites=true&w=majority&appName=Cluster0');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

module.exports = db;