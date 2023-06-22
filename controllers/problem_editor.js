

const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.problemList = asyncHandler(async (req, res, next) =>{
    res.render('problem_editor', { title: 'Problem Editor' });
});