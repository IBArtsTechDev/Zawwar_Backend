import asyncHandler from "../../middleware/async.js";
import wordController from "../../services/play/wordSearch.js";
import successResponse from "../../utlis/successResponse.js";

const createWordSearch = asyncHandler(async (req, res, next) => {
    const result = await wordController.createWordSearch(req.body);
    res.successResponse = new successResponse("Game created successfully", 200, result);
});

const updateWordSearch = asyncHandler(async (req, res, next) => {
    const result = await wordController.updateWordSearch(req.body,req.query);
    res.successResponse = new successResponse("Game updated successfully", 200, result);
});

const deleteWordSearch = asyncHandler(async (req, res, next) => {
    const result = await wordController.deleteWordSearch(req.query);
    res.successResponse = new successResponse("Game deleted successfully", 200, result);
});

const playWordSearch = asyncHandler(async (req, res, next) => {
    const userId = req.user.userId;
    const result = await wordController.playWordSearch(req.query,userId);
    res.successResponse = new successResponse("Game fetched successfully", 200, result);
});

const fetchWordSearch = asyncHandler(async(req,res)=>{
    const result = await wordController.fetchWordSearch(req.query);
    res.successResponse = new successResponse("words fetched successfully",200,result)
})

const createWordSearchFromExcel = asyncHandler(async(req,res)=>{
    const result = await wordController.createWordSearchFromExcel(req.file);
    res.successResponse = new successResponse("words created successfully",200,result)
})

const createBulkWordSearch = asyncHandler(async(req,res)=>{
    const result = await wordController.createBulkWordSearch(req.body);
    res.successResponse = new successResponse("words created successfully",200,result);
});

export default {
    createWordSearchFromExcel,
    fetchWordSearch,
    createWordSearch,
    updateWordSearch,
    deleteWordSearch,
    playWordSearch,
    createBulkWordSearch
};
