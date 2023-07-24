var express = require('express');

const problemEditorController = require('../controllers/problem_editor');
const problemEditorPageController = require('../controllers/problem_editor_page');
const correctionsPageController = require('../controllers/corrections_page');
const roomController = require('../controllers/room');

var router = express.Router();

router.get('/', function(req, res, next) {
  res.redirect('/problem_editor');
});

/* problem editor */
router.get('/problem_editor', problemEditorController.problemList);

/* problem_editor_page */
router.get('/problem_editor_page', problemEditorPageController.problemPage);
router.post('/problem_editor_page/generate', problemEditorPageController.generateQuestion);

/* corrections */

/* corrections_page */
router.get('/corrections_page', correctionsPageController.correctionsPage);
router.post('/corrections_page/correct', correctionsPageController.correct);

/* room */
router.get('/room', roomController.RoomPage);

module.exports = router;
