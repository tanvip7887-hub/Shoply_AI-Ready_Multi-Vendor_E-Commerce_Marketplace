/**
 * @openapi
 * tags:
 *   name: Product
 *   description: Product listing and management
 *
 * /products:
 *   get:
 *     summary: List products (public, filterable)
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema: { type: integer }
 *       - in: query
 *         name: brandId
 *         schema: { type: integer }
 *       - in: query
 *         name: sellerId
 *         schema: { type: integer }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Matches product name, description, or brand name
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [price_asc, price_desc, newest] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Products fetched }
 *   post:
 *     summary: Create a product (verified sellers only)
 *     tags: [Product]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       201: { description: Product created }
 *       403: { description: Not a verified seller }
 *
 * /products/me:
 *   get:
 *     summary: Get current seller's own products
 *     tags: [Product]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Products fetched }
 *
 * /products/{id}:
 *   get:
 *     summary: Get product by ID (public)
 *     tags: [Product]
 *     responses:
 *       200: { description: Product fetched }
 *       404: { description: Not found }
 *   put:
 *     summary: Update product (owner seller or admin)
 *     tags: [Product]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Product updated }
 *       403: { description: Not the owner }
 *   delete:
 *     summary: Delete product (owner seller or admin)
 *     tags: [Product]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Product deleted }
 *
 * /products/{id}/status:
 *   patch:
 *     summary: Activate/deactivate product (owner seller or admin)
 *     tags: [Product]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Status updated }
 *
 * /products/slug/{slug}:
 *   get:
 *     summary: Get product by slug (public)
 *     tags: [Product]
 *     responses:
 *       200: { description: Product fetched }
 *
 * /products/{id}/images:
 *   post:
 *     summary: Upload product images (owner seller or admin)
 *     tags: [Product]
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       200: { description: Images added }
 *
 * /products/{id}/images/{imageId}:
 *   delete:
 *     summary: Remove a product image (owner seller or admin)
 *     tags: [Product]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Image removed }
 */