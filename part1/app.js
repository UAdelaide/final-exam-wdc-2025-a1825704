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
    const [userRows] = await db.execute('SELECT COUNT(*) AS count FROM Users');
    if(userRows[0].count === 0) {
        await db.execute(`
            INSERT INTO Users (username, email, password_hash, role)
            VALUES
            ('alice123', 'alice@example.com', 'hashed123', 1),
            ('bobwalker', 'bob@example.com', 'hashed456', 2),
            ('carol123', 'carol@example.com', 'hashed789', 1),
            ('dandadan', 'dan@example.com', 'hashed091', 1),
            ('ianwalks', 'ian@example.com', 'hashed403', 2);`);
    }

    // Insert dogs into Dogs
    const [dogRows] = await db.execute('SELECT COUNT(*) AS count FROM Dogs');
    if(dogRows[0].count === 0) {
        await db.execute(`
            INSERT INTO Dogs (owner_id, name, size)
            VALUES
            ((SELECT user_id FROM Users WHERE username='alice123'), 'Max', 2),
            ((SELECT user_id FROM Users WHERE username='carol123'), 'Bella', 1),
            ((SELECT user_id FROM Users WHERE username='dandadan'), 'Penut', 3),`);
    }

    // Insert walk request into WalkRequests
    const [requestRows] = await db.execute(`
        INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
VALUES
((SELECT dog_id FROM Dogs WHERE name='Max'), '2025-06-10 08:00:00', 30, 'Parklands', 1),
((SELECT dog_id FROM Dogs WHERE name='Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 2),
((SELECT dog_id FROM Dogs WHERE name='Penut'), '2025-06-9 09:30:00', 60, 'Brighton Beach', 3),`);
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
