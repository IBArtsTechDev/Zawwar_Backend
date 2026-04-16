import express from "express";
const router = express.Router()
import adminControler from "../controler/admin/admin.js";
import feedbackControler from "../controler/user/feedback.js";
import auth from "../middleware/authToken.js";

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin user management, analytics, notifications, app version, and feedback APIs
 */

/**
 * @swagger
 * /admin/user:
 *   post:
 *     summary: Create an admin panel user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminUserRequest'
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AdminUser'
 *   put:
 *     summary: Update an existing user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminUserUpdateRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         success:
 *                           type: boolean
 *                           example: true
 *                         data:
 *                           $ref: '#/components/schemas/AdminUser'
 *   delete:
 *     summary: Delete a user and related records
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         message:
 *                           type: string
 *                           example: User, points, scores, and associated OTP record deleted successfully
 *   get:
 *     summary: Fetch all users for admin management
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AdminUser'
 */
router.post('/user',auth.verifyToken, auth.verifyAdmin, adminControler.createUser);
router.put('/user',auth.verifyToken, auth.verifyAdmin, adminControler.updateUser);
router.delete('/user',auth.verifyToken, auth.verifyAdmin, adminControler.deleteUser);
router.get('/user',auth.verifyToken, auth.verifyAdmin, adminControler.fetchUser);

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Fetch dashboard metrics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard analytics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AdminDashboardMetrics'
 */
router.get('/dashboard',auth.verifyToken, auth.verifyAdmin, adminControler.dashboardMatrics)

/**
 * @swagger
 * /admin/chart-data:
 *   get:
 *     summary: Fetch monthly user signup chart data for a year
 *     tags: [Admin]
 *      security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Four digit year used to build the monthly signup chart
 *     responses:
 *       200:
 *         description: Chart data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AdminChartData'
 */
router.get('/chart-data', auth.verifyAdmin, auth.verifyAdmin, adminControler.chartData)

/**
 * @swagger
 * /admin/most-played-quiz:
 *   get:
 *     summary: Fetch top 5 most played quizzes
 *     tags: [Admin]
 *      security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Most played quiz data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AdminMostPlayedQuizData'
 */
router.get('/most-played-quiz',auth.verifyAdmin, auth.verifyAdmin, adminControler.mostPlayedQuiz);

/**
 * @swagger
 * /admin/game-stats:
 *   get:
 *     summary: Fetch gameplay statistics grouped by game category
 *     tags: [Admin]
 *      security:
 *       - bearerAuth: []
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Game statistics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AdminGameStatistics'
 */
router.get('/game-stats', auth.verifyAdmin, auth.verifyAdmin,adminControler.getGamePlayStatistics);

/**
 * @swagger
 * /admin/leaderboard:
 *   get:
 *     summary: Fetch top 10 users by total points
 *     tags: [Admin]
 *      security:
 *       - bearerAuth: []
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leaderboard fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AdminLeaderboardEntry'
 */
router.get('/leaderboard',auth.verifyAdmin, auth.verifyAdmin, adminControler.leaderboard)

/**
 * @swagger
 * /admin/notifiation:
 *   post:
 *     summary: Send a push notification to all users with valid FCM tokens
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminNotificationRequest'
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       example: []
 */
router.post('/notifiation', auth.verifyAdmin, auth.verifyAdmin,adminControler.sendNotificationAll)

/**
 * @swagger
 * /admin/version:
 *   get:
 *     summary: Fetch app version by platform
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [android, ios]
 *     responses:
 *       200:
 *         description: Version fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       oneOf:
 *                         - $ref: '#/components/schemas/AdminVersionRecord'
 *                         - type: array
 *                           example: []
 *   post:
 *     summary: Create or update app version by platform
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminVersionRequest'
 *     responses:
 *       200:
 *         description: Version recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AdminVersionRecord'
 */
router.get('/version',adminControler.getVersion);
router.post('/version',adminControler.version)

/**
 * @swagger
 * /admin/feedback:
 *   get:
 *     summary: Fetch all user feedback entries
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feedback fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AdminFeedback'
 *   delete:
 *     summary: Delete a feedback record
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: feedbackId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Feedback deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       example: []
 */
router.get('/feedback', auth.verifyAdmin, auth.verifyAdmin,feedbackControler.fetchFeedback);
router.delete('/feedback', auth.verifyAdmin, auth.verifyAdmin,feedbackControler.deleteFeedback)


export default router;;
