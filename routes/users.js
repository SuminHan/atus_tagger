const mongoose = require('mongoose');
mongoose.connect('mongodb://smhanlab.com/atus_tagger', {useNewUrlParser: true});
const User = mongoose.model('users', { id: String, name: String, gender: String, age: Number, date: Date });

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET users listing. */
router.post('/register', function(req, res, next) {
  console.log(req.body);
  res.redirect('/atus_manual');
});

module.exports = router;
