# Meridian — Modern Full-Stack MERN Blog Platform

Meridian is a production-grade, architectural blog engine built with the complete **MERN Stack** (MongoDB/Mongoose ODM, Express.js, React.js 19 with Redux Toolkit, Node.js) styled with Tailwind CSS.

It features robust **JWT Authentication** (rotating Access & Refresh Tokens), **Role-Based Access Control (RBAC)** enforced at the API middleware level, **CRUD Post & Relational Comment Management**, **URL-friendly slug generation**, **Soft Deletes**, a dedicated **Admin Control Panel**, and **Real-Time Notifications** via Server-Sent Events (SSE).

Global frontend state is managed centrally using **Redux Toolkit (`@reduxjs/toolkit` and `react-redux`)**, utilizing typed slices (`authSlice`, `postsSlice`, `notificationsSlice`, `uiSlice`), async thunks, and centralized actions.

---

## 1. Architecture & Design Principles

```
                    ┌─────────────────────────┐
                    │   React 19 Frontend     │
                    │   (Context API + Hooks) │
                    └────────────┬────────────┘
                                 │ REST API (/api/v1) & SSE Stream
                                 ▼
                    ┌─────────────────────────┐
                    │   Express.js Router     │
                    │   (Modular Versioning)  │
                    └────────────┬────────────┘
                                 │
           ┌─────────────────────┼─────────────────────┐
           ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Auth Middleware │  │  RBAC Middleware │  │ Rate Limiter /   │
│  (JWT Verify)    │  │  (Role & Owner)  │  │ Zod Validator    │
└──────────────────┘  └──────────────────┘  └──────────────────┘
           │                     │                     │
           └─────────────────────┼─────────────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │     Controllers Layer   │
                    └────────────┬────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │     Services Layer      │
                    │   (Business Logic)      │
                    └────────────┬────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │  Mongoose ODM / Models  │
                    │  (User, Post, Comment)  │
                    └────────────┬────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │  MongoDB Database Store │
                    └─────────────────────────┘
```

