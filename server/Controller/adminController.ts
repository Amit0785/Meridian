import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { UserService } from "../Services/userService";
import { PostModel } from "../schema/postschema";
import { ActivityLogModel } from "../schema/activitylogschema";
import { catchAsync } from "../utils/catchAsync";
import { status } from "../utils/status";

/**
 * Get platform overview metrics and statistics
 */
export const getStats = catchAsync(
  async (_req: AuthenticatedRequest, res: Response) => {
    const stats = await UserService.getPlatformStats();
    res.status(status.OK).json({
      success: true,
      statusCode: status.OK,
      data: stats,
    });
  },
);

/**
 * List all users with post/comment counts and roles
 */
export const listUsers = catchAsync(
  async (_req: AuthenticatedRequest, res: Response) => {
    const users = await UserService.listUsers();
    res.status(status.OK).json({
      success: true,
      statusCode: status.OK,
      data: users,
    });
  },
);

/**
 * Update a user's role (admin <-> user)
 */
export const updateUserRole = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    const { role } = req.body;
    const currentAdminId = req.user!._id;

    const updated = await UserService.updateUserRole(
      userId,
      role,
      currentAdminId,
    );

    res.status(status.OK).json({
      success: true,
      statusCode: status.OK,
      message: `User role updated to ${role}`,
      data: updated,
    });
  },
);

/**
 * Toggle a user's status (active <-> suspended)
 */
export const toggleUserStatus = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    const currentAdminId = req.user!._id;

    const updated = await UserService.toggleUserStatus(userId, currentAdminId);

    res.status(status.OK).json({
      success: true,
      statusCode: status.OK,
      message: `User status updated to ${updated.status}`,
      data: updated,
    });
  },
);

/**
 * Delete a user account and archive their posts
 */
export const deleteUser = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    const currentAdminId = req.user!._id;

    const result = await UserService.deleteUser(userId, currentAdminId);

    res.status(status.OK).json({
      success: true,
      statusCode: status.OK,
      message: "User account removed and posts archived",
      data: result,
    });
  },
);

/**
 * Get system activity logs
 */
export const getActivityLogs = catchAsync(
  async (_req: AuthenticatedRequest, res: Response) => {
    const logs = await ActivityLogModel.findRecent(100);
    res.status(status.OK).json({
      success: true,
      statusCode: status.OK,
      data: logs,
    });
  },
);

/**
 * Get all soft-deleted posts for admin trash inspection
 */
export const getTrashPosts = catchAsync(
  async (_req: AuthenticatedRequest, res: Response) => {
    const trashed = await PostModel.findWithPagination({
      includeDeleted: true,
      page: 1,
      limit: 100,
    });

    const onlyDeleted = trashed.posts.filter((p: any) => p.isDeleted);

    res.status(status.OK).json({
      success: true,
      statusCode: status.OK,
      data: onlyDeleted,
    });
  },
);

// Backward compatibility controller object
export const AdminController = {
  getStats,
  listUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getActivityLogs,
  getTrashPosts,
};

export default AdminController;
