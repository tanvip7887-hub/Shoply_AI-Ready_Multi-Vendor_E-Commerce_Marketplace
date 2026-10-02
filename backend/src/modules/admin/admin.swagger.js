/**
 * @openapi
 * tags:
 *   name: Admin
 *   description: Admin dashboard, user, seller, product, and order management
 *
 * /admin/dashboard:
 *   get:
 *     summary: Get platform summary statistics
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Dashboard stats fetched }
 *
 * /admin/users:
 *   get:
 *     summary: List all users
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Users fetched }
 *
 * /admin/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: User fetched }
 *
 * /admin/users/{id}/role:
 *   patch:
 *     summary: Change a user's role
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Role updated }
 *
 * /admin/users/{id}/status:
 *   patch:
 *     summary: Block or unblock a user
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Status updated }
 *       400: { description: Cannot block your own account }
 *
 * /admin/sellers/pending:
 *   get:
 *     summary: List sellers awaiting verification
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Pending sellers fetched }
 *
 * /admin/sellers:
 *   get:
 *     summary: List all sellers
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Sellers fetched }
 *
 * /admin/sellers/{id}/verify:
 *   patch:
 *     summary: Verify a seller
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Seller verified }
 *
 * /admin/sellers/{id}/reject:
 *   patch:
 *     summary: Reject a seller application
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Seller rejected }
 *
 * /admin/sellers/{id}/suspend:
 *   patch:
 *     summary: Suspend a verified seller
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Seller suspended }
 *       400: { description: Seller is not currently verified }
 *
 * /admin/sellers/{id}/unsuspend:
 *   patch:
 *     summary: Restore a suspended seller to verified
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Seller unsuspended }
 *       400: { description: Seller is not currently suspended }
 *
 * /admin/products:
 *   get:
 *     summary: List all products, including inactive/deleted
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Products fetched }
 *
 * /admin/products/{id}/status:
 *   patch:
 *     summary: Activate or hide a product
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Status updated }
 *
 * /admin/products/{id}:
 *   delete:
 *     summary: Soft-delete a product (moderation, not physical removal)
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Product deleted }
 *
 * /admin/orders:
 *   get:
 *     summary: List all orders across the platform
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Orders fetched }
 *
 * /admin/orders/{id}:
 *   get:
 *     summary: Get any order by ID
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Order fetched }
 */