import { Router } from "express";
import { getHealth } from "../controllers/health.controller.js";

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy
 */
router.get("/", getHealth);

export default router;