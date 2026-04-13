import express from "express";
import wordControler from "../controler/play/wordSearch.js";
import quizController from "../controler/play/quiz.js";
const router = express.Router();
import upload from "../utlis/upload.js";
import auth from "../middleware/authToken.js";
import file_upload from "../utlis/file_upload.js";

/**
 * @swagger
 * tags:
 *   - name: WordSearch
 *     description: Word search management, gameplay, analytics, and bulk import APIs
 */

/**
 * @swagger
 * /play/word-search:
 *   get:
 *     summary: Fetch playable word-search games
 *     tags: [WordSearch]
 *     description: >
 *       Calls `services/play/wordSearch.playWordSearch()`. Supports `en`, `gu`.
 *       The service skips already-correct games for the user, generates a grid and hints from
 *       the stored word list, records an activity entry, and returns paginated gameplay data.
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Word-search gameplay fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/WordSearchPlayResponse'
 *   post:
 *     summary: Create a word-search game with translations
 *     tags: [WordSearch]
 *     description: >
 *       Calls `services/play/wordSearch.createWordSearch()`. `titles`, `languages`, and
 *       `validWords` must all be arrays of the same length. English is required as the base language.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WordSearchCreateRequest'
 *     responses:
 *       200:
 *         description: Word-search game created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/WordSearchCreateResponse'
 *   put:
 *     summary: Update a word-search game and its translations
 *     tags: [WordSearch]
 *     description: >
 *       Calls `services/play/wordSearch.updateWordSearch()`. Expects `gameId` in query and the same
 *       array-based JSON structure as create. Existing translations are deleted and recreated.
 *     parameters:
 *       - in: query
 *         name: gameId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WordSearchCreateRequest'
 *     responses:
 *       200:
 *         description: Word-search game updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/WordSearchCreateResponse'
 *   delete:
 *     summary: Delete a word-search game
 *     tags: [WordSearch]
 *     parameters:
 *       - in: query
 *         name: gameId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Word-search game deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/WordSearchDeleteResponse'
 */
router.get('/word-search',wordControler.playWordSearch);
router.post('/word-search',wordControler.createWordSearch);
router.put('/word-search',wordControler.updateWordSearch);
router.delete('/word-search',wordControler.deleteWordSearch);

/**
 * @swagger
 * /play/word-searchs:
 *   get:
 *     summary: Fetch all word-search games for admin management
 *     tags: [WordSearch]
 *     description: >
 *       Calls `services/play/wordSearch.fetchWordSearch()`. Returns all stored word-search games
 *       with grouped translation payloads. The route path keeps the code spelling `word-searchs`.
 *     responses:
 *       200:
 *         description: Word-search games fetched successfully
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
 *                         $ref: '#/components/schemas/WordSearchAdminItem'
 */
router.get('/word-searchs',wordControler.fetchWordSearch);

/**
 * @swagger
 * /play/word-search-details:
 *   get:
 *     summary: Fetch word-search mode summary details for a user
 *     tags: [WordSearch]
 *     description: >
 *       This route delegates to `quizController.fetchWordSearchDetails()`, which calls
 *       `services/play/quiz.fetchWordSearchDetails()`. It returns remaining levels and total users.
 *       Accepted `lang` values are `en` and `guj`.
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
 *         description: Word-search details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/WordSearchDetailsResponse'
 */
router.get('/word-search-details',quizController.fetchWordSearchDetails)

/**
 * @swagger
 * /play/create:
 *   post:
 *     summary: Bulk import word-search games from Excel
 *     tags: [WordSearch]
 *     description: >
 *       Calls `services/play/wordSearch.createWordSearchFromExcel()`. The uploaded spreadsheet
 *       must include the headers `Level`, `Language`, `Title`, and `ValidWords`.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/WordSearchExcelUploadRequest'
 *     responses:
 *       200:
 *         description: Word-search games imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/WordSearchExcelImportResponse'
 */
router.post('/create',file_upload.single('file'),wordControler.createWordSearchFromExcel)
export default router;;
