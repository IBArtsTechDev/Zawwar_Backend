import asyncHandler from "../../middleware/async.js";
import db from "../../config/db.js";
import { Op } from "sequelize";
import ErrorResponse from "../../utlis/ErrorResponse.js";


const createFeedback = asyncHandler(async (query, body) => {
    console.log(query,body)
    const { userId, rating, version, feedback } = body;

    if (!userId || !rating || !version) {
        throw new ErrorResponse('Please provide all required fields: userId, rating, version', 400);
    }
    const user = await db.user.findByPk(userId);
    if (!user) {
        throw new ErrorResponse('User not found', 404);
    }
    const recentFeedback = await db.feedback.findOne({
        where: {
            userId,
            createdAt: {
                [Op.gt]: new Date(Date.now() - 24 * 60 * 60 * 1000) 
            }
        }
    });
    if (recentFeedback) {
        throw new ErrorResponse('You have already submitted feedback in the last 24 hours', 400);
    }

    const newFeedback = await db.feedback.create({
        userId,
        rating,
        version,
        feedback
    });

    return newFeedback;
});
const fetchFeedback = asyncHandler(async () => {
    const feedbacks = await db.feedback.findAll(); 

    if (feedbacks.length === 0) {
        throw new ErrorResponse('No feedback found', 404);
    }
    const users = await db.user.findAll({ 
        attributes: ['userId', 'userName'] 
    });
    const userMap = {};
    users.forEach(user => {
        userMap[user.userId] = user.userName;
    });
    const feedbackWithUsernames = feedbacks.map(feedback => ({
        feedbackId: feedback.feedbackId,
        userId: feedback.userId,
        userName: userMap[feedback.userId] || 'Unknown',
        rating: feedback.rating,
        version: feedback.version,
        feedback: feedback.feedback,
        createdAt: feedback.createdAt,
    }));

    return feedbackWithUsernames;
});


const deleteFeedback = asyncHandler(async (query) => {
    const { feedbackId } = query;

    if (!feedbackId) {
        throw new ErrorResponse('Feedback ID is required', 400);
    }
    const feedback = await db.feedback.findByPk(feedbackId);

    if (!feedback) {
        throw new ErrorResponse('Feedback not found', 404);
    }
    await feedback.destroy();

    return []
});

export default {
    createFeedback,
    fetchFeedback,
    deleteFeedback
};;
