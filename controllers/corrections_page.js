
const correctionsModel = require('../models/correctionsModel.js');
const t5Model = require('../models/t5Model.js');
const asyncHandler = require("express-async-handler");
exports.correctionsPage = asyncHandler(async (req, res, next) =>{
    // const text = 'When Internet hunting was introduced in 2005, allowing people to hunt over the Internet using remotely controlled guns, the practice was widely criticised by hunters as violating the principles of fair chase. As a representative of the National Rifle Association (NRA) explained, "The NRA has always maintained that fair chase, being in the field with your firearm or bow, is an important element of hunting tradition. Sitting at your desk in front of your computer, clicking at a mouse, has nothing to do with hunting.';
    // const correct_text = await t5Model.garmmar_correction('Generate multiple choice question:'+text);
    // console.log(correct_text);
    // await t5Model.garmmar_correction('Answer the following question.'+text+correct_text['text']);
    
    res.render('corrections_page', { title: 'Corrections'});
});

exports.correct = asyncHandler(async (req, res, next) =>{
    const text = req.body['text'];
    const correct_text = await correctionsModel.garmmar_correction(text);
    return res.send(correct_text);
});