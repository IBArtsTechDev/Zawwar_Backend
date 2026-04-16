import express from "express";
import termsController from "../controler/terms.js";
const router = express.Router();
import upload from "../utlis/upload.js";
import validate from "../middleware/validators/validate.js";
import auth from "../middleware/authToken.js";

/**
 * @swagger
 * tags:
 *   - name: Terms
 *     description: Admin terms and conditions management APIs
 */

/**
 * @swagger
 * /admin/terms:
 *   get:
 *     summary: Fetch all terms records
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     description: Calls `termsController.fetchTerms`, which delegates to `services/terms.fetchTerms()` and returns every terms row from `db.terms.findAll()`.
 *     responses:
 *       200:
 *         description: Terms fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TermsListResponseData'
 *   post:
 *     summary: Create a terms record
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     description: Calls `services/terms.createTerms()`. The request body must include both `content` and `language`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TermsPrivacyRequest'
 *     responses:
 *       200:
 *         description: Terms created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TermsRecord'
 *   put:
 *     summary: Update terms by language
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     description: Calls `services/terms.updateTerms()`. The service reads `language` from the query string and `content` from the JSON body.
 *     parameters:
 *       - in: query
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *           enum: [English, Gujarati]
 *         example: English
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TermsPrivacyUpdateRequest'
 *     responses:
 *       200:
 *         description: Terms updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TermsRecord'
 */
router.get('/terms', auth.verifyToken, auth.verifyAdmin, termsController.fetchTerms);
router.post("/terms", auth.verifyToken, auth.verifyAdmin, termsController.createTerms);
router.put('/terms', auth.verifyToken, auth.verifyAdmin, termsController.updateTerms)

/**
 * @swagger
 * /admin/term:
 *   get:
 *     summary: Fetch terms by language
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     description: Calls `termsController.fetchTermsById`, which uses `services/terms.fetchTermsById()` and expects `language` in the query string. Despite the message saying "Id", the service actually filters by `language`.
 *     parameters:
 *       - in: query
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *           enum: [English, Gujarati]
 *         example: Gujarati
 *     responses:
 *       200:
 *         description: Terms fetched successfully for the requested language
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TermsRecord'
 */
router.get('/term', auth.verifyToken, auth.verifyAdmin, termsController.fetchTermsById);

/**
 * @swagger
 * /admin/teams:
 *   delete:
 *     summary: Delete a terms record by id
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     description: Calls `services/terms.deleteTerms()`. The route path is `/admin/teams` in the current codebase and is documented as-is.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *            schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Terms deleted successfully
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
 *                           example: Terms deleted successfully
 */
router.delete('/teams', auth.verifyToken, auth.verifyAdmin, termsController.deleteTerms);

export default router;;
