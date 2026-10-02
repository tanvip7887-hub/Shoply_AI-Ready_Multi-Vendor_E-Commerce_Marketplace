/**
 * @openapi
 * tags:
 *   name: Wishlist
 *   description: Save products for later
 *
 * /wishlist:
 *   get:
 *     summary: Get current user's wishlist
 *     tags: [Wishlist]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Wishlist fetched }
 *
 * /wishlist/{productId}:
 *   post:
 *     summary: Add a product to the wishlist
 *     tags: [Wishlist]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       201: { description: Added to wishlist }
 *       404: { description: Product not found or inactive }
 *       409: { description: Already in wishlist }
 *   delete:
 *     summary: Remove a product from the wishlist (idempotent)
 *     tags: [Wishlist]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Removed from wishlist (safe even if not present) }
 */