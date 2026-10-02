/**
 * @openapi
 * 
 * tags:
 *   name: Cart
 *   description: Shopping cart management (customers only)
 *
 * /cart:
 *   get:
 *     summary: Get current user's cart
 *     tags: [Cart]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Cart fetched, includes items and subtotal }
 *   delete:
 *     summary: Clear the entire cart
 *     tags: [Cart]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Cart cleared }
 *
 * /cart/items:
 *   post:
 *     summary: Add an item to the cart (or increase quantity if it already exists)
 *     tags: [Cart]
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId: { type: integer }
 *               quantity: { type: integer }
 *     responses:
 *       201: { description: Item added }
 *       409: { description: Not enough stock available, or product inactive }
 *
 * /cart/items/{id}:
 *   patch:
 *     summary: Update quantity of a cart item
 *     tags: [Cart]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Item updated }
 *       409: { description: Requested quantity exceeds available stock }
 *   delete:
 *     summary: Remove an item from the cart
 *     tags: [Cart]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Item removed }
 */