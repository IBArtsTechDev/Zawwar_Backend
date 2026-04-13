import asyncHandler from "../middleware/async.js";
import termsControler from "../services/terms.js";
import successResponse from "../../src/utlis/successResponse.js";


const createTerms = asyncHandler(async(req,res)=>{
    const result = await termsControler.createTerms(req.body);
    res.successResponse = new successResponse("Terms created successfuly",200,result);
})

const updateTerms = asyncHandler(async(req,res)=>{
    const result = await termsControler.updateTerms(req.query,req.body);
    res.successResponse = new successResponse("Terms updated successfully",200,result);
})

const deleteTerms = asyncHandler(async(req,res)=>{
    const result = await termsControler.deleteTerms(req.query);
    res.successResponse = new successResponse("Terms Deleated successfully",200,result);
})

const fetchTerms = asyncHandler(async(req,res)=>{
    const result = await termsControler.fetchTerms()
    res.successResponse = new successResponse("Terms fetched successfully",200,result);
});

const fetchTermsById = asyncHandler(async(req,res)=>{
    const result = await termsControler.fetchTermsById(req.query);
    res.successResponse = new successResponse("Terms fetch for Id",200,result);
})

export default {
    createTerms,
    updateTerms,
    deleteTerms,
    fetchTerms,
    fetchTermsById
};;