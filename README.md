# Meridian — Production-Grade MERN Stack Blog Platform

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9.x-47A248?logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.13-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Swagger](https://img.shields.io/badge/OpenAPI-3.0_Swagger-85EA2D?logo=swagger&logoColor=black)](http://localhost:3000/api-docs)

> **Meridian** is a complete, architectural blog application built strictly with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). It fulfills all technical requirements for secure user authentication, role-based access control (RBAC), post management with URL slugs and soft deletes, relational comments, a dedicated admin control panel, clean service-layer architecture, performance optimizations, and automated unit and integration tests.

---

## Table of Contents

1. [Requirements Compliance Matrix](#1-requirements-compliance-matrix)
2. [Clean Architecture & Folder Structure](#2-clean-architecture--folder-structure)
3. [Feature Explanations](#3-feature-explanations)
   - [1. User Authentication & Security](#1-user-authentication--security)
   - [2. User Roles & Permissions (RBAC)](#2-user-roles--permissions-rbac)
   - [3. Post Management, Slugs & Soft Deletes](#3-post-management-slugs--soft-deletes)
   - [4. Relational Comments](#4-relational-comments)
   - [5. Dedicated Modular Admin Panel](#5-dedicated-modular-admin-panel)
   - [6. Advanced Routing & RESTful Standards](#6-advanced-routing--restful-standards)
   - [7. Reusable Custom Middleware](#7-reusable-custom-middleware)
   - [8. Service Layer Architecture](#8-service-layer-architecture)
   - [9. Performance Optimization & Indexing](#9-performance-optimization--indexing)
   - [10. Testing Suite (Unit & Integration)](#10-testing-suite-unit--integration)
   - [Frontend Architecture (React 19 & Redux Toolkit)](#frontend-architecture-react-19--redux-toolkit)
   - [Bonus: Real-Time Event Notifications](#bonus-real-time-event-notifications)
4. [Environment Variables Setup](#4-environment-variables-setup)
5. [Installation & Execution Guide](#5-installation--execution-guide)
   - [Method 1: Integrated Full-Stack (`yarn dev`)](#method-1-integrated-full-stack-server-with-auto-reload-recommended)
   - [Method 2: Client-Only (`yarn dev:client`)](#method-2-client-only-standalone-dev-server)
   - [Method 3: Concurrent Full-Stack (`yarn dev:full`)](#method-3-concurrent-full-stack-development)
6. [Interactive API Documentation (Swagger OpenAPI 3.0)](#6-interactive-api-documentation-swagger-openapi-30)
7. [API Endpoints Reference](#7-api-endpoints-reference)
8. [Demo Video & Evaluation Walkthrough](#8-demo-video--evaluation-walkthrough)

---

## 1. Requirements Compliance Matrix

| Requirement from Specification    |  Status  | Implementation Details & Location                                                                                                                                                                         |
| --------------------------------- | :------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MERN Stack Foundation**         | Complete | MongoDB with Mongoose ODM, Express.js 4, React.js 19 with Redux Toolkit, Node.js 22.                                                                                                                      |
| **1. User Authentication**        | Complete | Register, login, logout, bcrypt password hashing (10 salt rounds), JWT access (15m) & refresh (7d) tokens, sliding-window rate limiting, Google & Facebook OAuth 2.0 SSO, Formik + Zod client validation. |
| **2. Roles & Permissions (RBAC)** | Complete | `admin` and `user` roles enforced at API middleware level (`requireRole`, `checkPostOwnershipOrAdmin`, `checkCommentOwnershipOrAdmin`).                                                                   |
| **3. Post Management**            | Complete | Full CRUD with Title, Content, Author reference, Timestamps; automatic URL-friendly slug generation with collision handling; Zod payload validation; soft deletes (`isDeleted`, `deletedAt`).             |
| **4. Comments**                   | Complete | Full CRUD; author-only edit/delete; universal admin moderation; Mongoose post-comment relational referencing with populated authors.                                                                      |
| **5. Admin Panel**                | Complete | Dedicated React UI restricted by RBAC middleware; displays total users, total posts, total comments, total views; modular components; user management table; trash bin; comment moderation.               |
| **6. Advanced Routing**           | Complete | Modular Express Routers (`/api/v1/auth`, `/posts`, `/comments`, `/admin`, `/notifications`); centralized JSON error envelope (`success`, `statusCode`, `message`, `data`, `error`).                       |
| **7. Middleware**                 | Complete | Reusable & modular: `activityLogger` (logs to MongoDB), `auth` (JWT verification), `rbac` (roles & ownership), `rateLimiter`, `validation` (Zod), `errorHandler`.                                         |
| **8. Services & Architecture**    | Complete | Clean architecture with separated layers: Routes → Controllers (`catchAsync`) → Services (business logic) → Schemas/Models (database).                                                                    |
| **9. Performance Optimization**   | Complete | Database indexing on `email`, `slug`, `author`, `isDeleted`, `postId`, `createdAt`; lean projections (`.lean()`); server-side pagination; selective field population.                                     |
| **10. Testing**                   | Complete | 10 unit and integration tests with Jest assertion semantics; runnable via CLI (`npm run test`) and interactive in-app Test Modal (`/api/v1/tests/run`).                                                   |
| **Frontend Requirements**         | Complete | Functional React components & hooks; centralized Redux Toolkit state (`auth`, `posts`, `admin`, `notifications`, `ui`); Formik + Zod forms; protected routes.                                             |
| **Bonus Feature**                 | Complete | Real-time event notifications stream via Server-Sent Events (SSE) broadcasting post creation, comments, and trash actions.                                                                                |

---

## 2. Clean Architecture & Folder Structure

Meridian follows a **Clean Multi-Layer Architecture** strictly decoupling HTTP concerns, validation, business logic, and database operations.

```
                    ┌──────────────────────────────────────────────┐
                    │      React 19 Frontend + Redux Toolkit       │
                    │  (Formik + Zod / Slices: auth, posts, admin) │
                    └──────────────────────┬───────────────────────┘
                                           │ HTTP REST (/api/v1) & SSE Stream
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │          Express Router & Versioning         │
                    └──────────────────────┬───────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
┌──────────────────┐             ┌──────────────────┐             ┌──────────────────┐
│  Auth Middleware │             │  RBAC Middleware │             │  Rate Limiter &  │
│  (JWT Validation)│             │ (Role & Ownership│             │  Zod Validation  │
└──────────────────┘             └──────────────────┘             └──────────────────┘
         │                                 │                                 │
         └─────────────────────────────────┼─────────────────────────────────┘
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │            Controllers Layer                 │
                    │     (Request validation & catchAsync)        │
                    └──────────────────────┬───────────────────────┘
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │             Services Layer                   │
                    │   (Business Logic & Domain Transformations)  │
                    └──────────────────────┬───────────────────────┘
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │          Mongoose ODM & Schemas              │
                    │    (User, Post, Comment, ActivityLog)        │
                    └──────────────────────┬───────────────────────┘
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │          MongoDB Database Store              │
                    │      (Compound Indexes & Data Integrity)     │
                    └──────────────────────────────────────────────┘
```

### Complete Repository Tree

```
meridian/
├── index.html                           # Single page HTML entry point
├── package.json                         # Dependencies & run scripts
├── tsconfig.json                        # TypeScript compiler options
├── vite.config.ts                       # Vite bundler configuration
├── server.ts                            # Express application entry, Swagger & Vite middleware
├── server/
│   ├── config/
│   │   ├── env.ts                       # Environment variable parsing and validation
│   │   ├── database.ts                  # Mongoose MongoDB connection & memory-server fallback
│   │   └── swagger.ts                   # OpenAPI 3.0 Swagger specifications
│   ├── schema/
│   │   ├── userschema.ts                # User Mongoose schema, bcrypt hook, virtuals
│   │   ├── postschema.ts                # Post Mongoose schema, slugs, soft deletes, indexing
│   │   ├── commentschema.ts             # Comment Mongoose relational model
│   │   └── activitylogschema.ts         # Operational audit logging schema
│   ├── middleware/
│   │   ├── auth.ts                      # JWT verification & req.user extraction
│   │   ├── rbac.ts                      # Role validation (admin) & resource ownership checks
│   │   ├── rateLimiter.ts               # In-memory sliding window IP rate limiter
│   │   ├── activityLogger.ts            # User action audit logging middleware
│   │   ├── validation.ts                # Zod request payload schema validation
│   │   └── errorHandler.ts              # Centralized JSON error response handler
│   ├── validations/
│   │   ├── authValidation.ts            # Zod schemas: register, login, refresh, social
│   │   ├── postValidation.ts            # Zod schemas: create post, update post
│   │   └── commentValidation.ts         # Zod schemas: create comment, update comment
│   ├── Services/
│   │   ├── authService.ts               # Bcrypt password hashing, JWT signing, OAuth flows
│   │   ├── userService.ts               # User directory, role toggling, account suspension
│   │   ├── postService.ts               # Post lifecycle, slug generation, soft delete/restore
│   │   ├── commentService.ts            # Relational comment CRUD & authorization checks
│   │   ├── commonService.ts             # Standardized API response & error formatters
│   │   └── testRunnerService.ts         # Automated Unit & Integration test runner engine
│   ├── Controller/
│   │   ├── userController.ts            # Authentication & profile endpoints
│   │   ├── postController.ts            # Post publication endpoints
│   │   ├── commentController.ts         # Post discussion endpoints
│   │   ├── adminController.ts           # Admin panel & operational metrics endpoints
│   │   └── testController.ts            # Automated test suite trigger endpoint
│   ├── routes/
│   │   ├── userRoute.ts                 # /api/v1/auth & /api/v1/user
│   │   ├── postRoute.ts                 # /api/v1/posts
│   │   ├── commentRoute.ts              # /api/v1/comments
│   │   ├── adminRoute.ts                # /api/v1/admin
│   │   ├── notificationRoute.ts         # /api/v1/notifications
│   │   └── testRoute.ts                 # /api/v1/tests
│   ├── tests/
│   │   └── runner.ts                    # Jest-style CLI test runner executable
│   └── notificationEvents.ts            # Server-Sent Events (SSE) broadcaster
└── src/
    ├── main.tsx                         # React 19 bootstrap with Redux Provider
    ├── App.tsx                          # Root React view container & routing
    ├── types/
    │   └── index.ts                     # Shared TypeScript interfaces (User, Post, Comment, etc.)
    ├── lib/
    │   ├── api.ts                       # Axios client, token storage & token refresh interceptors
    │   └── firebase.ts                  # Firebase OAuth helper for Google/Facebook
    ├── store/
    │   ├── store.ts                     # Redux Toolkit centralized store configuration
    │   ├── hooks.ts                     # Typed useAppDispatch & useAppSelector hooks
    │   └── slices/
    │       ├── authSlice.ts             # User session, JWT tokens, login/register thunks
    │       ├── postsSlice.ts            # Posts state, comments thunks
    │       ├── adminSlice.ts            # Centralized admin dashboard state & management thunks
    │       ├── notificationsSlice.ts    # SSE real-time notification items
    │       └── uiSlice.ts               # Navigation state & modal visibility flags
    ├── validations/
    │   ├── authValidation.ts            # Client-side Zod validation schemas for Formik
    │   └── postValidation.ts            # Client-side Zod post schema for Formik
    ├── components/
    │   ├── AuthModal.tsx                # Auth modal powered by useFormik + Zod validation
    │   ├── PostEditorModal.tsx          # Post editor powered by useFormik + Zod validation
    │   ├── CommentSection.tsx           # Comments discussion powered by Redux postsSlice
    │   ├── Navbar.tsx                   # Top navigation with role switcher & notification bell
    │   ├── Footer.tsx                   # System specifications & quick modal openers
    │   ├── PostCard.tsx                 # Article preview card with read time & status indicators
    │   ├── PostDetail.tsx               # Full story view with markdown rendering & discussion
    │   ├── NotificationDrawer.tsx       # Live SSE notification drawer
    │   ├── ApiDocsModal.tsx             # Interactive Swagger REST API documentation modal
    │   ├── TestRunnerModal.tsx          # In-app interactive test runner modal
    │   ├── DemoGuideModal.tsx           # Interactive evaluation guide modal
    │   └── admin/                       # Modular Admin Dashboard Sub-Components
    │       ├── index.ts                 # Barrel export
    │       ├── AdminStatsCards.tsx      # Overview KPI cards (Users, Posts, Comments, Views)
    │       ├── AdminTabNav.tsx          # Sub-tab navigation with dynamic counters
    │       ├── AdminAuditLogsTab.tsx    # Live system operational audit trail
    │       ├── AdminUsersTab.tsx        # User directory & permission management table
    │       ├── AdminTrashPostsTab.tsx   # Soft-deleted posts recovery & purge table
    │       └── AdminCommentsTab.tsx     # Universal comment moderation
    └── pages/
        ├── HomePage.tsx                 # Main publication feed, tag filters & search
        ├── MyPostsPage.tsx              # Author's stories & personal trash tab
        └── AdminDashboard.tsx           # Composed Admin Console container connected to Redux
```

---

## 3. Feature Explanations

### 1. User Authentication & Security

- **Bcrypt Password Hashing**: Passwords are encrypted before persisting to MongoDB using `bcryptjs` with 10 salt rounds in a Mongoose `pre('save')` hook.
- **Dual JWT Token Architecture**:
  - **Access Token**: Short-lived (15 minutes), containing user identity (`userId`, `email`, `role`, `name`). Signed via `JWT_ACCESS_SECRET`.
  - **Refresh Token**: Long-lived (7 days), stored securely and verified via `JWT_REFRESH_SECRET`.
  - **Token Rotation**: Hitting `/api/v1/auth/refresh` exchanges a valid refresh token for a brand-new access token.
- **Brute-Force Rate Limiting**: Authentication endpoints (`/api/v1/auth/*`) are protected by a sliding window rate limiter allowing up to 100 requests per 15-minute window per IP.
- **Social Media Login (OAuth 2.0)**: Google and Facebook login support using client-side OAuth integration with backend exchange via `/api/v1/auth/social-login`.
- **Formik + Zod Client Validation**: The authentication modal (`AuthModal.tsx`) uses `useFormik` combined with `zod` (`loginSchema` and `registerSchema`) for real-time field-level validation and error feedback.
- **Preconfigured Evaluator Accounts**:
  - **Admin**: `admin@meridian.dev` | Password: `admin123`
  - **Regular User**: `julian@meridian.dev` | Password: `password123`
  - **Regular User**: `maya@meridian.dev` | Password: `password123`

---

### 2. User Roles & Permissions (RBAC)

- **Role Hierarchy**: Two distinct user roles: `admin` and `user`.
- **API-Level Enforcement**: Protection is enforced on the server through dedicated middleware functions:
  - `requireRole('admin')`: Restricts administrative routes to users with `admin` credentials.
  - `checkPostOwnershipOrAdmin`: Ensures regular users can only edit or delete their own posts, while granting admins full management capabilities across all posts.
  - `checkCommentOwnershipOrAdmin`: Ensures regular users can only edit or delete their own comments, while granting admins universal comment moderation permissions.
- **Evaluator Role Switcher**: The navigation bar features a 1-click **"Demo Role"** switcher allowing instant switching between Admin (Eleanor) and Regular Users (Julian & Maya) to test permission boundaries.

---

### 3. Post Management, Slugs & Soft Deletes

- **CRUD Operations**: Complete create, read, update, and delete lifecycle for articles.
- **Compliant Post Model**:
  - `title`: Post title (validated 5–150 characters).
  - `content`: Markdown body (minimum 20 characters).
  - `author`: Mongoose `ObjectId` referencing the `User` collection.
  - `timestamps`: Native MongoDB timestamps (`createdAt`, `updatedAt`).
  - `slug`: URL-friendly kebab-case slug generated automatically (e.g., `/post/building-resilient-microservices`). Resolves collisions by appending numerical suffixes.
  - `isDeleted` & `deletedAt`: Soft-delete status and timestamp.
- **Soft Deletes**: Deleting a post sets `isDeleted: true` and records `deletedAt: new Date()`. The post is immediately hidden from the public feed while preserved in the database.
- **Restoration & Purge**:
  - Authors and admins can restore soft-deleted posts via `PATCH /api/v1/posts/:id/restore`.
  - Admins can permanently purge articles and associated comments via `DELETE /api/v1/posts/:id/permanent`.
- **Formik + Zod Post Editor**: `PostEditorModal.tsx` uses `useFormik` and `postEditorSchema` to manage form state, validate titles, content, excerpt, and URL fields, and provide a live slug preview.

---

### 4. Relational Comments

- **Mongoose Relational References**: Comments store a direct reference to the parent `postId` (`ref: 'Post'`) and the author's `userId` (`ref: 'User'`).
- **Data Population**: Author details (`name`, `email`, `avatar`, `userRole`) are automatically populated using `.populate('author', 'name email avatar userRole role')`.
- **Redux Centralization**: `CommentSection.tsx` dispatches `fetchComments(postId)`, `addComment`, `updateComment`, and `removeComment` from `postsSlice`, keeping comments fully reactive and centralized.

---

### 5. Dedicated Modular Admin Panel

- **React-Based Admin Console (`AdminDashboard.tsx`)**: Built as a composition of dedicated sub-components in `src/components/admin/`:
  - **`AdminStatsCards`**: Displays live platform metrics for **Total Users**, **Total Posts** (Active vs Soft-Deleted), **Total Comments**, and **Total Post Views**.
  - **`AdminTabNav`**: Tab bar with live badge counts for Audit Logs, Users, Trash, and Comments.
  - **`AdminAuditLogsTab`**: Live system audit trail displaying operational events captured by the activity logger.
  - **`AdminUsersTab`**: User management table allowing admins to promote/revoke Admin roles, suspend/reactivate accounts, and delete users.
  - **`AdminTrashPostsTab`**: Trash management view to inspect soft-deleted articles and restore or purge them.
  - **`AdminCommentsTab`**: Universal comment moderation list with delete actions.
- **Redux Toolkit `adminSlice`**: Centralizes all admin state, loading flags, action loading indicators, and asynchronous thunks (`fetchAdminData`, `toggleUserRole`, `toggleUserStatus`, `deleteUser`, `restoreTrashPost`, `permanentDeletePost`, `deleteAdminComment`).

---

### 6. Advanced Routing & RESTful Standards

- **Express Routers**: Routes are logically divided into versioned modules under `/api/v1`:
  - `/api/v1/auth` & `/api/v1/user`
  - `/api/v1/posts`
  - `/api/v1/comments`
  - `/api/v1/admin`
  - `/api/v1/notifications`
  - `/api/v1/tests`
- **Consistent Response Envelope**: All endpoints return a standardized JSON structure:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Operation completed successfully",
    "data": { ... },
    "pagination": { "page": 1, "limit": 9, "totalCount": 24, "totalPages": 3 }
  }
  ```
- **Centralized Error Handling**: Unhandled exceptions and validation errors are intercepted by `errorHandler.ts`, returning standard JSON error responses without leaking stack traces in production:
  ```json
  {
    "success": false,
    "statusCode": 400,
    "message": "Payload validation failed",
    "error": { "code": "VALIDATION_ERROR", "details": [ ... ] }
  }
  ```

---

### 7. Reusable Custom Middleware

1. **`activityLogger.ts`**: Intercepts mutating requests (POST, PUT, PATCH, DELETE) and records user activity to MongoDB (`ActivityLog` collection), capturing action, target resource, user ID, email, details, and client IP.
2. **`auth.ts`**: Extracts Bearer token from the `Authorization` header, verifies the JWT access token, and attaches the user payload to `req.user`.
3. **`rbac.ts`**: Enforces role requirements (`requireRole('admin')`) and resource ownership (`checkPostOwnershipOrAdmin`, `checkCommentOwnershipOrAdmin`).
4. **`rateLimiter.ts`**: Enforces IP-based request limits on sensitive authentication routes.
5. **`validation.ts`**: Validates request bodies against Zod schemas (`validateRequest(schema)`).
6. **`errorHandler.ts`**: Centralized error middleware catching operational and syntax errors.

---

### 8. Service Layer Architecture

Meridian strictly separates transport logic (Controllers) from business logic (Services):

- **`authService.ts`**: User registration, bcrypt hashing, credential verification, JWT issuance, token refresh, and OAuth handling.
- **`userService.ts`**: User directory retrieval, role updates, account suspension, and platform statistics calculation.
- **`postService.ts`**: Post querying, pagination, slug generation, soft deletion, restoration, and database purge.
- **`commentService.ts`**: Relational comment creation, post-level querying, updates, and moderation.
- **`commonService.ts`**: Standardized response helpers and error formatting.
- **`testRunnerService.ts`**: Self-contained test suite runner.

---

### 9. Performance Optimization & Indexing

- **MongoDB Indexing**:
  - `User`: Index on `email` (unique).
  - `Post`: Compound indexes on `{ author: 1, createdAt: -1 }` and `{ isDeleted: 1, createdAt: -1 }`. Unique index on `slug`.
  - `Comment`: Indexes on `{ postId: 1, createdAt: 1 }`, `{ author: 1 }`, and `{ isDeleted: 1 }`.
  - `ActivityLog`: Index on `{ createdAt: -1 }`.
- **Server-Side Pagination**: Endpoints support `page` and `limit` query parameters with skip/limit calculation to prevent loading large datasets into memory.
- **Lean Projections**: Read-only queries use `.lean()` to bypass Mongoose document hydration overhead.
- **Selective Population**: Queries only populate essential author fields (`name`, `email`, `avatar`, `userRole`) instead of entire user documents.

---

### 10. Testing Suite (Unit & Integration)

Meridian includes 10 automated unit and integration tests executing against MongoDB:

1. **Bcrypt Password Hashing & Registration** (Unit): Verifies salt generation and hashed storage.
2. **JWT Token Issuance & Verification** (Integration): Validates access and refresh tokens.
3. **URL Slug Generation & Sanitization** (Unit): Tests kebab-case conversion, special character removal, and collision deduplication.
4. **Soft-Delete Lifecycle & Database Retention** (Integration): Verifies posts marked with `isDeleted: true` remain queryable by ID while excluded from public queries.
5. **RBAC Authorization & Ownership Isolation** (Integration): Ensures regular users cannot mutate other users' articles.
6. **Mongoose Post-Comment Relational Referencing** (Integration): Verifies relational association between comments and posts.
7. **Admin Soft-Delete Recovery & Restoration** (Integration): Tests article restoration back to the live publication feed.
8. **Comment CRUD & Authorization Checks** (Integration): Verifies discussion creation, editing, and deletion boundaries.
9. **Request Payload Schema Validation with Zod** (Unit): Asserts rejection of malformed payloads and acceptance of valid inputs.
10. **Performance Optimization: Pagination & Lean Projections** (Integration): Validates pagination metadata and lean execution.

**How to run tests:**

```bash
yarn test
# or: npm run test
```

Or click the **"Test Suite"** button in the app header/footer to run tests interactively inside the browser!

---

### Frontend Architecture (React 19 & Redux Toolkit)

- **React 19**: Built with functional components and modern React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
- **Centralized Redux Toolkit (`@reduxjs/toolkit`)**:
  - **`authSlice`**: Stores user session, tokens, login/register/logout thunks.
  - **`postsSlice`**: Manages publication feed, active post, and post comments.
  - **`adminSlice`**: Manages metrics, users directory, trash posts, comment moderation, and audit logs.
  - **`notificationsSlice`**: Receives live event payloads from the SSE stream.
  - **`uiSlice`**: Manages active tabs and modal dialog visibility.
- **Formik & Zod Integration**: Complex forms in `AuthModal` and `PostEditorModal` leverage `useFormik` with strict Zod schema validation.
- **Protected Routes**: Visual and functional route guards prevent unauthorized access to the Admin Dashboard and authoring controls.

---

### Bonus: Real-Time Event Notifications

Meridian includes a real-time event broadcasting mechanism via **Server-Sent Events (SSE)** at `/api/v1/notifications/stream`.

- **Live Stream Events**:
  - `POST_CREATED`: Dispatched when any author publishes a story.
  - `COMMENT_ADDED`: Dispatched when a comment is posted.
  - `POST_DELETED` / `POST_RESTORED`: Dispatched upon post lifecycle changes.
- **Notification Drawer**: Click the bell icon in the navigation bar to open the live drawer and review real-time alerts.

---

## 4. Environment Variables Setup

Create a `.env` file in the root directory:

```bash
# Server Port
PORT=3000

# Node Environment
NODE_ENV=development

# MongoDB Connection String
# (Omit or leave blank to automatically use the embedded in-memory MongoDB engine)
MONGODB_URI=mongodb://localhost:27017/meridian_blog

# JWT Secrets & Token Expiration
JWT_ACCESS_SECRET=meridian_jwt_access_secret_production_key_2026
JWT_REFRESH_SECRET=meridian_jwt_refresh_secret_production_key_2026
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# API Rate Limiter
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 5. Installation & Execution Guide

### Prerequisites

- Node.js (v18 or higher recommended)
- Yarn or npm (v9 or higher)

### 1. Install Dependencies

```bash
yarn
```

### 2. Start Development Server (3 Methods)

Meridian provides **3 distinct methods** to run the development environment, tailored to different developer workflows:

| Method                                              | Command                                   | Script in `package.json`                                                      | Port / URL                                         | Primary Purpose                                                                                                 |
| --------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Method 1: Full-Stack Integrated** _(Recommended)_ | `yarn dev`<br>`npm run dev`               | `nodemon --watch server --watch server.ts --ext ts,json --exec tsx server.ts` | `http://localhost:3000`                            | Full-stack development with automatic backend reload & frontend HMR served on a single unified port.            |
| **Method 2: Client-Only**                           | `yarn dev:client`<br>`npm run dev:client` | `vite`                                                                        | `http://localhost:5173`                            | Ultra-fast standalone Vite dev server. Ideal for rapid UI styling, component prototyping, and CSS tweaking.     |
| **Method 3: Concurrent Full-Stack**                 | `yarn dev:full`<br>`npm run dev:full`     | `concurrently "yarn dev" "yarn dev:client"`                                   | `http://localhost:3000`<br>`http://localhost:5173` | Runs both the backend watcher and standalone Vite server simultaneously in a single terminal with colored logs. |

---

#### Method 1: Integrated Full-Stack Server with Auto-Reload (Recommended)

```bash
yarn dev
# or: npm run dev
```

- **Script Definition**:
  ```json
  "dev": "nodemon --watch server --watch server.ts --ext ts,json --exec tsx server.ts"
  ```
- **How It Works**:
  - Boots the Express server on **`http://localhost:3000`** with MongoDB connection handling (including automatic embedded in-memory database fallback if no local MongoDB instance is active).
  - Express mounts the **Vite Dev Server** in middleware mode (`vite.createServer({ server: { middlewareMode: true } })`), seamlessly serving the React 19 frontend, all REST API routes (`/api/v1/*`), Swagger UI (`/api-docs`), and real-time SSE streams (`/api/v1/notifications/stream`) through a single unified origin port (`3000`).
  - **Nodemon** actively monitors changes across `server.ts` and the entire `server/` directory for `.ts` and `.json` extensions. Any modification to controllers, services, middleware, or schemas automatically triggers a hot server restart.
- **Best For**: Standard daily development, end-to-end testing, and grading/demo evaluation where all full-stack capabilities are accessed through one clean port.

---

#### Method 2: Client-Only Standalone Dev Server

```bash
yarn dev:client
# or: npm run dev:client
```

- **Script Definition**:
  ```json
  "dev:client": "vite"
  ```
- **How It Works**:
  - Launches the standalone **Vite dev server** on **`http://localhost:5173`**.
  - Provides instantaneous Hot Module Replacement (HMR) specifically for client-side assets (`src/`, `index.html`, Tailwind CSS styles, components, and Redux slices).
- **Best For**: Frontend engineers focusing purely on UI design, layout changes, component isolation, or CSS refactoring without incurring server restarts on file saves.

---

#### Method 3: Concurrent Full-Stack Development

```bash
yarn dev:full
# or: npm run dev:full
```

- **Script Definition**:
  ```json
  "dev:full": "concurrently \"yarn dev\" \"yarn dev:client\""
  ```
- **How It Works**:
  - Uses the **`concurrently`** package to run both `yarn dev` (Nodemon Express backend on port `3000`) and `yarn dev:client` (standalone Vite dev server on port `5173`) in parallel inside a single command and single terminal window.
  - Distinguishes stdout/stderr outputs with clean color-coded prefixes (`[dev]` and `[dev:client]`), allowing you to monitor backend restart logs and frontend HMR updates side by side.
- **Best For**: Workflows where you want an independent standalone Vite dev server running on port `5173` while concurrently maintaining active backend Nodemon watchers on port `3000`.

### 3. Run Automated Tests

```bash
yarn test
```

### 4. Build for Production

```bash
yarn build
yarn start
```

---

## 6. Interactive API Documentation (Swagger OpenAPI 3.0)

Meridian includes built-in interactive **Swagger OpenAPI 3.0** documentation:

- **Swagger UI Interactive Explorer**:
  - `http://localhost:3000/api-docs`
  - `http://localhost:3000/api/v1/docs`
- **Raw OpenAPI 3.0 JSON Specification**:
  - `http://localhost:3000/api-docs-json`
  - `http://localhost:3000/api/v1/docs/json`
- **In-App Explorer**: Click **"API Docs"** in the navigation bar or footer to open the embedded modal.

### Authorizing in Swagger UI

1. Run `POST /api/v1/auth/login` with `admin@meridian.dev` / `admin123`.
2. Copy the returned `accessToken`.
3. Click the green **"Authorize"** button in Swagger UI and input `Bearer <your_token>`.

---

## 7. API Endpoints Reference

| Method   | Endpoint                         | Description                                    | Access Level          |
| -------- | -------------------------------- | ---------------------------------------------- | --------------------- |
| `GET`    | `/api-docs`                      | Interactive Swagger UI Documentation           | Public                |
| `GET`    | `/api-docs-json`                 | OpenAPI 3.0 JSON Specification                 | Public                |
| `POST`   | `/api/v1/auth/register`          | Register new user with bcrypt hashing          | Public (Rate-Limited) |
| `POST`   | `/api/v1/auth/login`             | Login user, issue Access & Refresh JWTs        | Public (Rate-Limited) |
| `POST`   | `/api/v1/auth/refresh`           | Exchange refresh token for fresh access token  | Public                |
| `POST`   | `/api/v1/auth/social-login`      | Google / Facebook OAuth single sign-on         | Public                |
| `GET`    | `/api/v1/auth/me`                | Retrieve profile of authenticated user         | Authenticated         |
| `GET`    | `/api/v1/posts`                  | List posts (supports pagination, search, tags) | Public                |
| `GET`    | `/api/v1/posts/:slugOrId`        | Retrieve single post by slug or ID             | Public                |
| `POST`   | `/api/v1/posts`                  | Create new post with automated slug            | Authenticated         |
| `PUT`    | `/api/v1/posts/:id`              | Update post content                            | Owner or Admin        |
| `DELETE` | `/api/v1/posts/:id`              | Soft delete post (`isDeleted: true`)           | Owner or Admin        |
| `PATCH`  | `/api/v1/posts/:id/restore`      | Restore soft-deleted post to feed              | Owner or Admin        |
| `DELETE` | `/api/v1/posts/:id/permanent`    | Permanently purge post and comments            | Admin Only            |
| `GET`    | `/api/v1/comments/post/:postId`  | Get all comments for a post                    | Public                |
| `POST`   | `/api/v1/comments/post/:postId`  | Add a comment to a post                        | Authenticated         |
| `PUT`    | `/api/v1/comments/:commentId`    | Edit comment content                           | Author or Admin       |
| `DELETE` | `/api/v1/comments/:commentId`    | Delete a comment                               | Author or Admin       |
| `GET`    | `/api/v1/comments/all`           | Retrieve all comments for moderation           | Admin Only            |
| `GET`    | `/api/v1/admin/stats`            | Platform statistics (users, posts, comments)   | Admin Only            |
| `GET`    | `/api/v1/admin/users`            | User directory with post/comment counts        | Admin Only            |
| `PATCH`  | `/api/v1/admin/users/:id/role`   | Toggle user role (`admin` / `user`)            | Admin Only            |
| `PATCH`  | `/api/v1/admin/users/:id/status` | Toggle user status (`active` / `suspended`)    | Admin Only            |
| `DELETE` | `/api/v1/admin/users/:id`        | Delete user and archive their posts            | Admin Only            |
| `GET`    | `/api/v1/admin/trash-posts`      | List soft-deleted posts in trash               | Admin Only            |
| `GET`    | `/api/v1/admin/activity-logs`    | Retrieve operational audit logs                | Admin Only            |
| `GET`    | `/api/v1/notifications/stream`   | Server-Sent Events (SSE) notification stream   | Public                |
| `POST`   | `/api/v1/tests/run`              | Execute unit and integration test suite        | Public                |

---

## License

MIT License — Meridian Blog System.
