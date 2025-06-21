var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');
var session = require('express-session');
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
app.use('/login', login);

// Export the app instead of listening here
module.exports = app;
