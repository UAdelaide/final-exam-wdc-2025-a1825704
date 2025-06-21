const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walk', walkRoutes);
app.use('/api/user', userRoutes);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Export the app instead of listening here
module.exports = app;
