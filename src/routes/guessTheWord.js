import express from "express";
import wordController from "../controler/play/guessTheWords.js";
const router = express.Router();
import upload from "../utlis/upload_.js";
import auth from "../middleware/authToken.js";

/**
 * @swagger
 * tags:
 *   - name: GuessTheWord
 *     description: Guess-the-word management and gameplay APIs
 */

/**
 * @swagger
 * /play/guess/guess-the-word:
 *   post:
 *     summary: Create a guess-the-word game
 *     tags: [GuessTheWord]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Calls `services/play/guessTheWords.createGuessWord()`. Expects multipart form-data with up to
 *       four image fields named `image1` to `image4`. `translations` must be a JSON stringified array.
 *       `correctImage` is the 1-based index of the correct image.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/GuessTheWordCreateRequest'
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
 *                       $ref: '#/components/schemas/GuessTheWordRecord'
 *   get:
 *     summary: Fetch playable guess-the-word games
 *     tags: [GuessTheWord]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Calls `services/play/guessTheWords.playGuessWord()`. Supported `lang` values are `en` and `guj`.
 *       Returns images, answer word, correct image index, and pagination metadata.
 *     parameters:
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
 *     responses:
 *       200:
 *         description: Guess-the-word gameplay fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/GuessTheWordPlayResponse'
 *   put:
 *     summary: Update a guess-the-word game
 *     tags: [GuessTheWord]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Calls `services/play/guessTheWords.updateGuessWord()`. Expects `gameId` in query string.
 *       Existing images can be updated by passing `image1Id` to `image4Id`; new uploads use the same
 *       `image1` to `image4` field names as create.
 *     parameters:
 *       - in: query
 *         name: gameId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/GuessTheWordUpdateRequest'
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
 *                       $ref: '#/components/schemas/GuessTheWordRecord'
 *   delete:
 *     summary: Delete a guess-the-word game
 *     tags: [GuessTheWord]
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
 *                       $ref: '#/components/schemas/GuessTheWordDeleteResponse'
 */
router.post("/guess-the-word", auth.verifyToken, auth.verifyAdmin, upload.fields([     
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
]), wordController.createGuessWord);
router.get("/guess-the-word",auth.verifyToken, wordController.playGuessWord);
router.put('/guess-the-word', auth.verifyToken, auth.verifyAdmin, upload.fields([        
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
]), wordController.updateGuessWord);
router.delete('/guess-the-word',auth.verifyToken, auth.verifyAdmin, wordController.deleteGuessWord);

/**
 * @swagger
 * /play/guess/guess-the-words:
 *   get:
 *     summary: Fetch all guess-the-word games with translations and images
 *     tags: [GuessTheWord]
 *     description: Calls `services/play/guessTheWords.fetchGuessWord()`. Optional `lang` filter supports `en` and `guj`.
 *     responses:
 *       200:
 *         description: Guess-the-word games fetched successfully
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
 *                         $ref: '#/components/schemas/GuessTheWordRecord'
 */
router.get('/guess-the-words',auth.verifyToken, wordController.getGuessWord);

export default router;
