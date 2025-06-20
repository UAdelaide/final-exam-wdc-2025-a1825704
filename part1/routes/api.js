var express = require('express');
var router = express.Router();

router.get('/api/dogs', function(req, res, next) {
const pool = req.pool;

try {
    pool.query('SELECT * FROM Dogs', (err, results) => {

        const dog = {
            dog_name: results[0].name,
            size: results[0].size,
            owner_username:
        }
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
