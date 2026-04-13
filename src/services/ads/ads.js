import db from "../../config/db.js";
import asyncHandler from "../../middleware/async.js";
import ErrorResponse from "../../utlis/ErrorResponse.js";

const createAds = asyncHandler(async (body, file) => {
    const { type, adsName, description, targetUrl, language,isActive } = body;
    const adLanguage = language || 'en';
    
    if (!adsName) {
        throw new ErrorResponse("Ad name is required", 400);
    }
    // For banner ads, ensure target URL is provided
    if (type === 'Banner' && !targetUrl) {
        throw new ErrorResponse("Target URL is required for banner ads", 400);
    }

    // Initialize adData with default targetUrl as null if it's a video ad
    let adData = {
        adsName,
        description,
        targetUrl: type === 'Video' ? null : targetUrl, // Default targetUrl to null for videos
        type,
        language: adLanguage,
        isActive
    };

    const existingAd = await db.ads.findOne({ where: { adsName } });
    if (existingAd) {
        throw new ErrorResponse("Ad name already exists", 400);
    }

    if (type === 'Banner') {
        if (!file) {
            throw new ErrorResponse("Banner image is required", 400);
        }
        adData.adsImage = file.filename; 
    } else if (type === 'Video') {
        if (!file) {
            throw new ErrorResponse("Video file is required", 400);
        }
        adData.adsVideo = file.filename;
    } else {
        throw new ErrorResponse("Type is not supported", 400);
    }

    const ad = await db.ads.create(adData);

    return ({
        success: true,
        data: ad
    });
});


const updateAdsStatus = asyncHandler(async(query)=>{
    const {isActive,adsId } = query;
    if(!isActive){
        throw new ErrorResponse("isActive status is required",400);
    }
    const ads = await db.ads.findOne({where:{adsId}});
    if(!ads){
        throw new ErrorResponse("Ads does not exist",400);
    }
    ads.isActive = isActive;
    await ads.save()
    return []
})

const fetchAdsuser = asyncHandler(async(query)=>{
    const { type, language } = query;

    if (!type) {
        throw new ErrorResponse("Type is required", 400);
    }

    const filter = { 
        type, 
        isActive: true // Only fetch ads that are active
    };

    // Add language filter if type is 'Video' and language is provided
    if (type === 'Video' && language) {
        filter.language = language;
    }

    const ads = await db.ads.findAll({ where: filter });

    if (!ads.length) {
        throw new ErrorResponse("No ads found for the specified criteria", 404);
    }

    // If type is 'Video', return a random video ad
    if (type === 'Video') {
        const randomIndex = Math.floor(Math.random() * ads.length);
        return ads[randomIndex];
    }

    // For other types, return all matching ads
    return ads;
})



const updateAds = asyncHandler(async (body, file, query) => {
    const { adsId } = query;
    if (!adsId) {
        throw new ErrorResponse("Ad ID is required", 400);
    }
    const ad = await db.ads.findOne({ where: { adsId } });
    if (!ad) {
        throw new ErrorResponse("Ad not found", 404);
    }
    const { type, adsName, description, targetUrl,language } = body;
    let updateData = { 
        adsName: adsName || ad.adsName, 
        description: description || ad.description, 
        targetUrl: targetUrl || ad.targetUrl,
        language: language || ad.language
    };
    if (type === 'Banner' && file) {
        updateData.adsImage = file.filename || ad.adsImage; 
    } else if (type === 'Video' && file) {
        updateData.adsVideo = file.filename; 
    }
    console.log(updateData)
    await ad.update(updateData);
    return ad;
});

const deleteAds = asyncHandler(async (query) => {
    console.log(query)
    const { adsId} = query;
    if (!adsId) {
        throw new ErrorResponse("Ad ID is required", 400);
    }
    const ad = await db.ads.findOne({ where: { adsId } });
    if (!ad) {
        throw new ErrorResponse("Ad not found", 404);
    }

    await db.ads.destroy({ where: { adsId} });
});

const fetchAds = asyncHandler(async (query) => {
    const { type, language } = query;

    if (!type) {
        throw new ErrorResponse("Type is required", 400);
    }
    const filter = { type };
    if (type === 'Video' && language) {
        filter.language = language;
    }

    const ads = await db.ads.findAll({ where: filter });

    if (!ads.length) {
        throw new ErrorResponse("No ads found for the specified criteria", 404);
    }

    return ads;
});

const handlwAdsCLicked = asyncHandler(async(query)=>{
    const {adsId,userId} = query;
    if(!adsId){
        throw new ErrorResponse("Ads Id missing")
    }
    const ad = await db.ads.findOne({where:{adsId}});
    if(!ad){
        throw new ErrorResponse("Ad with this Id not exist");
    }
    ad.clicks = ad.clicks + 1;
    await ad.save();
    return [];
    
})


export default {
  	updateAdsStatus,
    handlwAdsCLicked,
    fetchAdsuser,
    createAds,
    updateAds,
    deleteAds,
    fetchAds
};;