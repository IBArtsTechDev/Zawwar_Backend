import express from "express";
const router = express.Router();
import league from "../controler/play/league.js";
import auth from "../middleware/authToken.js";
import results from "../controler/play/result.js";
import badges from "../controler/user/badges.js";
import upload from "../utlis/upload.js";

/**
 * @swagger
 * tags:
 *   - name: Play
 *     description: League summary, saved game answers, and badge APIs mounted under /leagues
 */

/**
 * @swagger
 * /leagues/play:
 *   get:
 *     summary: Fetch league summary and quiz list
 *     tags: [Play]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Calls `services/leagues.fetchLeagues()`. The service checks `lang=eng` and `lang=guj`
 *       to choose Gujarati or non-Gujarati league labels and quiz filtering.
 *     parameters:
 *       - in: query
 *         name: lang
 *         required: false
 *         schema:
 *           type: string
 *           enum: [eng, guj]
 *     responses:
 *       200:
 *         description: League summary fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/LeagueResponse'
 */
router.get('/play',auth.verifyToken,league.fetchLeagues);

/**
 * @swagger
 * /leagues/save:
 *   post:
 *     summary: Save a game answer and increment total plays
 *     tags: [Play]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Calls `services/play/results.gameAnswer()`. Supported `type` values in the service are
 *       `Guess-the-image`, `Guess-the-word`, `Word-search`, and `match-the-following`.
 *       The service rejects duplicate answers for the same user/game/type combination.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GameAnswerRequest'
 *     responses:
 *       200:
 *         description: Game answer saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/GameAnswerRecord'
 */
router.post('/save',auth.verifyToken,results.gameAnswer);

/**
 * @swagger
 * /leagues/badges:
 *   get:
 *     summary: Fetch all badges
 *     tags: [Play]
 *     responses:
 *       200:
 *         description: Badges fetched successfully
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
 *                         $ref: '#/components/schemas/BadgeRecord'
 *   post:
 *     summary: Create a badge
 *     tags: [Play]
 *     description: Calls `services/play/badges.createBadge()`. Multipart upload field name for the icon is `icon`.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/BadgeCreateRequest'
 *     responses:
 *       200:
 *         description: Badge created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/BadgeRecord'
 *   put:
 *     summary: Update a badge
 *     tags: [Play]
 *     description: >
 *       Calls `services/play/badges.updateBadge()`. This route uses a JSON body in the current
 *       route definition and expects `badgeId` in the query string.
 *     parameters:
 *       - in: query
 *         name: badgeId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BadgeUpdateRequest'
 *     responses:
 *       200:
 *         description: Badge updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/BadgeRecord'
 */
router.get('/badges',badges.fetchBadges);
router.post('/badges',upload.single('icon'),badges.createBadge);
router.put('/badges',badges.updateBadge);

export default router;
