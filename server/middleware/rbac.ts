import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth";
import { PostModel } from "../schema/postschema";
import { CommentModel } from "../schema/commentschema";

export const requireRole = (...roles: ("admin" | "user")[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Authentication required.",
        error: { code: "UNAUTHORIZED" },
      });
      return;
    }

    const role = req.user.userRole || req.user.role;
    if (!roles.includes(role as any)) {
      res.status(403).json({
        success: false,
        statusCode: 403,
        message: `Forbidden: Access restricted to roles [${roles.join(", ")}]. Current role: '${role}'`,
        error: {
          code: "FORBIDDEN_ROLE",
          requiredRoles: roles,
          currentRole: role,
        },
      });
      return;
    }

    next();
  };
};

export const checkPostOwnershipOrAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!req.user) {
      res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Authentication required.",
        error: { code: "UNAUTHORIZED" },
      });
      return;
    }

    // Include deleted in lookup in case admin wants to restore
    const post = await PostModel.findById(id, true);
    if (!post) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Post not found.",
        error: { code: "POST_NOT_FOUND" },
      });
      return;
    }

    const role = req.user.userRole || req.user.role;
    const isAdmin = role === "admin";
    const authorId =
      typeof post.author === "object" ? post.author._id : post.author;

    const isOwner = authorId?.toString() === req.user._id?.toString();

    if (!isAdmin && !isOwner) {
      res.status(403).json({
        success: false,
        statusCode: 403,
        message: "Permission denied: You can only modify your own posts.",
        error: { code: "FORBIDDEN_OWNERSHIP" },
      });
      return;
    }

    // Attach post for controller reuse
    (req as any).targetPost = post;
    next();
  } catch (err: any) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to verify post permissions.",
      error: { details: err.message },
    });
  }
};

export const checkCommentOwnershipOrAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { commentId } = req.params;
    if (!req.user) {
      res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Authentication required.",
        error: { code: "UNAUTHORIZED" },
      });
      return;
    }

    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Comment not found.",
        error: { code: "COMMENT_NOT_FOUND" },
      });
      return;
    }

    const role = req.user.userRole || req.user.role;
    const isAdmin = role === "admin";
    const authorId =
      typeof comment.author === "object" ? comment.author._id : comment.author;
    const isOwner = authorId === req.user._id;

    if (!isAdmin && !isOwner) {
      res.status(403).json({
        success: false,
        statusCode: 403,
        message: "Permission denied: You can only modify your own comments.",
        error: { code: "FORBIDDEN_OWNERSHIP" },
      });
      return;
    }

    (req as any).targetComment = comment;
    next();
  } catch (err: any) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to verify comment permissions.",
      error: { details: err.message },
    });
  }
};