### Folder Structure
```
meridian/
├── index.html                    # Entry point with SEO and typography
├── package.json                  # Dependencies & execution scripts
├── server.ts                     # Express server, Swagger UI & Vite middleware entry
├── server/
│   ├── config/
│   │   ├── env.ts                # Environment variable configuration
│   │   ├── database.ts           # Mongoose ODM store & database engine (MongoDB)
│   │   └── swagger.ts            # Swagger OpenAPI 3.0 specification schemas
│   ├── schema/
│   │   ├── userschema.ts         # User Mongoose schema with bcrypt hashing & roles
│   │   ├── postschema.ts         # Post Mongoose schema: slugs, soft-deletes, indexing
│   │   ├── commentschema.ts      # Comment Mongoose parent-child post reference model
│   │   └── activitylogschema.ts  # Audit logging Mongoose schema
│   ├── middleware/
│   │   ├── auth.ts               # JWT validation & req.user attachment
│   │   ├── rbac.ts               # Role requirements & resource ownership
│   │   ├── rateLimiter.ts        # Sliding window IP-based rate limiter
│   │   ├── activityLogger.ts     # Activity audit logging middleware
│   │   ├── validation.ts         # Zod payload schema validation
│   │   └── errorHandler.ts       # Centralized JSON error response handler
│   ├── validations/
│   │   ├── authValidation.ts     # Zod register, login, refresh schemas
│   │   ├── postValidation.ts     # Zod post creation & update schemas
│   │   └── commentValidation.ts  # Zod comment schemas
│   ├── Services/
│   │   ├── authService.ts        # Bcrypt hash, token issuance, SSO
│   │   ├── userService.ts        # User moderation, role management, statistics
│   │   ├── postService.ts        # Post lifecycle, soft delete, restoration
│   │   ├── commentService.ts     # Relational comments management
│   │   ├── commonService.ts      # Standard response & error formatting
│   │   └── testRunnerService.ts  # Unit & Integration test suite engine
│   ├── Controller/
│   │   ├── userController.ts     # Functional route handlers with catchAsync
│   │   ├── postController.ts     # Post endpoints with catchAsync
│   │   ├── commentController.ts  # Comment endpoints with catchAsync
│   │   ├── adminController.ts    # Admin control endpoints with catchAsync
│   │   └── testController.ts     # Test runner endpoint with catchAsync
│   ├── utils/
│   │   ├── jwt.ts                # Token generation & verification helpers
│   │   ├── types.ts              # Core TypeScript interface properties
│   │   ├── catchAsync.ts         # Async handler wrapper forwarding to next(err)
│   │   └── status.ts             # Semantic HTTP status codes (200, 201, 400, etc.)
│   ├── routes/
│   │   ├── userRoute.ts          # /api/v1/auth & /api/v1/user
│   │   ├── postRoute.ts          # /api/v1/posts
│   │   ├── commentRoute.ts       # /api/v1/comments
│   │   ├── adminRoute.ts         # /api/v1/admin
│   │   ├── notificationRoute.ts  # /api/v1/notifications
│   │   └── testRoute.ts          # /api/v1/tests
│   ├── tests/
│   │   └── runner.ts             # Jest-compatible Unit & Integration test runner
│   └── notificationEvents.ts     # Real-time SSE broadcaster
└── src/
    ├── store/
    │   ├── store.ts               # Redux configureStore with all reducers
    │   ├── hooks.ts               # Typed useAppDispatch & useAppSelector
    │   └── slices/
    │       ├── authSlice.ts       # Auth state, login, register, logout, SSO thunks
    │       ├── postsSlice.ts      # Posts CRUD, slugs, soft deletes, tag taxonomy
    │       ├── notificationsSlice.ts # Live SSE notification items & unread count
    │       └── uiSlice.ts         # Navigation tabs, modal visibility flags
    ├── context/
    │   ├── AuthContext.tsx        # Redux-backed global auth provider & hooks
    │   └── NotificationContext.tsx# Redux-backed SSE notification dispatcher
    ├── components/
    │   ├── Navbar.tsx             # 3-Zone top bar contract
    │   ├── Footer.tsx             # Technology stack specs & footer
    │   ├── PostCard.tsx           # Zero-pill unboxed typography article card
    │   ├── PostDetail.tsx         # Markdown article reader & comments
    │   ├── PostEditorModal.tsx    # Post creation with live slug preview
    │   ├── CommentSection.tsx     # Nested comments with RBAC operations
    │   ├── NotificationDrawer.tsx # Real-time event notifications
    │   ├── ApiDocsModal.tsx       # Interactive REST API specification
    │   └── TestRunnerModal.tsx    # In-app unit & integration test runner
    ├── pages/
    │   ├── HomePage.tsx           # Hero, tag filter, search, pagination
    │   ├── AdminDashboard.tsx     # Admin panel (KPIs, Users, Trash, Moderation)
    │   └── MyPostsPage.tsx        # User's stories & personal trash filter
    └── App.tsx                    # Main React application
```

---

## 2. Requirements & Feature Implementations

### 1. User Authentication
- **User Registration & Login**: Validated with Zod, encrypted using `bcryptjs` with 10 salt rounds.
- **JWT Access & Refresh Tokens**: 
  - Access Token: Short-lived (15 minutes), containing `{ userId, email, role, name }`.
  - Refresh Token: Long-lived (7 days), exchanged via `/api/v1/auth/refresh` with automatic token rotation.
- **Rate Limiting**: Sliding window rate limiter protects `/api/v1/auth/*` endpoints against brute-force attacks.
- **Social Media Login**: Simulated 1-click single sign-on for **Google** and **Facebook** OAuth 2.0 flows.
- **Preconfigured Evaluator Accounts**:
  - **Admin**: `admin@meridian.dev` (Password: `admin123`)
  - **Regular User**: `julian@meridian.dev` (Password: `password123`)
  - **Regular User**: `maya@meridian.dev` (Password: `password123`)

### 2. User Roles and Permissions (RBAC)
- **Role Enforcement at API Level**:
  - `requireRole('admin')`: Restricts administrative routes.
  - `checkPostOwnershipOrAdmin`: Regular users can only update or delete their own posts; Admins have universal management capabilities.
  - `checkCommentOwnershipOrAdmin`: Regular users can only edit or delete their own comments; Admins can moderate any comment.

### 3. Post Management
- **CRUD Operations**: Complete create, read, update, delete lifecycles.
- **Model Fields (Document Compliant)**:
  - `title`: Post headline (validated minimum 5 characters).
  - `content`: Markdown body content (validated minimum 20 characters).
  - `author`: Mongoose reference linking to the `User` document.
  - `timestamps`: Native MongoDB timestamps (`createdAt` and `updatedAt`).
  - `slug`: URL-friendly kebab-case slug with automatic deduplication.
  - `tags`: Array of taxonomy tags.
  - `isDeleted` & `deletedAt`: Soft delete flags.
  - *(Note: No category field is present on posts or frontend, aligning strictly with document requirements).*
