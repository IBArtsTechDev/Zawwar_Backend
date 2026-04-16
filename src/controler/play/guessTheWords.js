import asyncHandler from "../../middleware/async.js";
import wordservice from "../../services/play/guessTheWords.js";
import successResponse from "../../utlis/successResponse.js";

const createGuessWord = asyncHandler(async(req,res)=>{
    const result = await wordservice.createGuessWord(req.body,req.files);
    res.successResponse = new successResponse("gmae created successfully",200,result);
})

const updateGuessWord = asyncHandler(async(req,res)=>{
    const result  = await wordservice.updateGuessWord(req.body,req.files,req.query,);
    res.successResponse = new successResponse("game updated successfully",200,result);
})

const  deleteGuessWord = asyncHandler(async(req,res)=>{
    const result = await wordservice.deleteGuessWord(req.query)
    res.successResponse = new successResponse("game deleted successfully",200,result);
})

const  getGuessWord = asyncHandler(async(req,res)=>{
    const result = await wordservice.fetchGuessWord(req.query);
    res.successResponse = new successResponse("fetch guss the word",200,result)
})

const playGuessWord = asyncHandler(async(req,res)=>{ 
    const userId = req.user.userId;   
    const result = await wordservice.playGuessWord(req.query,userId);
    res.successResponse = new successResponse("play guess the word",200,result)
})

export default {
    createGuessWord,
    updateGuessWord,
    deleteGuessWord,
    getGuessWord,
    playGuessWord
};;