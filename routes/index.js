var express = require('express');

const problemEditorController = require('../controllers/problem_editor');
const problemEditorPageController = require('../controllers/problem_editor_page');

var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/problem_editor');
  // res.render('index', { title: 'Express' });
});
/* problem editor */
router.get('/problem_editor', problemEditorController.problemList)

/* problem_editor_page */
router.get('/problem_editor_page', problemEditorPageController.problemPage)
router.get('/problem_editor_page/generate', problemEditorPageController.problemPage)
router.post('/problem_editor_page/generate', problemEditorPageController.generateQuestion)

/* corrections */
router.get('/corections' )

module.exports = router;
