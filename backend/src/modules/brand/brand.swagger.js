/**
 * @openapi
 * tags:
 *   name: Brand
 *   description: Product brand master data
 *
 * /brands:
 *   get:
 *     summary: List all brands (public)
 *     tags: [Brand]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema: { type: string, enum: ["true", "false"] }
 *     responses:
 *       200: { description: Brands fetched }
 *   post:
 *     summary: Create a brand (admin only)
 *     tags: [Brand]
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               logo: { type: string }
 *     responses:
 *       201: { description: Brand created }
 *       409: { description: Duplicate brand name }
 *
 * /brands/{id}:
 *   get:
 *     summary: Get a brand by ID (public)
 *     tags: [Brand]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Brand fetched }
 *       404: { description: Not found }
 *   put:
 *     summary: Update a brand (admin only)
 *     tags: [Brand]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Brand updated }
 *       409: { description: Duplicate brand name }
 *   delete:
 *     summary: Delete a brand (admin only, blocked if products reference it)
 *     tags: [Brand]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Brand deleted }
 *       409: { description: Brand has products, deletion blocked }
 *
 * /brands/{id}/status:
 *   patch:
 *     summary: Activate or deactivate a brand (admin only)
 *     tags: [Brand]
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive: { type: boolean }
 *     responses:
 *       200: { description: Brand status updated }
 */