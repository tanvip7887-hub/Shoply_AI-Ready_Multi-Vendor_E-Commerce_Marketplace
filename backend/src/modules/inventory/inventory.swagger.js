/**
 * @openapi
 * tags:
 *   name: Inventory
 *   description: Stock management (owner seller or admin only)
 *
 * /inventory:
 *   post:
 *     summary: Create an inventory record for a product
 *     tags: [Inventory]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       201: { description: Inventory created }
 *       403: { description: Not the product owner }
 *       409: { description: Inventory already exists for this product }
 *
 * /inventory/{productId}:
 *   get:
 *     summary: Get inventory for a product (owner seller or admin)
 *     tags: [Inventory]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Inventory fetched }
 *       404: { description: No inventory record found }
 *   patch:
 *     summary: Update stock level for a product (owner seller or admin)
 *     tags: [Inventory]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Inventory updated }
 *       400: { description: Stock below currently reserved amount }
 */