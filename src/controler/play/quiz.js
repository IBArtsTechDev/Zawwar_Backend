import successResponse from "../../utlis/successResponse.js";
import quizControler from "../../services/play/quiz.js";
import asyncHandler from "../../middleware/async.js";
import SuccessResponse from "../../utlis/successResponse.js";

const createQUiz =asyncHandler(async(req,res)=>{
    const result = await quizControler.createQUiz(req.body,req.files);
    res.successResponse = new successResponse("Quiz created successfully", 200, result);
})

const createQuestion = asyncHandler(async(req,res)=>{
    const result = await quizControler.createQuestion(req.body,req.file);
    console.log(req.file,req.body)
    res.successResponse = new successResponse("Question created successfully", 200 , result)
})
const fetchadminQuizzes = asyncHandler(async(req,res)=>{
    const result = await quizControler.fetchadminQuizzes();
    res.successResponse = new successResponse("admin quizzes fetched auccessfully",200,result)
})
const fetchuserquiz = asyncHandler(async(req,res)=>{
    console.log("request come in controller");
    
    const result = await quizControler.fetchuserquiz();
    console.log(result);
    res.successResponse = new SuccessResponse('Quizzes fetched successfully',200,result);
})

const fetchQuizzes = asyncHandler(async(req,res)=>{
    const result = await quizControler.fetchQuizzes();
    res.successResponse = new successResponse("Available Quizzes", 200 , result)
})

const playQUiz = asyncHandler(async(req,res)=>{
    const result = await quizControler.playQUiz(req.query)
    res.successResponse = new successResponse("Question fetched successfully", 200 , result)
})

const saveProgress = asyncHandler(async(req,res)=>{
    const result = await quizControler.saveProgress(req.query);
    res.successResponse = new successResponse("Progress completetd",200,result);
})

const deleteQuiz = asyncHandler(async(req,res)=>{
    const result = await quizControler.deleteQuiz(req.query);
    res.successResponse = new successResponse("Quiz deleted Successfully",200,result);
})

const updateQuestion = asyncHandler(async(req,res)=>{
    console.log(req.file)
    const result = await quizControler.updateQuestion(req.query,req.body,req.file);
    res.successResponse = new successResponse('Question Edited Successfully',200,result);
})

const deleteQuestion = asyncHandler(async(req,res)=>{
    const result = await quizControler.deleteQuestion(req.query);
    res.successResponse = new successResponse("Question deleted Successfully",200,result);
})

const fetchQuestions = asyncHandler(async(req,res)=>{
    const result = await quizControler.fetchQuestions(req.query);
    res.successResponse = new successResponse("Questions fetched successflly",200,result);
})

const useOptions = asyncHandler(async(req,res)=>{
    const result = await quizControler.useOptions(req.query);
    res.successResponse = new successResponse("Progress updated",200,result);
});

const updateQuiz = asyncHandler(async(req,res)=>{
    const result = await quizControler.updateQuiz(req.query,req.body,req.file);
    res.successResponse = new successResponse("Quiz Updated",200,result)
});

const dailyChallenge = asyncHandler(async(req,res)=>{
    const result = await quizControler.dailyChallenge(req.query);
    res.successResponse = new successResponse("Questions for Daily chalange",200,result)
})

const quizAnswer = asyncHandler(async(req,res)=>{
    const result = await quizControler.quizAnswer(req.body);
    res.successResponse = new successResponse("Answer saved successfully",200,result)
})

const fetchadminquestions = asyncHandler(async(req,res)=>{
    const result = await quizControler.fetchadminquestions(req.query)
    res.successResponse = new successResponse('admin questions fetch successfully',200,result);
})

const fetchWordSearchDetails = asyncHandler(async(req,res)=>{
    const result = await quizControler.fetchWordSearchDetails(req.query);
    res.successResponse = new successResponse('Word search details fetched successfully',200,result);
})

const createQuestionFromExcel = asyncHandler(async(req,res)=>{
    const result = await quizControler.createQuestionFromExcel(req.file,req.body);
    res.successResponse = new successResponse("questions created successfully",200, result);
})

export default {
    createQuestionFromExcel,
    fetchWordSearchDetails,
    fetchadminquestions,
    quizAnswer,
    dailyChallenge,
    updateQuiz,
    useOptions,
    fetchQuestions,
    updateQuestion,
    deleteQuestion,
    saveProgress,
    createQUiz,
    createQuestion,
    playQUiz,
    fetchQuizzes,
    fetchuserquiz,
    deleteQuiz,
    fetchadminQuizzes
    
};;