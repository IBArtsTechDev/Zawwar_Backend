import asyncHandler from "../../middleware/async.js";
import guessTheImage from "../../services/play/guessTheWord.js";
import successResponse from "../../utlis/successResponse.js";

const createGuessImage = asyncHandler(async (req, res) => {
    console.log(req.body, req.files);
    const result = await guessTheImage.createGuessWord(req.body, req.files);
    res.successResponse = new successResponse("Image game created successfully", 200, result);
});

const playGuessImage = asyncHandler(async (req  , res) => {
    const result = await guessTheImage.playGuessWord(req.query)
    res.successResponse = new successResponse("Game data fetched successfully", 200, result);
});

const fetchGuessImage = asyncHandler(async (req, res) => {
    const result = await guessTheImage.fetchGuessWord(req.query)
    res.successResponse = new successResponse("Games fetched successfully", 200, result);
});

const deleteGuessImage = asyncHandler(async (req, res) => {
    const result = await guessTheImage.deleteGuessWord(req.query);
    console.log(req.query)
    res.successResponse = new successResponse("Game deleted successfully", 200, result);
});

const updateGuessImage = asyncHandler(async (req, res) => {
console.log(req.body, req.files);
    const result = await guessTheImage.updateGuessWord(req.body, req.files,req.query);
    res.successResponse = new successResponse("Game updated successfully", 200, result);
});

export default {
    createGuessImage,
    playGuessImage,
    fetchGuessImage,
    deleteGuessImage,
    updateGuessImage
};;