- **Soft Deletes**: Posts marked `isDeleted: true` with a `deletedAt` timestamp. Hidden from the standard public feed while preserved in the database.
- **Restoration & Purge**: Authors and admins can restore soft-deleted posts back to the live feed; Admins can permanently purge them.
- **Search & Pagination**: Live query filtering across titles, excerpts, and tags.

### 4. Comments
- **Mongoose Relational References**: Comments store references to `postId` and author `userId`.
- **Relational Population**: Queries automatically populate author credentials (name, email, avatar).
- **Ownership & Moderation**: Users modify their own comments; admins can moderate any discussion.

### 5. Admin Panel
- **Dedicated Dashboard UI**:
  - **KPI Cards**: Real-time totals for Users, Posts (Active vs Trash), and Comments.
  - **Audit Logs Tab**: Chronological audit feed captured by Express activity logger middleware.
  - **User Directory**: View user post counts, toggle Admin roles, suspend/activate accounts, or delete users.
  - **Trash Bin**: Inspect all soft-deleted articles and restore them with 1 click.
  - **Comment Moderation**: Review all discussions across posts and remove spam.

### 6. Database Engine (MongoDB with Mongoose ODM)
- **Zero JSON Database Stores**: Replaced all file-based JSON stores (`db_store.json`) with official MongoDB ODM (Mongoose).
- **Embedded & Cloud Support**:
  - Automatically launches an embedded, zero-configuration in-memory MongoDB instance via `mongodb-memory-server` in sandbox/evaluator environments.
  - Supports live remote MongoDB clusters via `MONGODB_URI` environment variable when configured.
- **Database Indexing**: Enforces indexes on `User.email` (unique), `Post.slug` (unique), `Post.author`, `Post.isDeleted`, and `Comment.postId`.

### 7. Real-Time Notifications
- Connected via Server-Sent Events (`/api/v1/notifications/stream`).
- Automatically broadcasts when a new story is published, a comment is submitted, or a post is soft-deleted/restored.

### 8. Unit & Integration Testing
- Dedicated in-app **Test Console** (`/api/v1/tests/run`) and CLI runner (`npm run test`) verifying:
  1. Bcrypt Password Hashing & Registration (Unit)
  2. JWT Access & Refresh Token Issuance and Verification (Integration)
  3. URL-Friendly Slug Generation & Sanitization (Unit)
  4. Soft-Delete Lifecycle & Database Retention (Integration)
  5. RBAC Authorization & Ownership Isolation (Integration)
  6. Mongoose Post-Comment Relational Referencing (Integration)
  7. Admin Soft-Delete Recovery & Restoration (Integration)
  8. Comment CRUD & Authorization Checks (Integration)
  9. Request Payload Schema Validation with Zod (Unit)
  10. Performance Optimization: Pagination & Lean Projections (Integration)

---

## 3. Environment Setup

Create a `.env` file in the root directory (based on `.env.example`):

```bash
PORT=3000
NODE_ENV=development

# MongoDB Connection (Defaults to embedded in-memory MongoDB if omitted)
MONGODB_URI=mongodb://localhost:27017/meridian_blog

# JWT Secrets & Expiration
JWT_ACCESS_SECRET=meridian_jwt_access_secret_production_key_2026
JWT_REFRESH_SECRET=meridian_jwt_refresh_secret_production_key_2026
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Rate Limiter
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 4. Installation & Execution

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:3000` with both Express REST endpoints and Vite React client mounted together.

### Run Automated Tests
```bash
npm run test
```
Executes the full 10-test unit and integration test suite against the MongoDB database engine.

### Run Production Build
```bash
npm run build
npm start
```

---

## 5. API Documentation & Swagger OpenAPI 3.0

The backend includes a fully interactive **Swagger UI** for exploring and testing endpoints:

- **Swagger UI Interactive Explorer**:
  - `http://localhost:3000/api-docs`
  - `http://localhost:3000/api/v1/docs`
- **Raw OpenAPI 3.0 JSON Specification**:
  - `http://localhost:3000/api-docs-json`
  - `http://localhost:3000/api/v1/docs/json`
