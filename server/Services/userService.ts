import { UserModel } from '../schema/userschema';
import { PostModel } from '../schema/postschema';
import { CommentModel } from '../schema/commentschema';
import { dbStore } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class UserService {
  static async listUsers() {
    const users = await UserModel.find();
    return users.map(user => {
      const postsCount = dbStore.posts.filter(p => p.author === user._id && !p.isDeleted).length;
      const commentsCount = dbStore.comments.filter(c => c.author === user._id && !c.isDeleted).length;
      return {
        ...UserModel.sanitize(user),
        postsCount,
        commentsCount,
      };
    });
  }

  static async findByEmail(email: string) {
    return UserModel.findOne({ email: email.toLowerCase() });
  }

  static async updateUserRole(userId: string, newRole: 'admin' | 'user', currentAdminId: string) {
    if (userId === currentAdminId && newRole !== 'admin') {
      throw new AppError('Cannot demote your own admin account', 400, 'CANNOT_DEMOTE_SELF');
    }

    const updated = await UserModel.findByIdAndUpdate(userId, { role: newRole });
    if (!updated) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return UserModel.sanitize(updated);
  }

  static async toggleUserStatus(userId: string, currentAdminId: string) {
    if (userId === currentAdminId) {
      throw new AppError('Cannot suspend your own admin account', 400, 'CANNOT_SUSPEND_SELF');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const updated = await UserModel.findByIdAndUpdate(userId, { status: newStatus });
    return UserModel.sanitize(updated!);
  }

  static async deleteUser(userId: string, currentAdminId: string) {
    if (userId === currentAdminId) {
      throw new AppError('Cannot delete your own admin account', 400, 'CANNOT_DELETE_SELF');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    await UserModel.findByIdAndDelete(userId);
    // Mark user's posts as soft deleted
    dbStore.posts.forEach(p => {
      if (p.author === userId) {
        p.isDeleted = true;
        p.deletedAt = new Date().toISOString();
      }
    });

    return { success: true, message: 'User deleted and their posts archived.' };
  }

  static async getPlatformStats() {
    const totalUsers = await UserModel.countDocuments();
    const adminUsers = await UserModel.countDocuments({ role: 'admin' });
    const regularUsers = totalUsers - adminUsers;

    const totalPosts = await PostModel.countDocuments();
    const publishedPosts = await PostModel.countDocuments({ isDeleted: false });
    const deletedPosts = await PostModel.countDocuments({ isDeleted: true });

    const totalComments = await CommentModel.countDocuments({ isDeleted: false });

    // Category breakdown
    const categoryStats: Record<string, number> = {};
    dbStore.posts
      .filter(p => !p.isDeleted)
      .forEach(p => {
        categoryStats[p.category] = (categoryStats[p.category] || 0) + 1;
      });

    const totalViews = dbStore.posts.reduce((sum, p) => sum + (p.views || 0), 0);

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
      categoryStats,
    };
  }
}
