const asyncHandler = require("express-async-handler");

exports.RoomPage = asyncHandler(async (req, res, next) =>{
    
    res.render('room', { title: 'Room'});
});

exports.correct = asyncHandler(async (req, res, next) =>{
    return res.send(correct_text);
});