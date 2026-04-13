import express from "express";
const router = express.Router()
import upload from "../utlis/upload.js";
import file_upload from "../utlis/file_upload.js";
import matchcontroler from "../controler/play/match.js";

/**
 * @swagger
 * tags:
 *   - name: Match
 *     description: Match-the-following management, gameplay, and bulk import APIs
 */

/**
 * @swagger
 * /play/match-the-following:
 *   post:
 *     summary: Create a match-the-following game with translations
 *     tags: [Match]
 *     description: >
 *       Calls `services/play/newMatch.createMatch()`. The main language must be `English`.
 *       `left`, `right`, and `translations` are JSON stringified payloads sent in multipart form-data.
 *       Image items are uploaded through dynamic field names such as `left_0`, `right_0`,
 *       `translation_0_left_0`, and `translation_1_right_0`.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/MatchCreateRequest'
 *     responses:
 *       200:
 *         description: Match created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MatchCreateResponse'
 *   get:
 *     summary: Fetch playable match-the-following data
 *     tags: [Match]
 *     description: >
 *       Calls `services/play/newMatch.playMatch()`. Supported language codes are `en`, `guj`, and `es`.
 *       The service filters out games already answered correctly by the user, localizes the payload,
 *       assigns matching numeric ids to left/right items, shuffles left items, and records an activity entry.
 *     parameters:
 *       - in: query
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *           enum: [en, guj, es]
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: Match gameplay fetched successfully
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
 *                         $ref: '#/components/schemas/MatchPlayRecord'
 */
router.post("/match-the-following", upload.any(),matchcontroler.createMatch);
router.get("/match-the-following",matchcontroler.playMatch)

/**
 * @swagger
 * /play/get-match-data:
 *   get:
 *     summary: Fetch all matches with translation data
 *     tags: [Match]
 *     description: Calls `services/play/newMatch.getAllMatches()`. Returns the base match record plus grouped translations.
 *     responses:
 *       200:
 *         description: Matches fetched successfully
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
 *                         $ref: '#/components/schemas/MatchRecord'
 */
router.get("/get-match-data",matchcontroler.getMatches)

/**
 * @swagger
 * /play/match-the-following/{gameId}:
 *   delete:
 *     summary: Delete a match-the-following game and its translations
 *     tags: [Match]
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Match deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MatchDeleteResponse'
 */
router.delete("/match-the-following/:gameId",matchcontroler.deleteMatch)

/**
 * @swagger
 * /play/match-the-followings/{gameId}:
 *   put:
 *     summary: Update a match-the-following game
 *     tags: [Match]
 *     description: >
 *       Calls `services/play/newMatch.updateMatch()`. The route path is `match-the-followings`
 *       in the current codebase and is documented as-is. Payload format matches create, including
 *       multipart image field names for base and translation items.
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/MatchCreateRequest'
 *     responses:
 *       200:
 *         description: Match updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Match updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/MatchRecord'
 */
router.put("/match-the-followings/:gameId",upload.any(),matchcontroler.updateMatch);

/**
 * @swagger
 * /play/match-the-followings-upload:
 *   post:
 *     summary: Bulk upload matches from Excel
 *     tags: [Match]
 *     description: >
 *       Calls `services/play/newMatch.uploadMatchesFromExcel()`. The required upload field name is `files`.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/MatchExcelUploadRequest'
 *     responses:
 *       200:
 *         description: Matches uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MatchExcelUploadResponse'
 */
router.post('/match-the-followings-upload',file_upload.single('files'),matchcontroler.uploadMatchesFromExcel);

export default router;
