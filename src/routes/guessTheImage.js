import express from "express";
import wordControler from "../controler/play/guessTheImage.js";
const router = express.Router();
import upload from "../utlis/upload.js";
import auth from "../middleware/authToken.js";
import file_upload from "../utlis/file_upload.js";

/**
 * @swagger
 * tags:
 *   - name: GuessTheImage
 *     description: Guess-the-image management, gameplay, and Excel import APIs
 */

/**
 * @swagger
 * /play/word/guess-the-image:
 *   post:
 *     summary: Create a guess-the-image game
 *     tags: [GuessTheImage]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Calls `services/play/guessTheImage.createWord()`. Expects multipart form-data.
 *       `translations` must be a JSON stringified array, and the main image upload field is `mainImage`.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/GuessTheImageCreateRequest'
 *     responses:
 *       200:
 *         description: Game created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/GuessTheImageRecord'
 *   get:
 *     summary: Fetch playable guess-the-image games
 *     tags: [GuessTheImage]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Calls `services/play/guessTheImage.playWord()`. Supported `lang` values are `en`, `gu`.
 *       The service excludes already-correct games for the user, localizes the word, generates a jumbled letter set,
 *       and records a play activity.
 *     parameters:
 *       - in: query
 *         name: startLevel
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: endLevel
 *         required: false
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
 *         description: Guess-the-image gameplay fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/GuessTheImagePlayResponse'
 *   put:
 *     summary: Update a guess-the-image game
 *     tags: [GuessTheImage]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Calls `services/play/guessTheImage.updateWord()`. The service identifies the existing game
 *       by `level` plus `isGujrati`, not by `gameId`. Expects multipart form-data with optional `mainImage`.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/GuessTheImageUpdateRequest'
 *     responses:
 *       200:
 *         description: Game updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/GuessTheImageRecord'
 *   delete:
 *     summary: Delete a guess-the-image game
 *     tags: [GuessTheImage]
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
 *         description: Game deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/GuessTheImageDeleteResponse'
 */
router.post("/guess-the-image", auth.verifyToken, auth.verifyAdmin, upload.any(),wordControler.createWord);
router.get("/guess-the-image",auth.verifyToken, wordControler.playWord);
router.put('/guess-the-image',auth.verifyToken, auth.verifyAdmin,upload.any(),wordControler.updateWord);
router.delete('/guess-the-image',auth.verifyToken, auth.verifyAdmin,wordControler.deleteWord);

/**
 * @swagger
 * /play/word/guess-the-images:
 *   get:
 *     summary: Fetch all guess-the-image games with translations
 *     tags: [GuessTheImage]
 *     security:
 *       - bearerAuth: []
 *     description: Calls `services/play/guessTheImage.fetchWords()`. Optional `lang` filter supports `en` and `guj`.
 *     responses:
 *       200:
 *         description: Games fetched successfully
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
 *                         $ref: '#/components/schemas/GuessTheImageRecord'
 */
router.get('/guess-the-images',auth.verifyToken,wordControler.fetchWords);

/**
 * @swagger
 * /play/excel-upload:
 *   post:
 *     summary: Bulk create guess-the-image games from Excel
 *     tags: [GuessTheImage]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Calls `services/play/guessTheImage.createGamesFromExcel()`. The required upload field is `file`.
 *       The spreadsheet may include `level`, `word`, `time`, and `translations` columns.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/GuessTheImageExcelUploadRequest'
 *     responses:
 *       200:
 *         description: Games created from Excel successfully
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
 *                         $ref: '#/components/schemas/GuessTheImageRecord'
 */
router.post('/excel-upload', auth.verifyToken, auth.verifyAdmin, file_upload.single('file'),wordControler.createGamesFromExcel)


export default router;;                 
