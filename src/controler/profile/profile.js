import successResponse from "../../utlis/successResponse.js";
import profileControler from "../../services/profile/profile.js";
import asyncHandler from "../../middleware/async.js";

const updateUserProfile = asyncHandler(async(req,res)=>{
    const result = await profileControler.updateUserProfile(req.body,req.file,req.query);
    res.successResponse = new successResponse("Profile updated Successfully",200,result);
})

const fetchUserProfile = asyncHandler(async(req,res)=>{
    const userId = req.user.userId
    const result = await profileControler.fetchUserProfile(userId);
    res.successResponse = new successResponse("profile fetched",200,result)
})

export default {
    updateUserProfile,
    fetchUserProfile
};;