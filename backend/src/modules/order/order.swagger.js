/**
 * @openapi
 * tags:
 *   name: Order
 *   description: Order placement and management
 *
 * /orders:
 *   post:
 *     summary: Place an order from the current cart (splits into one order per seller)
 *     tags: [Order]
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [addressId]
 *             properties:
 *               addressId: { type: integer }
 *               paymentMethod: { type: string, enum: [COD] }
 *     responses:
 *       201: { description: Orders placed (array, one per seller) }
 *       400: { description: Cart is empty }
 *       409: { description: Insufficient stock or inactive product }
 *   get:
 *     summary: Get current user's orders
 *     tags: [Order]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Orders fetched }
 *
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID (own orders only)
 *     tags: [Order]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Order fetched }
 *       404: { description: Not found }
 *
 * /orders/{id}/cancel:
 *   patch:
 *     summary: Cancel an order (only if PENDING or CONFIRMED)
 *     tags: [Order]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Order cancelled, stock restored }
 *       409: { description: Order can no longer be cancelled }
 *
 * /seller/orders:
 *   get:
 *     summary: Get orders placed against the current seller
 *     tags: [Order]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Seller orders fetched }
 *
 * /seller/orders/{id}/status:
 *   patch:
 *     summary: Update order status (seller, own orders only)
 *     tags: [Order]
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderStatus]
 *             properties:
 *               orderStatus: { type: string, enum: [CONFIRMED, SHIPPED, DELIVERED] }
 *     responses:
 *       200: { description: Status updated }
 *       400: { description: Invalid status transition }
 */