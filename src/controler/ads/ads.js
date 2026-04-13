import asyncHandler from "../../middleware/async.js";
import AdsControler from "../../services/ads/ads.js";
import successResponse from "../../utlis/successResponse.js";

const createAds = asyncHandler(async(req,res)=>{
const result = await AdsControler.createAds(req.body,req.file);
res.successResponse = new successResponse("Ads created Successfully",200,result);
});

const fetchAdsuser = asyncHandler(async(req,res)=>{
    const result = await AdsControler.fetchAdsuser(req.query);
    res.successResponse = new successResponse("Ads updated successfully",200, result)
})

const updateAds = asyncHandler(async(req,res)=>{
    const result = await AdsControler.updateAds(req.body,req.file,req.query);
    res.successResponse = new successResponse("Ads updated successfully",200, result)
})

const updateAdsStatus = asyncHandler(async(req,res)=>{
    const result = await AdsControler.updateAdsStatus(req.query);
    res.successResponse = new successResponse("Ads updated successfully",200,result)
})

const deleteAds = asyncHandler(async(req,res)=>{
    const result = await AdsControler.deleteAds(req.query);
    res.successResponse = new successResponse("Ad deleted successfully",200,result);
})
const fetchAds = asyncHandler(async(req,res)=>{
    const result = await AdsControler.fetchAds(req.query);
    res.successResponse = new successResponse("Ads fetched successfully",200,result)
})

const handlwAdsCLicked = asyncHandler(async(req,res)=>{
    const result = await AdsControler.handlwAdsCLicked(req.query);
    res.successResponse = new successResponse("Ads clicked",200,result)
})

export default {
  	updateAdsStatus,
  	fetchAdsuser,
    handlwAdsCLicked,
    createAds,updateAds,
    deleteAds,fetchAds
};;