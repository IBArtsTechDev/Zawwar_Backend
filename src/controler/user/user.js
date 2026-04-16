import successResponse from "../../utlis/successResponse.js";
import userControler from "../../services/user/user.js";
import leaderboard from "../../services/play/leaderboard.js";
import asyncHandler from "../../middleware/async.js";
import ErrorResponse from "../../utlis/ErrorResponse.js";
import db from "../../config/db.js";
import auth from '../../middleware/authToken.js';
import jwt from "jsonwebtoken";
import getEnv from "../../config/envReader.js";

const userLogin = asyncHandler(async(req,res)=>{
    const result = await userControler.login(req.body);
    res.successResponse =new successResponse("user login successfully",200,result);
});

const userSignup = asyncHandler(async(req,res)=>{
    const result = await userControler.signup(req.body);
    res.successResponse = new successResponse("user signup successfully",200,result);
});

const verifyOTP = asyncHandler(async(req,res)=>{
    const result = await userControler.verifyOTP(req.body);
    res.successResponse = new successResponse("otp verified successfully",200,result)
})

const verifyAdmin = asyncHandler(async(req,res)=>{
    const {userId,userType} = req.user
    if(!userId ||  (userType !== 'admin' && userType !== 'editor') ){
        throw new ErrorResponse("Invalid Credentials",401)
    }
    const result =  await userControler.verifyAdmin(userId);
    res.successResponse = new successResponse("Admin details fetched successfully",200,result);
})
const fetchUserScore = asyncHandler(async(req,res)=>{
    const result = await leaderboard.fetchUserScore(req.query)
    res.successResponse = new successResponse("user signup successfully",200,result);
})
const socialLogin = asyncHandler(async(req,res)=>{
    const {data,fcmToken} = req.body
    console.log(data);
    
    const result = await userControler.socialLogin(data,fcmToken);
    res.successResponse = new successResponse("user signup successfully",200,result);
})

const leaderboards = asyncHandler(async(req,res)=>{
    const result = await leaderboard.fetchLeaderboard(req.query);
    res.successResponse = new successResponse("Latest leaderboard fetched succe",200,result);
})
const handleScore = asyncHandler(async(req,res)=>{
    const result = await leaderboard.handleScore(req.body);
    res.successResponse = new successResponse("Points updated successfully",200,result);
})

const forgetUserPassword = asyncHandler(async(req,res)=>{
    const result = await userControler.forgotUserPassword(req.query);
    res.successResponse = new successResponse("otp sent to the email",200,result)
})

const changePassword = asyncHandler(async(req,res)=>{
    const result = await userControler.changePassword(req.body);
    res.successResponse = new successResponse("Password chsnged successfully",200,result)
})

const deleteUser = asyncHandler(async(req,res)=>{
    const result = await userControler.deleteUser(req.query);
    res.successResponse = new successResponse("User deleted successfully",200,result)
})

const contactUs = asyncHandler(async(req,res)=>{
    const result = await userControler.contactUs(req.body);
    res.successResponse = new successResponse("Form sent successfully",200,result)
})

const fetchUserCorrectQuestions = asyncHandler(async(req,res) => {
    const result = await userControler.fetchUserCorrectQuestions(req.query);
    res.successResponse = new successResponse("questions fetched successfully",200,result)
})

const fetchGuessTheImageDetails = asyncHandler(async(req,res)=>{
    const result = await userControler.fetchGuessTheImageDetails(req.query);
    res.successResponse = new successResponse("Details fetched successfully",200,result)

})

const appleLogin = asyncHandler(async(req,res)=>{
    const result = await userControler.appleLogin(req.body);
    res.successResponse = new successResponse("Apple login successfull",200,result)
})

const fetchLastSixWeeklyWinners = asyncHandler(async(req,res)=>{
  const result = await leaderboard.fetchLastSixWeeklyWinners();
  res.successResponse = new successResponse("last six weekly winners fetched successfully",200,result)
})

const fetchWeeklyWinner = asyncHandler(async(req,res)=>{
    const result = await leaderboard.fetchWeeklyWinner();
    res.successResponse = new successResponse("weekly winnner fetched successfully",200,result)
});

const getreviewDetails = asyncHandler(async(req,res)=>{
        const result = await userControler.getreviewDetails(req.query);
        res.successResponse = new successResponse("review details fetched successfully",200,result)
})
const reviewedGiven = asyncHandler(async(req,res)=>{
        const result = await userControler.reviewedGiven(req.body);
        res.successResponse = new successResponse("review given successfully",200,result)
})

const uniqueUserName = asyncHandler(async(req,res) => {
    const { username } = req.query;

    if (!username || username.trim().length < 3) {
        return res.status(400).json({
            available: false,
            message: 'Username must be at least 3 characters',
        });
    }

    const existingUser = await db.user.findOne({
        where: { username: username.trim().toLowerCase() },
    });

    return res.status(200).json({
        available: !existingUser,
        message: existingUser ? 'Username already taken' : 'Username is available',
    });
})


const createAccessToken = asyncHandler(async(req,res)=>{
    const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ErrorResponse('Refresh token is required', 400);
  }

  const decodesData = jwt.decode(refreshToken, getEnv.JWT_SECRET);

  if (!decodesData || !decodesData.userId) {
    throw new ErrorResponse('Invalid refresh token', 401);
  }

  const existingUser = await db.user.findOne({ where: { userId: decodesData.userId } });
  if (!existingUser) {
    throw new ErrorResponse('Invalid refresh token', 401);
  }

  try {
    const decoded = jwt.verify(refreshToken, getEnv.JWT_SECRET);
    const userId = decoded.userId;

    if (userId !== existingUser.userId) {
      throw new ErrorResponse('Invalid refresh token', 401);
    }

    const tokenPayload = {
      userId: existingUser.userId,
      userName: existingUser.userName,
      userEmail: existingUser.userEmail,
      userType: existingUser.userType
    }

    const newAccessToken = auth.generateAccessToken(tokenPayload);
    const newRefreshToken = auth.generateRefreshToken(tokenPayload);

    await existingUser.update({ refreshToken: newRefreshToken });

    res.successResponse = new successResponse("Access token generated successfully", 200, { token: newAccessToken, refreshToken: newRefreshToken });
    
  } catch (error) {
    throw new ErrorResponse('Invalid refresh token', 401);
  }   
})

export default {
  	getreviewDetails,
  	reviewedGiven,
  	appleLogin,
  	fetchGuessTheImageDetails,
  	fetchLastSixWeeklyWinners,
  	fetchWeeklyWinner,
  	fetchUserCorrectQuestions,
    changePassword,
    forgetUserPassword,
    handleScore,
    leaderboards,
    fetchUserScore,
    userLogin,
    userSignup,
    verifyAdmin,
    socialLogin,
    verifyOTP ,
    deleteUser,
    contactUs,
    uniqueUserName,
    createAccessToken
};