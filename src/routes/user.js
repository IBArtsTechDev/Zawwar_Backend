import express from "express";
import userControler from "../controler/user/user.js";
const router = express.Router();
import validate from "../middleware/validators/validate.js";
import userProfile from "../controler/profile/profile.js";
import upload from "../utlis/upload.js";
import auth from "../middleware/authToken.js";
import adsControler from "../controler/ads/ads.js";
import feedbackControler from "../controler/user/feedback.js";

/**
 * @swagger
 * tags:
 *   - name: User
 *     description: User authentication, profile, score, review, and utility APIs
 */

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: User login
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLoginRequest'
 *     responses:
 *       200:
 *         description: User login successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 */
router.post("/login",userControler.userLogin);

/**
 * @swagger
 * /user/signup:
 *   post:
 *     summary: User signup
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSignupRequest'
 *     responses:
 *       200:
 *         description: User signup successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 */
router.post("/signup",userControler.userSignup);

/**
 * @swagger
 * /user/generate-access-token:
 *   post:
 *     summary: Generate a new access token
 *     description: Generates a new access token and refresh token using a valid refresh token.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenerateAccessTokenRequest'
 *     responses:
 *       200:
 *         description: Access token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenerateAccessTokenResponse'
 *       400:
 *         description: Refresh token is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       401:
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.post('/generate-access-token', userControler.createAccessToken)

/**
 * @swagger
 * /user/check-username:
 *   post:
 *     summary: Check whether a username is unique
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username to validate for uniqueness
 *         example: john_doe
 *     responses:
 *       200:
 *         description: Username availability checked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CheckUsernameResponse'
 *       400:
 *         description: Username is missing or shorter than 3 characters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CheckUsernameValidationErrorResponse'
 */
router.post("/check-username", userControler.uniqueUserName)

/**
 * @swagger
 * /user/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UserProfileUpdateRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *   get:
 *     summary: Fetch logged-in user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *   delete:
 *     summary: Delete user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 */
router.put ('/profile',auth.verifyToken,upload.single('profile_avatar'),userProfile.updateUserProfile);
router.get('/profile',auth.verifyToken,userProfile.fetchUserProfile)

/**
 * @swagger
 * /user/admin:
 *   get:
 *     summary: Verify admin or editor
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 */
router.get('/admin',auth.verifyToken,userControler.verifyAdmin)

/**
 * @swagger
 * /user/google:
 *   post:
 *     summary: Google social login
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SocialLoginRequest'
 *     responses:
 *       200:
 *         description: Social login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 */
router.post('/google',userControler.socialLogin)

/**
 * @swagger
 * /user/leaderboard:
 *   get:
 *     summary: Fetch leaderboard
 *     tags: [User]
 *      security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [weekly, monthly, yearly]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 15
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Latest leaderboard fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 */
router.get('/leaderboard',auth.verifyToken, userControler.leaderboards);

/**
 * @swagger
 * /user/score:
 *   get:
 *     summary: Fetch user total score
 *     tags: [User]
 *      security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User score fetched successfully
 *   post:
 *     summary: Update user score
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserScoreUpdateRequest'
 *     responses:
 *       200:
 *         description: Points updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 */
router.get('/score', auth.verifyToken, userControler.fetchUserScore)
router.post('/score', auth.verifyToken, userControler.handleScore)

/**
 * @swagger
 * /user/ads:
 *   get:
 *     summary: Fetch ads for user
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: ['Banner', 'Video']
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: ['guj', 'en']
 *     responses:
 *       200:
 *         description: Ads fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 */
router.get('/ads',adsControler.fetchAdsuser);

/**
 * @swagger
 * /user/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     tags: [User]
 *      security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtpRequest'
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 */
router.post('/verify-otp', auth.verifyToken, userControler.verifyOTP);

/**
 * @swagger
 * /user/forgot-password:
 *   get:
 *     summary: Send forgot password OTP
 *     tags: [User]
 *      security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OTP sent to email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 */
router.get('/forgot-password', auth.verifyToken, userControler.forgetUserPassword);

/**
 * @swagger
 * /user/change-password:
 *   post:
 *     summary: Change password using OTP
 *     tags: [User]
 *      security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 */
router.post('/change-password', auth.verifyToken, userControler.changePassword)
router.delete('/profile', auth.verifyToken, userControler.deleteUser)

/**
 * @swagger
 * /user/contact-us:
 *   post:
 *     summary: Submit contact-us form
 *     tags: [User]
 *      security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactUsRequest'
 *     responses:
 *       200:
 *         description: Form sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 */
router.post('/contact-us', auth.verifyToken, userControler.contactUs);

/**
 * @swagger
 * /user/users-correct-questiions:
 *   get:
 *     summary: Fetch user correct questions
 *     tags: [User]
 *      security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Questions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 */
router.get('/users-correct-questiions', auth.verifyToken, userControler.fetchUserCorrectQuestions);

/**
 * @swagger
 * /user/feedback:
 *   post:
 *     summary: Create user feedback
 *     tags: [User]
 *      security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserFeedbackRequest'
 *     responses:
 *       200:
 *         description: Feedback created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 */
router.post('/feedback', auth.verifyToken, feedbackControler.createFeedback)

/**
 * @swagger
 * /user/guess-the-image-details:
 *   get:
 *     summary: Fetch guess-the-image details
 *     tags: [User]
 *      security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: lang
 *         required: true
 *         schema:
 *           type: string
 *           enum: [en, guj]
 *     responses:
 *       200:
 *         description: Details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 */
router.get('/guess-the-image-details', auth.verifyToken, userControler.fetchGuessTheImageDetails)

/**
 * @swagger
 * /user/apple-login:
 *   post:
 *     summary: Apple social login
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppleLoginRequest'
 *     responses:
 *       200:
 *         description: Apple login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 */
router.post('/apple-login',userControler.appleLogin)

/**
 * @swagger
 * /user/weekly-winner:
 *   get:
 *     summary: Fetch latest weekly winner
 *     tags: [User]
 *      security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly winner fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 */
router.get('/weekly-winner', auth.verifyToken,userControler.fetchWeeklyWinner)

/**
 * @swagger
 * /user/lastsixweekwinner:
 *   get:
 *     summary: Fetch last six weekly winners
 *     tags: [User]
 *      security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Last six weekly winners fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 */
router.get('/lastsixweekwinner', auth.verifyToken, userControler.fetchLastSixWeeklyWinners);

/**
 * @swagger
 * /user/reviewedDetails:
 *   get:
 *     summary: Get reviewed details
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Review details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *   post:
 *     summary: Mark review as given
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewGivenRequest'
 *     responses:
 *       200:
 *         description: Review given successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 */
router.get('/reviewedDetails',userControler.getreviewDetails);
router.post('/reviewedDetails',userControler.reviewedGiven);

export default router;;
