import asyncHandler from "../../middleware/async.js";
import feedbackService from "../../services/user/feedback.js";
import successResponse from "../../utlis/successResponse.js";

const createFeedback = asyncHandler(async (req, res) => {
    const result = await feedbackService.createFeedback(req.query, req.body);
    res.successResponse = new successResponse("Feedback created successfully", 200, result);
});

const fetchFeedback = asyncHandler(async (req, res) => {
    const result = await feedbackService.fetchFeedback(req.query);
    res.successResponse = new successResponse("Feedback fetched successfully", 200, result);
});

const deleteFeedback = asyncHandler(async (req, res) => {
    const result = await feedbackService.deleteFeedback(req.query);
    res.successResponse = new successResponse("Feedback deleted successfully", 200, result);
});

export default {
    createFeedback,
    fetchFeedback,
    deleteFeedback
};;
