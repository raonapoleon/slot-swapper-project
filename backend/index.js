const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors'); // Import cors
require('dotenv').config();

connectDB();

const app = express();

// Setup CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));

app.use(express.json({ extended: false }));

const PORT = process.env.PORT || 5001;

app.get('/', (req, res) => {
  res.send('SlotSwapper API is running!');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/swap', require('./routes/swap'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});