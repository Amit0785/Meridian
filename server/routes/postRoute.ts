import { Router } from "express";
import {
  listPosts,
  getPost,
  createPost,
  updatePost,
  softDeletePost,
  restorePost,
  hardDeletePost,
} from "../Controller/postController";
import { authenticateJWT, optionalAuth } from "../middleware/auth";
import { checkPostOwnershipOrAdmin, requireRole } from "../middleware/rbac";
import { validateRequest } from "../middleware/validation";
import { logActivity } from "../middleware/activityLogger";
import {
  createPostSchema,
  updatePostSchema,
} from "../validations/postValidation";

const router = Router();

router.get("/", optionalAuth, listPosts);
router.get("/:identifier", optionalAuth, getPost);

router.post(
  "/",
  authenticateJWT,
  validateRequest(createPostSchema),
  logActivity(
    "POST_CREATED",
    "post",
    (req) => `Created article "${req.body.title}"`,
  ),
  createPost,
);

router.put(
  "/:id",
  authenticateJWT,
  checkPostOwnershipOrAdmin,
  validateRequest(updatePostSchema),
  logActivity(
    "POST_UPDATED",
    "post",
    (req) => `Updated article ID ${req.params.id}`,
  ),
  updatePost,
);

router.delete(
  "/:id",
  authenticateJWT,
  checkPostOwnershipOrAdmin,
  logActivity(
    "POST_SOFT_DELETED",
    "post",
    (req) => `Soft deleted article ID ${req.params.id}`,
  ),
  softDeletePost,
);

router.patch(
  "/:id/restore",
  authenticateJWT,
  checkPostOwnershipOrAdmin,
  logActivity(
    "POST_RESTORED",
    "post",
    (req) => `Restored article ID ${req.params.id}`,
  ),
  restorePost,
);

router.delete(
  "/:id/permanent",
  authenticateJWT,
  requireRole("admin"),
  logActivity(
    "POST_HARD_DELETED",
    "post",
    (req) => `Permanently deleted article ID ${req.params.id}`,
  ),
  hardDeletePost,
);

export default router;
