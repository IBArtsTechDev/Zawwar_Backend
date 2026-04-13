import asyncHandler from "../../middleware/async.js";
import leagues from "../../services/leagues.js";
import successResponse from "../../utlis/successResponse.js";

const fetchLeagues = asyncHandler(async(req,res)=>{
    const result = await leagues.fetchLeagues(req.query);
    res.successResponse = new successResponse("Available Leagues",200,result)
})

export default {
    fetchLeagues
};;