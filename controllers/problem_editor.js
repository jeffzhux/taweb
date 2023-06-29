
const question = require('../models/question')
// const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.problemList = asyncHandler(async (req, res, next) =>{
    const [allQuestion] = await question.fetchAll();
    res.render('problem_editor', { title: 'Problem Editor', questions:allQuestion });
});

