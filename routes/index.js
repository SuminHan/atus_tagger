var express = require('express');
var router = express.Router();
var atus_kr = require("../public/atus_activity_definition_kr.json");
var atus_kr_str = JSON.stringify(atus_kr);
var atus_en = require("../public/atus_activity_definition.json");
var atus_en_str = JSON.stringify(atus_en);
var atus_weight = ['image', 'image_text', 'text'];

var atus_kr_obj = {}; for (var k in atus_kr){ atus_kr_obj[atus_kr[k].code] = atus_kr[k].category; }
var atus_en_obj = {}; for (var k in atus_en){ atus_en_obj[atus_en[k].code] = atus_en[k].category; }

const block_size = 100;
const total_posts = 967598;

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/atus_tagger', {useNewUrlParser: true});
var conn      = mongoose.createConnection('mongodb://localhost/atus_tagger');
//mongoose.connect('mongodb://smhanlab.com/atus_tagger', {useNewUrlParser: true});
const History = conn.model('history', 
  {'unique_id': {type: String, index: { unique: true }}, 
   'user_id': String, 'shortcode': String, 'category': String, 
   'weight': String, 'date': Date, 'mydoc': Object});
const User = conn.model('users', 
  { id: {type: String, index: { unique: true }}, 
    'name': String, 'gender': String, 'age': Number, 
    'date': Date, 'user_language': String, 'group': Number,
    'count': Number, 'stage': Number });
const Post = conn.model('posts', 
  { 'local_id': Number, 'shortcode': String, 'caption': String,
    'count': Number, 'loc_id': Number, '0': String,
    'category': Object, 'group': Number, 'stage': Number});

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.user_id == 'wkdthtjd') res.redirect('/users');
  else if(!!req.session.user_id){
    if (req.session.user_language == 'kr')
      res.redirect('/kr/atus_tagger');
    else if (req.session.user_language == 'en')
      res.redirect('/en/atus_tagger');
  }
  else{
    res.render('index', { title: 'ATUS Tagger' });
  }
});

router.get('/register', function(req, res, next) {
  if(!req.session.user_id){
    res.render('register');
  }
  else{
    res.redirect('/');
  }
});



/* ATUS Manual */
router.get('/atus_manual', function(req, res, next) {
  if(!req.session.user_language) req.session.user_language = 'kr';
  if(req.session.user_language == 'kr') res.redirect('/kr/atus_manual');
  if(req.session.user_language == 'en') res.redirect('/en/atus_manual');
});

router.get('/:lang/atus_manual', function(req, res, next) {
  const lang = req.params.lang;
  var another;
  if (lang == 'kr') another = 'en';
  else if (lang == 'en') another = 'kr';
  if(req.session.user_language != lang) req.session.user_language = another;
  //res.render('atus_manual', { 'atus_definition': atus_definition});
  if (lang == 'kr'){
    res.render('atus_manual', {'atus': atus_kr_str, 
    	'title': '안내서',
    	'warning': '카테고리가 헷갈릴 수 있으니 꼭 한번 읽어보시고 시작해주세요.',
      'atus_language': {'url': '/en/atus_manual', 'text': 'English Site'}});
  }
  else if (lang == 'en'){
    res.render('atus_manual', {'atus': atus_en_str, 
      'title': 'Introduction',
      'warning': 'Please check the category to avoid confusion.',
      'atus_language': {'url': '/kr/atus_manual', 'text': '한국어로 보기'}});
  }
});


/* ATUS Tagger */
router.get('/atus_tagger', function(req, res, next) {
  if(!req.session.user_language) req.session.user_language = 'kr';
  if(req.session.user_language == 'kr') res.redirect('/kr/atus_tagger');
  if(req.session.user_language == 'en') res.redirect('/en/atus_tagger');
});

router.get('/atus_tagger/:shortcode', function(req, res, next) {
  if (!req.session.user_id) res.redirect('/');
  else{
    Post.findOne({'shortcode': req.params.shortcode}, function(err, mydoc){
      //if (!req.session.docs) req.session.docs = [];
      if (!mydoc){
        req.session.docs = [];
        res.redirect('/atus_tagger_big');
      }
      else{
        mydoc.category = null;
        req.session.docs = [];
        req.session.docs.unshift(mydoc);
        res.redirect('/atus_tagger');
      }
    });
  }
});

router.get('/atus_tagger_big', function(req, res){
  req.session.docs = null;
  if (!req.session.user_id) res.redirect('/');
  else{
    User.findOne({'id': req.session.user_id}, function(err, user_doc){
      req.session.group = user_doc.group;
      req.session.stage = user_doc.stage;
      Post.find({'group': user_doc.group, 'stage': user_doc.stage})
      .sort([['local_id', 1]])
      .exec(function (err, docs){
        if (err) res.send('Mongo Error');
        else if (!docs || docs.length == 0){
          res.send('Docs Empty Error');
        }
        else {
          req.session.docs = docs;
          while(req.session.docs.length > 0 &&
                !!req.session.docs[0].category &&
                !!req.session.docs[0].category[req.session.user_id]){
            req.session.docs.shift();
          }

          if (req.session.docs.length == 0){
            user_doc.stage += 1;
            user_doc.markModified('stage');
            user_doc.save();
            res.redirect('/atus_tagger_big');
          }
          else {
            res.redirect('/atus_tagger');
          }
        }
      });
    });
  }
});


