import express from "express";
import adsControler from "../controler/ads/ads.js";
const router = express.Router();
import upload from "../utlis/upload.js";
import auth from "../middleware/authToken.js";

/**
 * @swagger
 * tags:
 *   - name: Ads
 *     description: Admin ad management and click tracking APIs
 */

/**
 * @swagger
 * /admin/ads:
 *   get:
 *     summary: Fetch ads by type and optional language
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Banner, Video]
 *       - in: query
 *         name: language
 *         required: false
 *         schema:
 *           type: string
 *           enum: [guj, en]
 *         description: Applied only for video ads
 *     responses:
 *       200:
 *         description: Ads fetched successfully
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
 *                         $ref: '#/components/schemas/AdsRecord'
 *   put:
 *     summary: Update an existing ad
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: adsId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/AdsUpdateRequest'
 *     responses:
 *       200:
 *         description: Ad updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AdsRecord'
 *   delete:
 *     summary: Delete an ad
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: adsId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ad deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       nullable: true
 *                       example: null
 */
router.get('/ads',auth.verifyToken, auth.verifyAdmin, adsControler.fetchAds);
router.post('/ads', auth.verifyToken, auth.verifyAdmin, upload.single('file'),adsControler.createAds);
router.put('/ads', auth.verifyToken, auth.verifyAdmin, upload.single('file'),adsControler.updateAds);
router.delete('/ads', auth.verifyToken, auth.verifyAdmin, adsControler.deleteAds)



/**
 * @swagger
 * /admin/ads/clicked:
 *   post:
 *     summary: Create a new ad
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/AdsCreateRequest'
 *     responses:
 *       200:
 *         description: Ad created successfully
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
 *                           $ref: '#/components/schemas/AdsRecord' 
*/
router.post('/ads/clicked', auth.verifyToken, auth.verifyAdmin, adsControler.handlwAdsCLicked);
/**
 * @swagger
 * /admin/ads/clicked:
 *   post:
 *     summary: Increment the click count for an ad
 *     tags: [Ads]
 *     parameters:
 *       - in: query
 *         name: adsId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: integer
 *         description: Accepted by the route but not used by the current service logic
 *     responses:
 *       200:
 *         description: Ad click tracked successfully
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

/**
 * @swagger
 * /admin/ads-status:
 *   put:
 *     summary: Update ad active status
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: adsId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: isActive
 *         required: true
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Ad status updated successfully
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
router.put('/ads-status', auth.verifyToken, auth.verifyAdmin, adsControler.updateAdsStatus)

export default router;;
