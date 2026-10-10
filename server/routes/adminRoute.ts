import { Router } from 'express';
import {
  getStats,
  listUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getActivityLogs,
  getTrashPosts,
} from '../Controller/adminController';
import { authenticateJWT } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { logActivity } from '../middleware/activityLogger';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole('admin'));

router.get('/stats', getStats);
router.get('/users', listUsers);

router.patch(
  '/users/:userId/role',
  logActivity('ADMIN_ROLE_UPDATED', 'user', req => `Role updated for user ${req.params.userId} to ${req.body.role}`),
  updateUserRole
);

router.patch(
  '/users/:userId/status',
  logActivity('ADMIN_USER_STATUS_TOGGLED', 'user', req => `Status toggled for user ${req.params.userId}`),
  toggleUserStatus
);

router.delete(
  '/users/:userId',
  logActivity('ADMIN_USER_DELETED', 'user', req => `User account deleted: ${req.params.userId}`),
  deleteUser
);

router.get('/activity-logs', getActivityLogs);
router.get('/trash-posts', getTrashPosts);

export default router;