- **In-App Explorer**: Click **"API Docs"** in the top navigation bar to access the embedded Swagger explorer with live execution.

### Authorizing in Swagger
To execute authenticated endpoints (`/api/v1/posts` [POST/PUT/DELETE], `/api/v1/comments` [POST/DELETE], `/api/v1/admin/*`):
1. Execute `POST /api/v1/auth/login` with your credentials or the pre-seeded admin (`admin@meridian.dev` / `admin123`).
2. Copy the returned `tokens.accessToken`.
3. Click the green **"Authorize"** button in Swagger UI and enter `Bearer <your_token>`.

### API Endpoints Reference Table

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api-docs` | Interactive Swagger UI Documentation | No |
| `GET` | `/api-docs-json` | OpenAPI 3.0 JSON Specification | No |
| `POST` | `/api/v1/auth/register` | Register new user with bcrypt hashing | No (Rate-Limited) |
| `POST` | `/api/v1/auth/login` | Login user and issue Access + Refresh JWTs | No (Rate-Limited) |
| `POST` | `/api/v1/auth/refresh` | Exchange refresh token for fresh access token | No |
| `POST` | `/api/v1/auth/social-login` | Google / Facebook OAuth single sign-on | No |
| `GET` | `/api/v1/auth/me` | Retrieve profile of authenticated user | Yes (Bearer Token) |
| `GET` | `/api/v1/posts` | List posts (pagination, tag, search) | Optional |
| `GET` | `/api/v1/posts/taxonomy` | Active tags | Optional |
| `GET` | `/api/v1/posts/:slugOrId`| Retrieve single post by slug or ID | Optional |
| `POST` | `/api/v1/posts` | Create new article with slug | Yes |
| `PUT` | `/api/v1/posts/:id` | Update article | Yes (Owner / Admin) |
| `DELETE` | `/api/v1/posts/:id` | Soft delete article (sets isDeleted=true) | Yes (Owner / Admin) |
| `PATCH` | `/api/v1/posts/:id/restore` | Restore soft-deleted article | Yes (Owner / Admin) |
| `DELETE` | `/api/v1/posts/:id/permanent` | Permanently purge article and comments | Yes (Admin Only) |
| `GET` | `/api/v1/comments/post/:postId` | Get comments for a post | Optional |
| `POST` | `/api/v1/comments/post/:postId` | Post a comment | Yes |
| `PUT` | `/api/v1/comments/:commentId` | Edit a comment | Yes (Author / Admin) |
| `DELETE` | `/api/v1/comments/:commentId` | Delete a comment | Yes (Author / Admin) |
| `GET` | `/api/v1/comments/all` | Moderate all comments | Yes (Admin Only) |
| `GET` | `/api/v1/admin/stats` | Platform statistics (users, posts, comments)| Yes (Admin Only) |
| `GET` | `/api/v1/admin/users` | List all users with activity counts | Yes (Admin Only) |
| `PATCH` | `/api/v1/admin/users/:id/role` | Toggle user role ('admin' / 'user') | Yes (Admin Only) |
| `PATCH` | `/api/v1/admin/users/:id/status`| Toggle user status ('active'/'suspended') | Yes (Admin Only) |
| `GET` | `/api/v1/admin/trash-posts` | List soft-deleted posts for restoration | Yes (Admin Only) |
| `GET` | `/api/v1/admin/activity-logs` | Retrieve live system activity audit logs | Yes (Admin Only) |
| `GET` | `/api/v1/notifications/stream` | Server-Sent Events (SSE) live stream | Optional |
| `POST` | `/api/v1/tests/run` | Execute unit and integration test suite | No |

---

## 6. Verification & Evaluation Notes

1. **Quick Evaluator Switcher**: Click the **"Demo Role"** dropdown in the top navigation bar to seamlessly switch between:
   - **Admin (Eleanor Vance)**: Has full access to the Admin Console, post restoration, and user role management.
   - **Regular User (Julian Chen)**: Can author stories and only manage his own publications.
   - **Regular User (Maya Patel)**: Demonstrates isolation: cannot edit Julian's articles.
2. **Interactive Test Runner**: Click the **"Test Suite"** button in the header or footer to run the full test suite and view all test assertion outputs in real-time.
3. **Soft-Delete Demonstration**: As Julian or Eleanor, click **"Trash"** on any story. The story will disappear from the public feed and appear in the **Admin Trash Bin** and **My Stories (Trash filter)**, where it can be restored with a single click.
