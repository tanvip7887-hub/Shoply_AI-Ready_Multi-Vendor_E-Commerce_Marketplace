/**
 * @openapi
 * tags:
 *   name: User
 *   description: Profile and address management
 *
 * /users/me:
 *   get:
 *     summary: Get current user's full profile
 *     tags: [User]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Profile fetched }
 *   put:
 *     summary: Update current user's profile
 *     tags: [User]
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *     responses:
 *       200: { description: Profile updated }
 *
 * /users/me/avatar:
 *   patch:
 *     summary: Upload/replace profile picture
 *     tags: [User]
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar: { type: string, format: binary }
 *     responses:
 *       200: { description: Profile picture updated }
 *
 * /users/me/addresses:
 *   get:
 *     summary: List current user's addresses
 *     tags: [User]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Addresses fetched }
 *   post:
 *     summary: Add a new address
 *     tags: [User]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       201: { description: Address added }
 *
 * /users/me/addresses/{id}:
 *   put:
 *     summary: Update an address
 *     tags: [User]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Address updated }
 *   delete:
 *     summary: Delete an address
 *     tags: [User]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Address deleted }
 *
 * /users/me/addresses/{id}/default:
 *   patch:
 *     summary: Set an address as default
 *     tags: [User]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Default address updated }
 */