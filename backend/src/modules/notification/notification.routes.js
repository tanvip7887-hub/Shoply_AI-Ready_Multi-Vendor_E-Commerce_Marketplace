import { Router } from "express";
import authenticate from "../../middleware/authenticate.middleware.js";
import {
  getNotificationsController,
  getUnreadCountController,
  markAsReadController,
  markAllAsReadController,
} from "./notification.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getNotificationsController);
router.get("/unread-count", getUnreadCountController);
router.patch("/read-all", markAllAsReadController);
router.patch("/:id/read", markAsReadController);

export default router;
