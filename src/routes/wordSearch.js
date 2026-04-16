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
 *     security:
 *       - bearerAuth: []
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
 *     security:
 *       - bearerAuth: []
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
 *     security:
 *       - bearerAuth: []
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
 *     security:
 *       - bearerAuth: []
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
router.get('/word-search', auth.verifyToken,wordControler.playWordSearch);
router.post('/word-search', auth.verifyToken, auth.verifyAdmin, wordControler.createWordSearch);
router.put('/word-search', auth.verifyToken, auth.verifyAdmin, wordControler.updateWordSearch);
router.delete('/word-search', auth.verifyToken, auth.verifyAdmin, wordControler.deleteWordSearch);

/**
 * @swagger
 * /play/word-searchs:
 *   get:
 *     summary: Fetch all word-search games for admin management
 *     tags: [WordSearch]
 *     security:
 *       - bearerAuth: []
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
router.get('/word-searchs',auth.verifyToken, wordControler.fetchWordSearch);

/**
 * @swagger
 * /play/word-search-details:
 *   get:
 *     summary: Fetch word-search mode summary details for a user
 *     tags: [WordSearch]
 *     security:
 *       - bearerAuth: []
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
router.get('/word-search-details', auth.verifyToken,quizController.fetchWordSearchDetails)


/**
 * @swagger
 * components:
 *   schemas:
 *     WordSearchEntry:
 *       type: object
 *       required:
 *         - level
 *         - titles
 *         - languages
 *         - validWords
 *       properties:
 *         level:
 *           type: integer
 *           example: 1
 *         titles:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Fruits", "ફળો"]
 *         languages:
 *           type: array
 *           items:
 *             type: string
 *           example: ["English", "Gujarati"]
 *         validWords:
 *           type: array
 *           description: >
 *             Outer array index matches languages index.
 *             Each inner array is the word list for that language.
 *           items:
 *             type: array
 *             items:
 *               type: string
 *           example:
 *             - ["APPLE", "MANGO", "GRAPE"]
 *             - ["સફરજન", "કેરી", "દ્રાક્ષ"]
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *           example: easy
 *         isGujrati:
 *           oneOf:
 *             - type: boolean
 *             - type: string
 *               enum: ["true", "false"]
 *           default: false
 *           example: true
 *
 *     WordSearchTranslation:
 *       type: object
 *       properties:
 *         language:
 *           type: string
 *           example: "Gujarati"
 *         title:
 *           type: string
 *           example: "ફળો"
 *         validWords:
 *           type: array
 *           items:
 *             type: string
 *           example: ["સફરજન", "કેરી", "દ્રાક્ષ"]
 *
 *     WordSearchCreateResult:
 *       type: object
 *       properties:
 *         gameId:
 *           type: integer
 *           example: 42
 *         level:
 *           type: integer
 *           example: 1
 *         translations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/WordSearchTranslation'
 */

/**
 * @swagger
 * /play/bulk-create:
 *   post:
 *     summary: Bulk create word-search games with translations
 *     tags:
 *       - WordSearch
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Accepts either a **single entry object** or an **array of entry objects**.
 *       `titles`, `languages`, and `validWords` must all be the same length.
 *       `English` must always be present as a language — it is stored as the
 *       base record; all other languages are stored as translations.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/WordSearchEntry'
 *               - type: array
 *                 items:
 *                   $ref: '#/components/schemas/WordSearchEntry'
 *                 minItems: 1
 *           examples:
 *             single:
 *               summary: Single entry
 *               value:
 *                 level: 1
 *                 titles: ["Fruits", "ફળો"]
 *                 languages: ["English", "Gujarati"]
 *                 difficulty: easy
 *                 isGujrati: true
 *                 validWords:
 *                   - ["APPLE", "MANGO", "GRAPE"]
 *                   - ["સફરજન", "કેરી", "દ્રાક્ષ"]
 *             bulk:
 *               summary: Multiple entries
 *               value:
 *                 - level: 1
 *                   titles: ["Fruits", "ફળો"]
 *                   languages: ["English", "Gujarati"]
 *                   difficulty: easy
 *                   isGujrati: true
 *                   validWords:
 *                     - ["APPLE", "MANGO", "GRAPE"]
 *                     - ["સફરજન", "કેરી", "દ્રાક્ષ"]
 *                 - level: 2
 *                   titles: ["Animals", "પ્રાણીઓ"]
 *                   languages: ["English", "Gujarati"]
 *                   difficulty: medium
 *                   isGujrati: true
 *                   validWords:
 *                     - ["CAT", "DOG", "LION"]
 *                     - ["બિલાડી", "કૂતરો", "સિંહ"]
 *     responses:
 *       200:
 *         description: All entries created successfully
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
 *                         $ref: '#/components/schemas/WordSearchCreateResult'
 *       400:
 *         description: Validation error (missing fields, length mismatch, English not present)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *             example:
 *               success: false
 *               message: "Entry[0]: 'validWords', 'titles', and 'languages' must all have the same length."
 *       500:
 *         description: Database or server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.post('/bulk-create',auth.verifyToken, auth.verifyAdmin, wordControler.createBulkWordSearch);

/**
 * @swagger
 * /play/create:
 *   post:
 *     summary: Bulk import word-search games from Excel
 *     tags: [WordSearch]
 *     security:
 *       - bearerAuth: []
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
router.post('/create', auth.verifyToken, auth.verifyAdmin, file_upload.single('file'),wordControler.createWordSearchFromExcel)

export default router;
