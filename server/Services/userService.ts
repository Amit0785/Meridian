import { User, findUsers, findUserById, findUserByEmail, updateUserById, deleteUserById, sanitizeUser } from '../schema/userschema';
import { Post } from '../schema/postschema';
import { Comment } from '../schema/commentschema';
import { AppError } from '../middleware/errorHandler';

export async function listUsersService() {
  const users = await findUsers();
  return Promise.all(
    users.map(async user => {
      const postsCount = await Post.countDocuments({ author: user._id, isDeleted: false });
      const commentsCount = await Comment.countDocuments({ author: user._id, isDeleted: false });
      return {
        ...sanitizeUser(user),
        postsCount,
        commentsCount,
      };
    })
  );
}

export async function findUserByEmailService(email: string) {
  return findUserByEmail(email);
}

export async function updateUserRoleService(userId: string, newRole: 'admin' | 'user', currentAdminId: string) {
  if (userId === currentAdminId && newRole !== 'admin') {
    throw new AppError('Cannot demote your own admin account', 400, 'CANNOT_DEMOTE_SELF');
  }

  const updated = await updateUserById(userId, { userRole: newRole, role: newRole });
  if (!updated) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  return sanitizeUser(updated);
}

export async function toggleUserStatusService(userId: string, currentAdminId: string) {
  if (userId === currentAdminId) {
    throw new AppError('Cannot suspend your own admin account', 400, 'CANNOT_SUSPEND_SELF');
  }

  const user = await findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const newStatus = user.status === 'active' ? 'suspended' : 'active';
  const updated = await updateUserById(userId, { status: newStatus });
  return sanitizeUser(updated!);
}

export async function deleteUserService(userId: string, currentAdminId: string) {
  if (userId === currentAdminId) {
    throw new AppError('Cannot delete your own admin account', 400, 'CANNOT_DELETE_SELF');
  }

  const user = await findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  await deleteUserById(userId);
  // Mark user's posts as soft deleted in MongoDB
  await Post.updateMany({ author: userId }, { isDeleted: true, deletedAt: new Date() });

  return { success: true, message: 'User deleted and their posts archived.' };
}

export async function getPlatformStatsService() {
  const totalUsers = await User.countDocuments();
  const adminUsers = await User.countDocuments({ $or: [{ userRole: 'admin' }, { role: 'admin' }] });
  const regularUsers = totalUsers - adminUsers;

  const totalPosts = await Post.countDocuments();
  const publishedPosts = await Post.countDocuments({ isDeleted: false });
  const deletedPosts = await Post.countDocuments({ isDeleted: true });

  const totalComments = await Comment.countDocuments({ isDeleted: false });

  // Aggregate total views across all posts
  const viewAggregation = await Post.aggregate([
    { $group: { _id: null, totalViews: { $sum: '$views' } } },
  ]);
  const totalViews = viewAggregation[0]?.totalViews || 0;

  return {
    overview: {
      totalUsers,
      adminUsers,
      regularUsers,
      totalPosts,
      publishedPosts,
      deletedPosts,
      totalComments,
      totalViews,
    },
  };
}

// Function object namespace for backwards compatibility (no class)
export const UserService = {
  listUsers: listUsersService,
  findByEmail: findUserByEmailService,
  updateUserRole: updateUserRoleService,
  toggleUserStatus: toggleUserStatusService,
  deleteUser: deleteUserService,
  getPlatformStats: getPlatformStatsService,
};
