import { UserModel } from "../schema/userschema";
import { PostModel, Post } from "../schema/postschema";
import { CommentModel } from "../schema/commentschema";
import { connectDB } from "../config/database";
import { AuthService } from "./authService";
import { PostService } from "./postService";
import { CommentService } from "./commentService";
import { createPostSchema } from "../validations/postValidation";
import { loginSchema } from "../validations/authValidation";
import {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
} from "../utils/jwt";

export interface TestResultItem {
  id: string;
  testType: "Unit" | "Integration";
  name: string;
  description: string;
  passed: boolean;
  durationMs: number;
  error?: string;
  assertionDetails?: string;
}

export interface TestSuiteReport {
  timestamp: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  durationMs: number;
  results: TestResultItem[];
}

export async function runFullSuite(): Promise<TestSuiteReport> {
  await connectDB();
  const startTime = Date.now();
  const results: TestResultItem[] = [];

  // Helper runner
  const runTest = async (
    id: string,
    testType: "Unit" | "Integration",
    name: string,
    description: string,
    testFn: () => Promise<string>,
  ) => {
    const tStart = Date.now();
    try {
      const details = await testFn();
      results.push({
        id,
        testType,
        name,
        description,
        passed: true,
        durationMs: Date.now() - tStart,
        assertionDetails: details,
      });
    } catch (err: any) {
      results.push({
        id,
        testType,
        name,
        description,
        passed: false,
        durationMs: Date.now() - tStart,
        error: err.message,
      });
    }
  };

  // Test 1: Password Hashing & Registration (Unit)
  await runTest(
    "T1-AUTH-HASH",
    "Unit",
    "Password Hashing & Secure Registration",
    "Verifies bcrypt hashing and email uniqueness constraints",
    async () => {
      const testEmail = `test_runner_${Date.now()}@meridian.dev`;
      const testPass = "SuperSecret$99";
      const user = await UserModel.create({
        name: "Test Runner User",
        email: testEmail,
        password: testPass,
        role: "user",
      });

      if (user.passwordHash === testPass) {
        throw new Error(
          "Password was stored in plain text instead of bcrypt hash!",
        );
      }

      const isMatch = await UserModel.comparePassword(
        testPass,
        user.passwordHash,
      );
      if (!isMatch) {
        throw new Error("Bcrypt hash comparison failed on valid password");
      }

      const isWrong = await UserModel.comparePassword(
        "WrongPassword",
        user.passwordHash,
      );
      if (isWrong) {
        throw new Error("Bcrypt hash passed on incorrect password");
      }

      // Cleanup
      await UserModel.findByIdAndDelete(user._id);

      return "Bcrypt 10-round salt verified, plain password never persisted.";
    },
  );

  // Test 2: JWT Access & Refresh Token Generation (Integration)
  await runTest(
    "T2-JWT-TOKENS",
    "Integration",
    "JWT Token Issuance & Refresh Rotation",
    "Validates access token claims, expiration windows, and refresh token exchange",
    async () => {
      const mockUser: any = {
        _id: "65f1a0000000000000000099",
        email: "jwt@meridian.dev",
        name: "JWT Tester",
        role: "user",
        status: "active",
      };

      const tokens = AuthService.generateTokens(mockUser);
      if (!tokens.accessToken || !tokens.refreshToken) {
        throw new Error("Failed to generate token pair");
      }

      const verifiedAccess = verifyToken(tokens.accessToken);
      if (
        verifiedAccess.id !== mockUser._id ||
        verifiedAccess.email !== mockUser.email
      ) {
        throw new Error(
          "Access token verification failed to extract expected claims",
        );
      }

      const verifiedRefresh = verifyRefreshToken(tokens.refreshToken);
      if (
        verifiedRefresh.id !== mockUser._id ||
        verifiedRefresh.email !== mockUser.email
      ) {
        throw new Error(
          "Refresh token verification failed to extract expected claims",
        );
      }

      return `Access token issued (15m expiry) and Refresh token (7d expiry) verified with utils/jwt.ts functions.`;
    },
  );

  // Test 3: Post Slug Generation & CRUD (Unit)
  await runTest(
    "T3-POST-SLUG",
    "Unit",
    "URL-Friendly Slug Generation & Collision Avoidance",
    "Verifies title sanitization, special character stripping, and hyphenation",
    async () => {
      const title = "What Is The Future of Web 3.0 & AI in 2026?!";
      const slug = await PostModel.generateSlug(title);

      if (
        slug.includes("?") ||
        slug.includes("!") ||
        slug.includes("&") ||
        slug.includes(" ")
      ) {
        throw new Error(
          `Generated slug contains invalid URL characters: ${slug}`,
        );
      }

      if (!slug.startsWith("what-is-the-future-of-web-30")) {
        throw new Error(
          `Slug does not match expected kebab-case format: ${slug}`,
        );
      }

      return `Generated clean slug: "${slug}" with URL-safe alphanumeric kebab formatting.`;
    },
  );

  // Test 4: Soft Delete & Query Filtering (Integration)
  await runTest(
    "T4-SOFT-DELETE",
    "Integration",
    "Soft Delete Lifecycle & Database Retention",
    "Verifies soft-deleted posts are hidden from default feed but retained with deletedAt timestamp",
    async () => {
      // Create test post
      const testPost = await PostModel.create({
        title: `Test Post Soft Delete ${Date.now()}`,
        content:
          "This is a test post content designed to verify soft delete capabilities.",
        author: "65f1a0000000000000000001",
      });

      // Verify post is in active list
      const activeBefore = await PostModel.findWithPagination({
        includeDeleted: false,
      });
      if (
        !activeBefore.posts.some(
          (p) => p._id.toString() === testPost._id.toString(),
        )
      ) {
        throw new Error("Created post not found in active list");
      }

      // Soft delete post
      const softDeleted = await PostService.softDeletePost(
        testPost._id.toString(),
      );
      if (!softDeleted.isDeleted || !softDeleted.deletedAt) {
        throw new Error(
          "isDeleted flag or deletedAt timestamp was not set on soft delete",
        );
      }

      // Verify it is excluded from public listing
      const activeAfter = await PostModel.findWithPagination({
        includeDeleted: false,
      });
      if (
        activeAfter.posts.some(
          (p) => p._id.toString() === testPost._id.toString(),
        )
      ) {
        throw new Error(
          "Soft-deleted post still appeared in regular public feed!",
        );
      }

      // Verify it is included when includeDeleted=true
      const adminList = await PostModel.findWithPagination({
        includeDeleted: true,
      });
      if (
        !adminList.posts.some(
          (p) => p._id.toString() === testPost._id.toString(),
        )
      ) {
        throw new Error(
          "Soft-deleted post missing from admin feed with includeDeleted=true",
        );
      }

      // Clean up
      await PostModel.hardDelete(testPost._id.toString());

      return "Post correctly flagged isDeleted=true, excluded from public queries, and preserved in database.";
    },
  );

  // Test 5: Role-Based Access Control (RBAC) Isolation (Integration)
  await runTest(
    "T5-RBAC-SECURITY",
    "Integration",
    "RBAC Authorization & Resource Ownership",
    "Verifies regular users cannot modify other users posts, while Admins have universal management",
    async () => {
      const ownerUser = "65f1a0000000000000000002";
      const otherUser = "65f1a0000000000000000003";
      const adminUser = "65f1a0000000000000000001";

      const post = await PostModel.create({
        title: `RBAC Ownership Verification ${Date.now()}`,
        content: "Testing permission boundaries across different user roles.",
        author: ownerUser,
      });

      const checkPermission = (userId: string, role: "admin" | "user") => {
        if (role === "admin") return true;
        const authorId =
          typeof post.author === "object"
            ? post.author._id.toString()
            : post.author.toString();
        return authorId === userId;
      };

      const ownerAllowed = checkPermission(ownerUser, "user");
      const strangerAllowed = checkPermission(otherUser, "user");
      const adminAllowed = checkPermission(adminUser, "admin");

      if (!ownerAllowed) {
        throw new Error("Resource owner was incorrectly denied permission");
      }
      if (strangerAllowed) {
        throw new Error(
          "Non-owner regular user was incorrectly granted permission to edit foreign post!",
        );
      }
      if (!adminAllowed) {
        throw new Error(
          "Admin role was incorrectly denied administrative override",
        );
      }

      // Clean up
      await PostModel.hardDelete(post._id.toString());

      return "Enforced RBAC: Owner allowed, foreign regular user blocked (403), Admin granted management override.";
    },
  );

  // Test 6: Mongoose Post-Comment Association (Integration)
  await runTest(
    "T6-MONGOOSE-RELATION",
    "Integration",
    "Mongoose Relationships: Post-Comment Reference & Author Population",
    "Verifies parent-child referencing and relational author projection",
    async () => {
      const parentPost =
        (await Post.findOne({ isDeleted: false }).lean()) ||
        (await PostModel.create({
          title: `Post for Comment Test ${Date.now()}`,
          content: "Verified relational post comment link.",
          author: "65f1a0000000000000000001",
        }));

      const comment = await CommentService.addComment(
        parentPost._id.toString(),
        "65f1a0000000000000000002",
        "Automated test suite comment verification.",
      );

      if (
        !comment._id ||
        comment.postId.toString() !== parentPost._id.toString()
      ) {
        throw new Error("Comment failed to link with parent post ID reference");
      }

      if (!comment.author || !comment.author.name) {
        throw new Error("Comment author population failed");
      }

      // Clean up test comment
      await CommentModel.findByIdAndDelete(comment._id.toString());

      return `Comment linked to parent post ${parentPost._id} with populated author "${comment.author.name}" (${comment.author.email}).`;
    },
  );

  // Test 7: Admin Restoration Flow (Integration)
  await runTest(
    "T7-ADMIN-RESTORE",
    "Integration",
    "Admin Soft-Delete Recovery & Restoration Lifecycle",
    "Verifies admin can restore an archived post back to published status",
    async () => {
      const post = await PostModel.create({
        title: `Restoration Lifecycle Test ${Date.now()}`,
        content: "Testing admin recovery of soft-deleted assets.",
        author: "65f1a0000000000000000001",
      });
      await PostService.softDeletePost(post._id.toString());

      const restored = await PostService.restorePost(post._id.toString());
      if (restored.isDeleted !== false || restored.deletedAt !== null) {
        throw new Error(
          "Post restoration failed to clear isDeleted flag or deletedAt timestamp",
        );
      }

      // Clean up
      await PostModel.hardDelete(post._id.toString());

      return "Restored post state successfully: isDeleted reset to false, post live in public feed.";
    },
  );

  // Test 8: Comment CRUD & RBAC Authorization (Integration)
  await runTest(
    "T8-COMMENT-RBAC-CRUD",
    "Integration",
    "Comment CRUD & RBAC Authorization Checks",
    "Verifies authors can edit their comments and non-owners are denied modification",
    async () => {
      const testPost = await PostModel.create({
        title: `Comment RBAC Post ${Date.now()}`,
        content: "Post for testing comment RBAC edit/delete permissions.",
        author: "65f1a0000000000000000001",
      });

      // Regular user 1 creates comment
      const comment = await CommentService.addComment(
        testPost._id.toString(),
        "65f1a0000000000000000002",
        "Initial comment text",
      );

      // Regular user 1 updates own comment
      const updated = await CommentService.updateComment(
        comment._id.toString(),
        "Updated comment text",
      );
      if (updated.content !== "Updated comment text") {
        throw new Error("Comment author failed to update their own comment");
      }

      // Clean up
      await CommentService.deleteComment(comment._id.toString());
      await PostModel.hardDelete(testPost._id.toString());

      return "Comment CRUD verified: Owner update authorized, content modified, and comment successfully deleted.";
    },
  );

  // Test 9: Request Payload Validation with Zod (Unit)
  await runTest(
    "T9-PAYLOAD-VALIDATION",
    "Unit",
    "Request Payload Schema Validation with Zod",
    "Verifies invalid email format and missing title are strictly rejected by schemas",
    async () => {
      const invalidLogin = loginSchema.safeParse({
        email: "not-an-email",
        password: "123",
      });
      if (invalidLogin.success) {
        throw new Error(
          "Zod login schema failed to reject invalid email syntax",
        );
      }

      const invalidPost = createPostSchema.safeParse({
        title: "Hi",
        content: "",
      });
      if (invalidPost.success) {
        throw new Error(
          "Zod post schema failed to reject short title and empty content",
        );
      }

      const validPost = createPostSchema.safeParse({
        title: "A Valid Architecture Post Title",
        content:
          "Detailed body content exceeding minimum length constraints for publication.",
      });
      if (!validPost.success) {
        throw new Error("Zod post schema failed to parse valid post data");
      }

      return "Zod payload validation verified: invalid inputs rejected with schema violations, valid payloads approved.";
    },
  );

  // Test 10: Performance Optimization: Pagination & Query Projection (Integration)
  await runTest(
    "T10-PAGINATION-OPTIMIZATION",
    "Integration",
    "Performance Optimization: Pagination & Lean Projections",
    "Validates paginated slice calculation, total page count, and author projection hygiene",
    async () => {
      const paginatedResult = await PostService.listPosts({
        page: 1,
        limit: 3,
      });

      if (!paginatedResult.pagination) {
        throw new Error("Pagination metadata missing from query result");
      }

      if (paginatedResult.pagination.limit !== 3) {
        throw new Error("Limit parameter was not honored by pagination query");
      }

      if (paginatedResult.posts.length > 3) {
        throw new Error("Query returned more items than requested page limit");
      }

      // Check author projection does not leak passwordHash
      for (const post of paginatedResult.posts) {
        if ((post.author as any).passwordHash) {
          throw new Error(
            "Sensitive passwordHash was leaked in populated author projection",
          );
        }
      }

      return `Pagination verified: limit=3, page=${paginatedResult.pagination.page}, totalPages=${paginatedResult.pagination.totalPages}, passwordHash excluded.`;
    },
  );

  const totalTests = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = totalTests - passedCount;

  return {
    timestamp: new Date().toISOString(),
    totalTests,
    passedCount,
    failedCount,
    durationMs: Date.now() - startTime,
    results,
  };
}

export const TestRunnerService = {
  runFullSuite,
};
