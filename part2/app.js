const express = require('express');
const path = require('path');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('dotenv').config();

const app = express();

var dbConnectionPool = mysql.createPool({
  host: 'localhost',
  database: 'library'
});

const connection = mysql.createConnection({
  host: 'localhost',
  database: 'library'
});
connection.connect((err) => {
  if(err) {
    console.log('Error connecting to database: ', err);
    return;
  }
  console.log('Connected to mysql database');
});

app.use(function(req, res, next){
  req.pool = dbConnectionPool;
  next();
});

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use(session({
  secret: 'hello',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use('/', walkRoutes);
app.use('/users', userRoutes);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Export the app instead of listening here
module.exports = app;
