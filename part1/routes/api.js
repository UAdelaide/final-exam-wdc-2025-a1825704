var express = require('express');
var router = express.Router();

router.get('/api/dogs', function(req, res, next) {
const pool = req.pool;

try {
    pool.query('SELECT Dogs.name, Dogs.size, Users.username FROM Dogs INNER JOIN ON Users.user_id = Dogs.owner_id', (err, results) => {
        res.json(results[0]);
    });
} catch(err) {
    res.status(500).send('Error retrieving data: ' + err);
}
});

router.get('/api/walkrequests/open', function(req, res, next) {

});

router.get('/api/walkers/summary', function(req, res, next) {

});

module.exports = router;
