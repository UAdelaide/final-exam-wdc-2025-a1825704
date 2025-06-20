var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');

var app = express();

const connection = mysql.createConnection({
  host: 'localhost',
  database: 'DogWalkService'
});
connection.connect((err) => {
  if(err) {
    console.log('Error connecting to database: ', err);
    return;
  }
  console.log('Connected to mysql database');
});

let db;

(async () => {
    try {
        // Database connection
    db = await mysql.createConnection({
        host: 'localhost',
        database: 'DogWalkService'
    });

    // Insert users into Users
    const [rows] = await db.execute('SELECT COUNT(*) AS count FROM Users');
    if(rows[0].count)
    } catch (err) {
         console.error('Error populating database.', err);
    }
})();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(function(req, res, next){
  req.pool = dbConnectionPool;
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/', apiRouter);

module.exports = app;
