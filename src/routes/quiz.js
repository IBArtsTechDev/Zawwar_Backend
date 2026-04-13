import express from "express";
import quizController from "../controler/play/quiz.js";
const router = express.Router();
import upload from "../utlis/upload.js";
import file_upload from "../utlis/file_upload.js";
import validate from "../middleware/validators/validate.js";
import auth from "../middleware/authToken.js";

/**
 * @swagger
 * tags:
 *   - name: Quiz
 *     description: Quiz management, gameplay, progress, answers, and import APIs
 */

/**
 * @swagger
 * /play/quiz:
 *   post:
 *     summary: Create a quiz with translations
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Calls `services/play/quiz.createQUiz()`. This endpoint expects multipart form-data where
 *       `quizName` and `language` are JSON stringified arrays. The first array element becomes the
 *       base quiz, and remaining entries are saved as translations. Multiple `quizImage` files are accepted.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/QuizCreateRequest'
 *     responses:
 *       200:
 *         description: Quiz created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/QuizRecord'
 *   get:
 *     summary: Fetch localized quizzes for authenticated play
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     description: Calls `services/play/quiz.fetchQuizzes()`.
 *    
 *     responses:
 *       200:
 *         description: Available quizzes fetched successfully
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
 *                         $ref: '#/components/schemas/QuizListItem'
 *   put:
 *     summary: Update a quiz and its translations
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Calls `services/play/quiz.updateQuiz()`. The request body is multipart form-data.
 *       `quizName` and `language` must be JSON stringified arrays of equal length.
 *     parameters:
 *       - in: query
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/QuizUpdateRequest'
 *     responses:
 *       200:
 *         description: Quiz updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/QuizRecord'
 *   delete:
 *     summary: Delete a quiz and related questions/translations
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     description: Calls `services/play/quiz.deleteQuiz()`. The service expects query key `id`, not `quizId`.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Quiz deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/QuizDeleteResponse'
 */
router.post("/quiz", auth.verifyToken, upload.array('quizImage'), quizController.createQUiz);
router.get("/quiz",auth.verifyToken,quizController.fetchQuizzes);
router.put('/quiz',auth.verifyToken,upload.single('quizImage'),quizController.updateQuiz)
router.delete('/quiz',auth.verifyToken,quizController.deleteQuiz)

/**
 * @swagger
 * /play/question:
 *   post:
 *     summary: Create quiz questions with optional translations
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Calls `services/play/quiz.createQuestion()`. Expects multipart form-data with `quizId`
 *       and a `questions` field containing a JSON stringified array of question objects.
 *       Optional translations are nested inside each question object.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/QuizQuestionCreateRequest'
 *     responses:
 *       200:
 *         description: Questions created successfully
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
 *                         $ref: '#/components/schemas/QuizQuestionRecord'
 *   put:
 *     summary: Update a question and its translations
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Calls `services/play/quiz.updateQuestion()`. Expects `questionId` in the query string and
 *       a multipart `questions` field containing a JSON stringified array. The English entry updates
 *       the main question; non-English entries update or create translations.
 *     parameters:
 *       - in: query
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/QuizQuestionUpdateRequest'
 *     responses:
 *       200:
 *         description: Question updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/QuizQuestionRecord'
 *   delete:
 *     summary: Delete a question and related answers/translations
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/QuestionDeleteResponse'
 *   get:
 *     summary: Fetch questions for a quiz
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Questions fetched successfully
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
 *                         $ref: '#/components/schemas/QuizQuestionRecord'
 */
router.post("/question",auth.verifyToken,upload.single('questionImage'),quizController.createQuestion);
router.put('/question',auth.verifyToken,upload.single('questionImage'),quizController.updateQuestion);
router.delete('/question',auth.verifyToken,quizController.deleteQuestion);
router.get('/question',auth.verifyToken,quizController.fetchQuestions);

/**
 * @swagger
 * /play/:
 *   get:
 *     summary: Fetch playable quiz questions
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Calls `services/play/quiz.playQUiz()`. Filters out previously correct answers for the user,
 *       applies age-based filtering, localizes to the requested language when available, shuffles the
 *       result set, increments `totalPlays`, and creates a quiz activity record.
 *     parameters:
 *       - in: query
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
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
 *           default: 100
 *     responses:
 *       200:
 *         description: Playable questions fetched successfully
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
 *                         $ref: '#/components/schemas/QuizQuestionRecord'
 */
router.get("/",auth.verifyToken,quizController.playQUiz);

/**
 * @swagger
 * /play/progress:
 *   get:
 *     summary: Create or update quiz progress
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Calls `services/play/quiz.saveProgress()`. Use `quizId=0` to save Daily-Challenge progress.
 *       The service creates a progress row when one does not exist, otherwise it updates `currentQuestion`.
 *     parameters:
 *       - in: query
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: currentQuestion
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Progress saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/QuizProgressRecord'
 */
router.get("/progress",auth.verifyToken,quizController.saveProgress);

/**
 * @swagger
 * /play/option:
 *   post:
 *     summary: Mark a lifeline option as used
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     description: Calls `services/play/quiz.useOptions()`. Supported option values are `fiftyFifty`, `timer`, `Skip`, and `phone`.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: optionName
 *         required: true
 *         schema:
 *           type: string
 *           enum: [fiftyFifty, timer, Skip, phone]
 *     responses:
 *       200:
 *         description: Lifeline status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/QuizProgressRecord'
 */
router.post('/option',auth.verifyToken,quizController.useOptions)

/**
 * @swagger
 * /play/daily-challenge:
 *   get:
 *     summary: Fetch daily challenge questions
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     description: Calls `services/play/quiz.dailyChallenge()`. Accepted `lang` values are `eng` and `guj`.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Daily challenge fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DailyChallengeResponse'
 */
router.get('/daily-challenge',auth.verifyToken,quizController.dailyChallenge)

/**
 * @swagger
 * /play/answer:
 *   post:
 *     summary: Save or update a user's answer for a quiz question
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     description: Calls `services/play/quiz.quizAnswer()`. The `option` field is accepted by the controller but is not persisted by the current service logic.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuizAnswerRequest'
 *     responses:
 *       200:
 *         description: Answer saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/QuizAnswerResponse'
 */
router.post('/answer',auth.verifyToken,quizController.quizAnswer);


/**
 * @swagger
 * /play/admin-quiz:
 *   get:
 *     summary: Fetch admin quiz overview with translations and question counts
 *     tags: [Quiz]
 *     responses:
 *       200:
 *         description: Admin quizzes fetched successfully
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
 *                         $ref: '#/components/schemas/QuizAdminSummary'
 */
router.get('/admin-quiz',quizController.fetchadminQuizzes);

/**
 * @swagger
 * /play/admin-questions:
 *   get:
 *     summary: Fetch admin question details with translations
 *     tags: [Quiz]
 *     parameters:
 *       - in: query
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Admin questions fetched successfully
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
 *                         $ref: '#/components/schemas/QuizAdminQuestionRecord'
 */
router.get('/admin-questions',quizController.fetchadminquestions);

/**
 * @swagger
 * /play/upload-questions:
 *   post:
 *     summary: Bulk import quiz questions from an Excel file
 *     tags: [Quiz]
 *     description: Calls `services/play/quiz.createQuestionFromExcel()`. Requires multipart form-data with `quizId` and an Excel-compatible file in the `file` field.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/QuizExcelUploadRequest'
 *     responses:
 *       200:
 *         description: Questions imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/QuizExcelImportResult'
 */
router.post('/upload-questions',file_upload.single('file'),quizController.createQuestionFromExcel);
export default router;;
