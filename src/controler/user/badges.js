import asyncHandler from "../../middleware/async.js";
import badgeControler from "../../services/play/badges.js";
import successResponse from "../../utlis/successResponse.js";

const createBadge = asyncHandler(async(req,res)=>{
    const result = await badgeControler.createBadge(req.body,req.file);
    res.successResponse = new successResponse("Badge created successfully",200,result)
})

const updateBadge = asyncHandler(async(req,res)=>{
    const result = await badgeControler.updateBadge(req.query,req.body,req.file);
    res.successResponse = new successResponse("Badge updated successfully",200,result)
})

const deleteBadge = asyncHandler(async(req,res)=>{
    const result = await badgeControler.deleteBadge(req.query);
    res.successResponse = new successResponse("Badge deleted successfully",200,result)
})

const fetchBadges = asyncHandler(async(req,res)=>{
    const result = await badgeControler.fetchBadges();
    res.successResponse = new successResponse("Badge fetched successfully",200,result)
})
const fetchBadgesByUser = asyncHandler(async(req,res)=>{
    const result = await badgeControler.fetchBadgesByUser(req.query);
    res.successResponse = new successResponse("Badge fetched successfully",200,result)
})

export default {
    createBadge,
    updateBadge,
    deleteBadge,
    fetchBadges,
    fetchBadgesByUser
};;
