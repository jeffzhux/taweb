var express = require('express');

const problemEditorController = require('../controllers/problem_editor');

var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/problem_editor');
  // res.render('index', { title: 'Express' });
});

router.get('/problem_editor', problemEditorController.problemList)

// router.get('/correction')
module.exports = router;
