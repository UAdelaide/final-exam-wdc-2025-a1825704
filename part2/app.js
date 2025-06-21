const express = require('express');
const path = require('path');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var engines = require('consolidate');

require('dotenv').config();

const app = express();

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');
var apiRouter = require('./routes/api');

app.use(session({
  secret: 'hello',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use('/', walkRoutes);
app.use('/users', userRoutes);
app.use('/api', apiRouter);

app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', engines.mustache);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Export the app instead of listening here
module.exports = app;
