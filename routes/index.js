var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  req.session.user_id = 1234, // 아이디
  req.session.name = 'chris' // 이름
  res.render('index', { title: 'Express' });
});

router.get('/atus_manual', function(req, res, next) {
  res.render('atus_manual');
});

router.get('/register', function(req, res, next) {
  res.render('register');
});

module.exports = router;
