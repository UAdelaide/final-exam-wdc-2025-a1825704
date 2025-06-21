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
const login = require('./routes/loginRoutes');

app.use('/', walkRoutes);
app.use('/users', userRoutes);
app.use('/login', loginRoutes);

// Export the app instead of listening here
module.exports = app;
