    import asyncHandler from "../../middleware/async.js";
    import successResponse from "../../utlis/successResponse.js";
import resultControler from "../../services/play/results.js";

const gameAnswer = asyncHandler(async(req,res)=>{
    const result = await resultControler.gameAnswer(req.body);
    res.successResponse = new successResponse("Game Amswer",200,result)
})

export default {gameAnswer};;