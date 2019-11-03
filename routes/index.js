var express = require('express');
var router = express.Router();
var atus_kr = require("../public/atus_activity_definition_kr.json");
var atus_kr_str = JSON.stringify(atus_kr);
var atus_en = require("../public/atus_activity_definition.json");
var atus_en_str = JSON.stringify(atus_en);

const mongoose = require('mongoose');
//mongoose.connect('mongodb://smhanlab.com/atus_tagger', {useNewUrlParser: true});
mongoose.connect('mongodb://localhost/atus_tagger', {useNewUrlParser: true});
const Post = mongoose.model('posts', 
  { 'local_id': Number,
    'shortcode': String,
    'caption': String,
    'count': Number,
    'loc_id': Number, 
    '0': String,
    'category': []});


/* GET home page. */
router.get('/', function(req, res, next) {
  if(!!req.session.user_id){
    if (req.session.user_language == 'kr')
      res.redirect('/kr/atus_tagger');
    if (req.session.user_language == 'en')
      res.redirect('/en/atus_tagger');
  }
  res.render('index', { title: 'ATUS Tagger' });
});

router.get('/register', function(req, res, next) {
  res.render('register');
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

router.get('/:lang/atus_tagger', function(req, res, next) {
  const lang = req.params.lang;
  var another;
  if (lang == 'kr') another = 'en';
  else if (lang == 'en') another = 'kr';

  if(!req.session.user_id) res.redirect('/');
  else {
    if(req.session.user_language != lang) req.session.user_language = another;
    //res.render('atus_manual', { 'atus_definition': atus_definition});
    //Post.find({'local_id': {'$gte': 1, '$lte': 10}}, function (err, docs){
    Post.find({'loc_id': 252559728}, function (err, docs){
      if (err) res.send('Mongo Error');
      else if (!docs) res.send('Docs Empty Error');
      else {
        //console.log('data', data);
        //req.session.user_id = data.id;
        //if (!data.user_language) req.session.user_language = 'kr';
        //else req.session.user_language = data.user_language;
        //res.redirect('/');
        //console.log('docs', docs);

        var mydoc;
        for (var i in docs){
          if (docs[i].category.length == 0){
            mydoc = docs[i];
            break;
          }
        }

        if (lang == 'kr'){
          res.render('atus_tagger', {'atus': atus_kr_str, 
            'img_shortcode': mydoc['shortcode'],
            'img_url': mydoc['0'],
            'img_caption': mydoc['caption'],
            'atus_manual': {'url': '/kr/atus_manual', 'text': 'ATUS 매뉴얼'},
            'atus_language': {'url': '/en/atus_tagger', 'text': 'English Site'}});
        }
        else {
          res.render('atus_tagger', {'atus': atus_en_str,
            'img_shortcode': mydoc['shortcode'],
            'img_url': mydoc['0'],
            'img_caption': mydoc['caption'],
            'atus_manual': {'url': '/en/atus_manual', 'text': 'ATUS Manual'},
            'atus_language': {'url': '/kr/atus_tagger', 'text': '한국어로 보기'}});
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
  var shortcode = req.body.shortcode;
  var category = req.body.category;
  var user_id = req.session.user_id;
  console.log(user_id, shortcode, category);

  Post.findOne({ 'shortcode': shortcode }, function (err, doc){
    if (!doc.category) doc.category = [];
    console.log(user_id, shortcode, category);

    doc.category.push({'user_id': user_id, 'category': category});
    doc.save();
    console.log('doc', doc);
    res.send('success');
  });
});

module.exports = router;
