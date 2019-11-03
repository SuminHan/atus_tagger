const mongoose = require('mongoose');
//mongoose.connect('mongodb://smhanlab.com/atus_tagger', {useNewUrlParser: true});
mongoose.connect('mongodb://localhost/atus_tagger', {useNewUrlParser: true});
var conn      = mongoose.createConnection('mongodb://localhost/atus_tagger');
const User = conn.model('users', { id: {type: String, index: { unique: true }}, 
  name: String, gender: String, age: Number, date: Date, user_language: String, docs: [], idx: Number });

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
	User.findOne({ 'id': req.session.user_id }, function (err, user_doc){
		if (err) res.redirect('/');
		else if (!user_doc) res.redirect('/');
		else {
		  	user_doc.user_language = req.session.user_language;
		  	user_doc.docs = req.session.docs;
		  	user_doc.idx = req.session.idx;

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
  }
});

/* GET users listing. */
router.post('/login', function(req, res, next) {
  User.findOne({ 'id': req.body.user_id }, function (err, user_doc){
  	if (err) res.redirect('/');
  	else if (!user_doc) res.redirect('/');
  	else {
	  	console.log('user_doc', user_doc);
	  	req.session.user_id = user_doc.id;
	  	if (!user_doc.user_language) req.session.user_language = 'kr';
	  	else req.session.user_language = user_doc.user_language;
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
