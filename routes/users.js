const mongoose = require('mongoose');
//mongoose.connect('mongodb://smhanlab.com/atus_tagger', {useNewUrlParser: true});
mongoose.connect('mongodb://localhost/atus_tagger', {useNewUrlParser: true});
const User = mongoose.model('users', { id: {type: String, index: { unique: true }}, name: String, gender: String, age: Number, date: Date });

var express = require('express');
var router = express.Router();
//var bodyParser = require('body-parser');
//router.use(bodyParser());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET users listing. */
router.post('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
  		res.send('error');
      } else {
      	res.send('success');
      }
    });
  }
});

/* GET users listing. */
router.post('/login', function(req, res, next) {
  User.findOne({ 'id': req.body.user_id }, function (err, docs){
  	if (err) res.redirect('/');
  	else if (!docs) res.redirect('/');
  	else {
	  	console.log('docs', docs);
	  	req.session.user_id = docs.id;
	  	if (!docs.user_language) req.session.user_language = 'kr';
	  	else req.session.user_language = docs.user_language;
	  	res.redirect('/');
	}
  });
});

/* GET users listing. */
router.post('/register', function(req, res, next) {
  var user = new User(req.body);
  user.date = new Date();
  user.save()
      .then(() => res.redirect('/'))
      .catch((error) => res.render('register', {'msg': 'ID 중복(duplication)'}));
});


module.exports = router;