router.get('/:lang/atus_tagger', function(req, res, next) {
  const lang = req.params.lang;
  req.session.user_language = lang;
  var another;
  if (lang == 'kr') another = 'en';
  else if (lang == 'en') another = 'kr';

  if(!req.session.user_id) res.redirect('/');
  else if(!req.session.docs || req.session.docs.length == 0){
    res.redirect('/atus_tagger_big');
  }
  else {
    console.log('length of current session.doc', req.session.docs.length);
    User.findOne({'id': req.session.user_id}, function(err, user_doc){
      if (req.session.group != user_doc.group || req.session.stage != user_doc.stage){
	    res.redirect('/atus_tagger_big');
	  }
      else{
        while(req.session.docs.length > 0 &&
              !!req.session.docs[0].category &&
              !!req.session.docs[0].category[req.session.user_id]){
          req.session.docs.shift();
        }
        
        if (req.session.docs.length == 0) res.redirect('/atus_tagger_big');
        else{
          var mydoc = req.session.docs[0];
          if (lang == 'kr'){
            res.render('atus_tagger', {'atus': atus_kr_str, 
              'img_shortcode': mydoc['shortcode'],
              'img_url': mydoc['0'],
              'img_caption': mydoc['caption'],
              'local_id': mydoc['local_id'],
              'atus_manual': {'url': '/kr/atus_manual', 'text': 'ATUS 매뉴얼'},
              'atus_language': {'url': '/en/atus_tagger', 'text': 'English Site'},
              'atus_weight': atus_weight, 'count': req.session.count,
              'group': req.session.group, 'stage': req.session.stage,
              'idonno': '모르겠음'});
          }
          else {
            res.render('atus_tagger', {'atus': atus_en_str,
              'img_shortcode': mydoc['shortcode'],
              'img_url': mydoc['0'],
              'img_caption': mydoc['caption'],
              'local_id': mydoc['local_id'],
              'atus_manual': {'url': '/en/atus_manual', 'text': 'ATUS Manual'},
              'atus_language': {'url': '/kr/atus_tagger', 'text': '한국어로 보기'},
              'atus_weight': atus_weight, 'count': req.session.count,
              'group': req.session.group, 'stage': req.session.stage,
              'idonno': 'I Don\'t Know'});
          }
        }
      }
    });
  }
});
/*
router.get('/en/atus_tagger', function(req, res, next) {
  if(!req.session.user_id) res.redirect('/');
  else {
    if(req.session.user_language != 'en') req.session.user_language = 'en';
    //res.render('atus_manual', { 'atus_definition': atus_definition});
    res.render('atus_tagger', {'atus': atus_en_str,
      'img_shortcode': '',
      'img_url': '',
      'img_caption': '',
      'atus_manual': {'url': '/en/atus_manual', 'text': 'ATUS Manual'},
      'atus_language': {'url': '/kr/atus_tagger', 'text': '한국어로 보기'}});
  }
});
*/

/* GET users listing. */
router.post('/tagging', function(req, res, next) {
  if (!req.session.user_id) res.redirect('/');
  else{
    var shortcode = req.body.shortcode;
    var category = req.body.category;
    var weight = req.body.weight;
    var user_id = req.session.user_id;
  
    var mydoc = req.session.docs[0];
    mydoc.category = null;
  
    var unique_id = user_id+':'+shortcode;
  
	Post.findOne({ 'shortcode': shortcode }, function (err, doc){
			if (!doc.category || doc.category == []) doc.category = {};
			doc.category[user_id] = {'category': category, 'weight': weight};
			doc.markModified('category');
			doc.save();
			req.session.docs.shift();
			req.session.mydoc = null;
			History.update({'unique_id': unique_id}, 
					{'$set': {'user_id': user_id, 'shortcode': shortcode,
					'category': category, 'weight': weight,
					'date': new Date(), 'mydoc': doc}}, 
					{upsert: true, setDefaultsOnInsert: true})
			.exec(() => {
					History.count({'user_id': user_id}).exec((err, hcount) => {
							User.findOne({'id': user_id}, function(err, user_doc){
									req.session.count = hcount;
									user_doc.count = hcount;
									user_doc.markModified('count');
									user_doc.save();
									res.send('success');
									});
							});
					});
	});
  }
});

/* ATUS Tagger */
router.get('/history', function(req, res, next) {
  if (!!req.session.user_id){
    History.find({'user_id': req.session.user_id})
    .sort({'date': -1})
    .limit(100)
    .exec(function(err, docs){
      if (req.session.user_language == 'en')
        res.render('history', {'title': 'History', 'count': req.session.count,
             'history': JSON.stringify(docs), 'atus': atus_en_obj});
      else
        res.render('history', {'title': 'History', 'count': req.session.count,
             'history': JSON.stringify(docs), 'atus': atus_kr_obj});
    });
  }
  else{
    res.redirect('/');
  }
});

router.get('/allhistory', function(req, res, next) {
  if (!!req.session.user_id){
    History.find({})
    .sort({'date': -1})
    .limit(1000)
    .exec(function(err, docs){
       if (req.session.user_language == 'en')
         res.render('history', {'title': 'All History', 
             'history': JSON.stringify(docs), 'atus': atus_en_obj});
       else
         res.render('history', {'title': 'All History',
             'history': JSON.stringify(docs), 'atus': atus_kr_obj});
    });
  }
  else{
    res.redirect('/');
  }
});


module.exports = router;
