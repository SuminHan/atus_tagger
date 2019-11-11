const mongoose = require('mongoose');
//mongoose.connect('mongodb://smhanlab.com/atus_tagger', {useNewUrlParser: true});
mongoose.connect('mongodb://localhost/atus_tagger', {useNewUrlParser: true});
var conn      = mongoose.createConnection('mongodb://localhost/atus_tagger');
const User = conn.model('users', { id: {type: String, index: { unique: true }}, 
                        'name': String, 'gender': String, 'age': Number, 
                        'date': Date, 'user_language': String, 'group': Number,
                        'count': Number, 'stage': Number });

var express = require('express');
var router = express.Router();
//var bodyParser = require('body-parser');
//router.use(bodyParser());

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (req.session.user_id == 'wkdthtjd'){
    User.find({}).sort([['date', -1]]).exec(function (err, user_docs){
      res.render('userlist', {userlist: JSON.stringify(user_docs)});
    });
  }
  else res.redirect('/');
});

/* GET users listing. */
router.post('/logout', function(req, res, next) {
  if (req.session.user_id == 'wkdthtjd'){
    req.session.destroy(function(err) {
      if(err) {
        res.send('error');
      } else {
        res.send('success');
      }
    });
  }
  else if (req.session) {
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
router.get('/login', function(req, res, next) {
  res.redirect('/');
});

/* GET users listing. */
router.post('/login', function(req, res, next) {
  if (req.body.user_id == 'wkdthtjd'){
    req.session.user_id = 'wkdthtjd';
    res.redirect('/users');
  }
  else {
    User.findOne({ 'id': req.body.user_id }, function (err, user_doc){
      if (err) res.redirect('/');
      else if (!user_doc) res.redirect('/');
      else {
        console.log('user_doc', user_doc);
        req.session.user_id = user_doc.id;
        req.session.group = user_doc.group;
        req.session.stage = user_doc.stage;
        req.session.count = user_doc.count;
        if (!user_doc.user_language) req.session.user_language = 'kr';
        else req.session.user_language = user_doc.user_language;
        res.redirect('/');
      }
    });
  }
});

/* GET users listing. */
router.post('/register', function(req, res, next) {
  if(req.session.user_id) res.redirect('/');
  else{
  User.find({}).exec((err, docs) => {
    var i = 0;
    for (;i < 20; i++){
	  var group3 = 3;
      for (var j in docs){
	    if (docs[j].group == i){
		  group3 -= 1;
		}
	  }
	  if (group3 > 0) break;
	}

    var user = new User(req.body);
    user.date = new Date();
    user.count = 0;
    user.stage = 0;
    user.group = i;
    user.member = 0;
    req.session.user_id = user.id;
    req.session.user_language = 'kr';
    req.session.docs = null;
    user.save()
      .then(() => res.redirect('/atus_manual'))
      .catch((error) => res.render('register', {'msg': 'ID 중복(duplication)'}));
  });
  }
});

/* GET users listing. */
router.post('/save', function(req, res, next) {
  if (req.session.user_id == 'wkdthtjd'){
    User.find({}).exec(function (err, user_docs){
      for (var i in user_docs){
        user_docs[i].group = req.body['group.'+user_docs[i].id];
        user_docs[i].stage = req.body['stage.'+user_docs[i].id];
        user_docs[i].save();
      }
      res.redirect('/users');
    });
  }
});


module.exports = router;
