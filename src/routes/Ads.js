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
 *   post:
 *     summary: Create a new ad
 *     tags: [Ads]
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
 *   put:
 *     summary: Update an existing ad
 *     tags: [Ads]
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
router.get('/ads',adsControler.fetchAds);
router.post('/ads/clicked',adsControler.handlwAdsCLicked);
router.post('/ads',upload.single('file'),adsControler.createAds);
router.put('/ads',upload.single('file'),adsControler.updateAds);
router.delete('/ads',adsControler.deleteAds)

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
router.put('/ads-status',adsControler.updateAdsStatus)

export default router;;
