
const correctionsModel = require('../models/correctionsModel.js');
const asyncHandler = require("express-async-handler");
exports.correctionsPage = asyncHandler(async (req, res, next) =>{
    res.render('corrections_page', { title: 'Corrections'});
});

exports.correct = asyncHandler(async (req, res, next) =>{
    const text = req.body['text'];
    const correct_text = await correctionsModel.garmmar_correction(text);
    return res.send(correct_text);
});