/**
 * @openapi
 * tags:
 *   name: Category
 *   description: Product category management (hierarchical)
 *
 * /categories:
 *   get:
 *     summary: List all categories (public)
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: parentId
 *         schema: { type: string }
 *         description: Filter by parent ID, or "null" for top-level only
 *     responses:
 *       200: { description: Categories fetched }
 *   post:
 *     summary: Create a category (admin only)
 *     tags: [Category]
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
 *               description: { type: string }
 *               image: { type: string }
 *               parentId: { type: integer }
 *     responses:
 *       201: { description: Category created }
 *       403: { description: Not an admin }
 *
 * /categories/{id}:
 *   get:
 *     summary: Get a category by ID (public)
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Category fetched }
 *       404: { description: Not found }
 *   put:
 *     summary: Update a category (admin only)
 *     tags: [Category]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Category updated }
 *       403: { description: Not an admin }
 *   delete:
 *     summary: Delete a category (admin only, fails if it has subcategories)
 *     tags: [Category]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Category deleted }
 *       409: { description: Has subcategories, deletion blocked }
 *
 * /categories/slug/{slug}:
 *   get:
 *     summary: Get a category by slug (public)
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Category fetched }
 *       404: { description: Not found }
 */