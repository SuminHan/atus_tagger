var express = require('express');
var router = express.Router();
var atus_kr = require("../public/atus_activity_definition_kr.json");
var atus_kr_str = JSON.stringify(atus_kr);
var atus_en = require("../public/atus_activity_definition.json");
var atus_en_str = JSON.stringify(atus_en);

var atus_kr_obj = {}; for (var k in atus_kr){ atus_kr_obj[atus_kr[k].code] = atus_kr[k].category; }
var atus_en_obj = {}; for (var k in atus_en){ atus_en_obj[atus_en[k].code] = atus_en[k].category; }

const block_size = 20;
const total_posts = 1300000;

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/atus_tagger', {useNewUrlParser: true});
var conn      = mongoose.createConnection('mongodb://localhost/atus_tagger');
//mongoose.connect('mongodb://smhanlab.com/atus_tagger', {useNewUrlParser: true});
const History = conn.model('history', 
  {'unique_id': {type: String, index: { unique: true }}, 'user_id': String, 'shortcode': String, 'category': String, 'date': Date, 'mydoc': Object});
const Post = conn.model('posts', 
  { 'local_id': Number,
    'shortcode': String,
    'caption': String,
    'count': Number,
    'loc_id': Number, 
    '0': String,
    'category': []});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


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

router.get('/atus_tagger/:shortcode', function(req, res, next) {
  Post.findOne({'shortcode': req.params.shortcode}, function(err, mydoc){
    if (!req.session.docs) req.session.docs = [];
    mydoc.category = null;
    req.session.docs.unshift(mydoc);
    req.session.idx = 0;

    if(!req.session.user_language) req.session.user_language = 'kr';
    if(req.session.user_language == 'kr') res.redirect('/kr/atus_tagger');
    if(req.session.user_language == 'en') res.redirect('/en/atus_tagger');
  });
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
    
    var random_idx = Math.floor(Math.random() * total_posts / block_size);
    var mydoc = null;
    if (!!req.session.docs){
      var docs = req.session.docs;
      //console.log('walwal');
      //console.log('docs', docs);
      console.log('dododoc', docs);
      for (var i = req.session.idx; i < block_size; i++){
        if (!docs[i] || !docs[i].category || docs[i].category.length == 0){
          mydoc = docs[i];
          req.session.idx = i;
          break;
        }
      }
      if (mydoc){
        console.log('mydoc', mydoc);
        if (lang == 'kr'){
          res.render('atus_tagger', {'atus': atus_kr_str, 
            'img_shortcode': mydoc['shortcode'],
            'img_url': mydoc['0'],
            'img_caption': mydoc['caption'],
            'atus_manual': {'url': '/kr/atus_manual', 'text': 'ATUS 매뉴얼'},
            'atus_language': {'url': '/en/atus_tagger', 'text': 'English Site'},
            'idonno': '모르겠음'});
        }
        else {
          res.render('atus_tagger', {'atus': atus_en_str,
            'img_shortcode': mydoc['shortcode'],
            'img_url': mydoc['0'],
            'img_caption': mydoc['caption'],
            'atus_manual': {'url': '/en/atus_manual', 'text': 'ATUS Manual'},
            'atus_language': {'url': '/kr/atus_tagger', 'text': '한국어로 보기'},
            'idonno': 'I Don\'t Know'});
        }
      }
    }
    if (!req.session.docs || !mydoc) {
      Post.find({'local_id': {'$gte': random_idx*block_size, 
                              '$lt': (random_idx+1)*block_size}}, function (err, docs){
        if (err) res.send('Mongo Error');
        else if (!docs) res.send('Docs Empty Error');
        else {
          console.log(docs.length, docs);
          shuffleArray(docs);
          req.session.docs = docs;
          
          for (var i = 0; i < docs.length; i+=1){
            if (!docs[i] || !docs[i].category || docs[i].category.length == 0){
              mydoc = docs[i];
              req.session.idx = i;
              break;
            }
          }

          console.log('mydoc', mydoc);

          if (lang == 'kr'){
            res.render('atus_tagger', {'atus': atus_kr_str, 
              'img_shortcode': mydoc['shortcode'],
              'img_url': mydoc['0'],
              'img_caption': mydoc['caption'],
              'atus_manual': {'url': '/kr/atus_manual', 'text': 'ATUS 매뉴얼'},
              'atus_language': {'url': '/en/atus_tagger', 'text': 'English Site'},
              'idonno': '모르겠음'});
          }
          else {
            res.render('atus_tagger', {'atus': atus_en_str,
              'img_shortcode': mydoc['shortcode'],
              'img_url': mydoc['0'],
              'img_caption': mydoc['caption'],
              'atus_manual': {'url': '/en/atus_manual', 'text': 'ATUS Manual'},
              'atus_language': {'url': '/kr/atus_tagger', 'text': '한국어로 보기'},
              'idonno': 'I Don\'t Know'});
          }
        }
      });
    }
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

  var mydoc = req.session.docs[req.session.idx];
  mydoc.category = null;

  var hdoc = new History({'unique_id': user_id+':'+shortcode,
                          'user_id': user_id, 'shortcode': shortcode,
                          'category': category, 'date': new Date(), 
                          'mydoc': mydoc});

  History.findOne({'unique_id':hdoc['unique_id']}, function(err, doc){
    if (!doc){
      hdoc.save()
      .then(() => {
        Post.findOne({ 'shortcode': shortcode }, function (err, doc){
          if (!doc.category) doc.category = [];
          console.log(user_id, shortcode, category);
          doc.save();
          //req.session.mydoc = null;
          req.session.docs[req.session.idx].category = 'done';
          req.session.idx += 1;
          res.send('success');
        });
      })
      .catch((error) => res.send('error')); 
    }
    else{
      doc.category = hdoc.category;
      doc.date = new Date();
      doc.save();
      req.session.docs[req.session.idx].category = 'done';
      req.session.idx += 1;
      res.send('success');
    }
  });
});

/* ATUS Tagger */
router.get('/history', function(req, res, next) {
  if (!!req.session.user_id){
    History.find({'user_id': req.session.user_id})
    .sort({'date': -1})
    .limit(100)
    .exec(function(err, docs){
      if (req.session.user_language == 'en')
        res.render('history', {'history': JSON.stringify(docs), 'atus': atus_en_obj});
      else
        res.render('history', {'history': JSON.stringify(docs), 'atus': atus_kr_obj});
    });
  }
  else{
    res.redirect('/');
  }
});

router.get('/allhistory', function(req, res, next) {
  History.find({})
  .sort({'date': -1})
  .limit(100)
  .exec(function(err, docs){
      if (req.session.user_language == 'en')
        res.render('history', {'history': JSON.stringify(docs), 'atus': atus_en_obj});
      else
        res.render('history', {'history': JSON.stringify(docs), 'atus': atus_kr_obj});
  });
});


module.exports = router;
