import asyncHandler from "../../middleware/async.js";
import guessTheImage from "../../services/play/guessTheImage.js";
import successResponse from "../../utlis/successResponse.js";

const createWord = asyncHandler(async(req,res)=>{
  console.log(req.body,req.file)
  const result = await guessTheImage.createWord(req.body,req.files);
  res.successResponse = new successResponse("Game created successfully",200,result)
});

const playWord = asyncHandler(async(req,res)=>{
    const result = await guessTheImage.playWord(req.query);
    res.successResponse = new successResponse("Game fetched successfully",200,result)
});

const fetchWords = asyncHandler(async(req,res)=>{
    const result = await guessTheImage.fetchWords(req.query)
    res.successResponse = new successResponse("Games fetched successfully",200,result)
});

const deleteWord = asyncHandler(async(req,res)=>{
    const result = await guessTheImage.deleteWord(req.query);
    res.successResponse = new successResponse("Game deleted successfully",200,result);
});

const updateWord = asyncHandler(async(req,res)=>{
    console.log(req.body,req.file)
    const result = await guessTheImage.updateWord(req.body,req.files);
    res.successResponse = new successResponse("Game updated successfully",200,result);
});

const createGamesFromExcel = asyncHandler(async(req,res)=>{
    const result = await guessTheImage.createGamesFromExcel(req.file);
    res.successResponse = new successResponse("Game created successfully",200);
})

export default {
    createGamesFromExcel,
    deleteWord,
    updateWord,
    createWord,
    playWord,
    fetchWords
};;