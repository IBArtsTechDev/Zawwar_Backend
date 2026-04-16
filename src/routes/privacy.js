import express from "express";
import termsController from "../controler/privacy.js";
const router = express.Router();
import upload from "../utlis/upload.js";
import validate from "../middleware/validators/validate.js";
import auth from "../middleware/authToken.js";

/**
 * @swagger
 * tags:
 *   - name: Privacy
 *     description: Admin privacy policy management APIs
 */

/**
 * @swagger
 * /admin/privacy:
 *   get:
 *     summary: Fetch privacy policies, or fetch one privacy policy by language
 *     tags: [Privacy]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       The route file registers two GET handlers on the same `/admin/privacy` path.
 *       The first calls `privacyController.fetchTerms` and returns all rows from
 *       `services/privacy.fetchTerms()`. The second calls `privacyController.fetchTermsById`
 *       and expects `language` in the query string, returning a single row from
 *       `services/privacy.fetchTermsById()`. In practice, this endpoint is used in
 *       two ways: `GET /admin/privacy` to fetch all privacy policies, and
 *       `GET /admin/privacy?language=English|Gujarati` to fetch a single policy.
 *     parameters:
 *       - in: query
 *         name: language
 *         required: false
 *         schema:
 *           type: string
 *           enum: [English, Gujarati]
 *         example: English
 *         description: When provided, the request is intended to resolve to the single-language lookup handled by `fetchTermsById`.
 *     responses:
 *       200:
 *         description: Privacy policy fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       oneOf:
 *                         - $ref: '#/components/schemas/PrivacyListResponseData'
 *                         - $ref: '#/components/schemas/PrivacyRecord'
 *             examples:
 *               fetchAllPrivacy:
 *                 summary: Fetch all privacy policies
 *                 value:
 *                   success: true
 *                   message: policy fetched successfully
 *                   data:
 *                     - id: 1
 *                       content: This privacy policy explains how data is collected and used.
 *                       language: English
 *                     - id: 2
 *                       content: Aa privacy policy data vaparash vishe samjave chhe.
 *                       language: Gujarati
 *               fetchPrivacyByLanguage:
 *                 summary: Fetch a single privacy policy by language
 *                 value:
 *                   success: true
 *                   message: Terms fetch for Id
 *                   data:
 *                     id: 1
 *                     content: This privacy policy explains how data is collected and used.
 *                     language: English
 *   post:
 *     summary: Create a privacy policy record
 *     tags: [Privacy]
 *     security:
 *       - bearerAuth: []
 *     description: Calls `services/privacy.createTerms()`. The request body must include both `content` and `language`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TermsPrivacyRequest'
 *     responses:
 *       200:
 *         description: Privacy policy created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PrivacyRecord'
 *   put:
 *     summary: Update a privacy policy by language
 *     tags: [Privacy]
 *     security:
 *       - bearerAuth: []
 *     description: Calls `services/privacy.updateTerms()`. The service reads `language` from the query string and `content` from the JSON body.
 *     parameters:
 *       - in: query
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *           enum: [English, Gujarati]
 *         example: Gujarati
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TermsPrivacyUpdateRequest'
 *     responses:
 *       200:
 *         description: Privacy policy updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PrivacyRecord'
 */
router.get('/privacy', auth.verifyToken, auth.verifyAdmin, termsController.fetchTerms);
router.get('/privacy', auth.verifyToken, auth.verifyAdmin, termsController.fetchTermsById);
router.post("/privacy", auth.verifyToken, auth.verifyAdmin, termsController.createTerms);
/* router.delete('/privacy', auth.verifyToken, auth.verifyAdmin, termsController.deleteTerms); */
router.put('/privacy', auth.verifyToken, auth.verifyAdmin, termsController.updateTerms)

export default router;;
