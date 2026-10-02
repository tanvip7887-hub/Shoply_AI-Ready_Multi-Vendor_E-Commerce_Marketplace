/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: Authentication & authorization endpoints
 *
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [CUSTOMER, SELLER] }
 *     responses:
 *       201: { description: Registered successfully }
 *       409: { description: Email already registered }
 *
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Logged in, sets accessToken/refreshToken cookies }
 *       401: { description: Invalid credentials }
 *
 * /auth/logout:
 *   post:
 *     summary: Logout current session
 *     tags: [Auth]
 *     responses:
 *       200: { description: Logged out }
 *
 * /auth/refresh-token:
 *   post:
 *     summary: Rotate access/refresh tokens
 *     tags: [Auth]
 *     responses:
 *       200: { description: Tokens refreshed }
 *       401: { description: Invalid or expired refresh token }
 *
 * /auth/reset-password:
 *   post:
 *     summary: Direct password reset (V1)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, newPassword, confirmPassword]
 *             properties:
 *               email: { type: string }
 *               newPassword: { type: string }
 *               confirmPassword: { type: string }
 *     responses:
 *       200: { description: Password reset successfully }
 *       404: { description: User not found }
 *       422: { description: Validation error }
 *
 * /auth/change-password:
 *   patch:
 *     summary: Change password while logged in
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200: { description: Password changed successfully }
 *       401: { description: Incorrect current password or not authenticated }
 *
 * /auth/verify-email/{token}:
 *   get:
 *     summary: Verify email using emailed token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Email verified successfully }
 *
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200: { description: Returns current user id and role }
 *       401: { description: Not authenticated }
 */