/**
 * @openapi
 * tags:
 *   name: SellerApplication
 *   description: Seller onboarding application (customer-facing)
 *
 * /seller_applications/draft:
 *   post:
 *     summary: Save or update a draft application
 *     tags: [SellerApplication]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Draft saved }
 *       409: { description: An active non-draft application already exists }
 *
 * /seller_applications/submit:
 *   post:
 *     summary: Submit the application for admin review
 *     tags: [SellerApplication]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Application submitted, status set to PENDING }
 *       409: { description: An active non-draft application already exists }
 *
 * /seller_applications/me:
 *   get:
 *     summary: Get current user's active application
 *     tags: [SellerApplication]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Application fetched }
 *       404: { description: No application found }
 *
 * /seller_applications/documents:
 *   post:
 *     summary: Upload a supporting document
 *     tags: [SellerApplication]
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type: { type: string, enum: [GST_CERTIFICATE, PAN_CARD, ADDRESS_PROOF, CANCELLED_CHEQUE, OTHER] }
 *               document: { type: string, format: binary }
 *     responses:
 *       201: { description: Document uploaded }
 */