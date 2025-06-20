var express = require('express');
var router = express.Router();

router.get('/api/dogs', function(req, res, next) {
const pool = req.pool;

try {
    pool.query('SELECT * FROM Dogs', (err, results) => {

    });
} catch(err) {
    
}
});

router.get('/api/walkrequests/open', function(req, res, next) {

});

router.get('/api/walkers/summary', function(req, res, next) {

});

module.exports = router;
