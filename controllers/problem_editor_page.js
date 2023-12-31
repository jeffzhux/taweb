
const question = require('../models/question');
const questionAnswerModel = require('../models/questionAnswerModel.js');
const asyncHandler = require("express-async-handler");
exports.problemPage = asyncHandler(async (req, res, next) =>{
    res.render('problem_editor_page', { title: 'Problem Editor'});
});
exports.generateQuestion = asyncHandler(async (req, res, next) =>{
    // question Type
    // Open question : 1
    // Multiple choice : 2
    
    // const passage = "There is a very active tradition of hunting of small to medium-sized wild game in Trinidad and Tobago.Hunting is carried out with firearms, and aided by the use of hounds, with the illegal use of trap guns, trap cages and snare nets.With approximately 12,000 sport hunters applying for hunting licences in recent years (in a very small country of about the size of the state of Delaware at about 5128 square kilometers and 1.3 million inhabitants), there is some concern that the practice might not be sustainable. In addition there are at present no bag limits and the open season is comparatively very long (5 months - October to February inclusive). As such hunting pressure from legal hunters is very high. Added to that, there is a thriving and very lucrative black market for poached wild game (sold and enthusiastically purchased as expensive luxury delicacies) and the numbers of commercial poachers in operation is unknown but presumed to be fairly high. As a result, the populations of the five major mammalian game species (red-rumped agouti, lowland paca, nine-banded armadillo, collared peccary, and red brocket deer) are thought to be quite low (although scientifically conducted population studies are only just recently being conducted as of 2013). It appears that the red brocket deer population has been extirpated on Tobago as a result of over-hunting. Various herons, ducks, doves, the green iguana, the gold tegu, the spectacled caiman and the common opossum are also commonly hunted and poached. There is also some poaching of 'fully protected species', including red howler monkeys and capuchin monkeys, southern tamanduas, Brazilian porcupines, yellow-footed tortoises, Trinidad piping guans and even one of the national birds, the scarlet ibis."
    const passage = req.body['passage'];
    const questionType = req.body['questionType']; // questionType
    if(passage != undefined && passage != ""){
        const generation_response = await questionAnswerModel.open_question_generation(passage);
        if(questionType == 2)
        {
            //Multiple choice
        }
        return res.send(generation_response);
    }
    else{
        return res.send({question:"", answer:""});
    }
});
