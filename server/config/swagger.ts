export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Meridian MERN Blog Platform API',
    version: '1.0.0',
    description:
      'Production-grade RESTful API documentation for Meridian Blog Engine. Built with Node.js, Express.js, MongoDB/Mongoose ODM, JWT Authentication (Access + Refresh tokens), and Role-Based Access Control (RBAC).',
    contact: {
      name: 'Meridian Architecture Team',
      email: 'admin@meridian.dev',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Current API Environment (v1)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your JWT Access Token in the format: Bearer <token>',
      },
    },
    schemas: {
      StandardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          statusCode: { type: 'integer', example: 200 },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          statusCode: { type: 'integer', example: 400 },
          message: { type: 'string', example: 'Payload validation failed' },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              details: { type: 'object' },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: 'usr_admin_001' },
          name: { type: 'string', example: 'Eleanor Vance' },
          email: { type: 'string', example: 'admin@meridian.dev' },
          role: { type: 'string', enum: ['admin', 'user'], example: 'admin' },
          avatar: { type: 'string', example: 'https://images.unsplash.com/...' },
          bio: { type: 'string', example: 'Staff Systems Architect' },
          status: { type: 'string', enum: ['active', 'suspended'], example: 'active' },
          provider: { type: 'string', enum: ['local', 'google', 'facebook'], example: 'local' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Post: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: 'post_001' },
          title: { type: 'string', example: 'Architecting Resilient Distributed Systems' },
          slug: { type: 'string', example: 'architecting-resilient-distributed-systems' },
          content: { type: 'string', example: 'Markdown content...' },
          excerpt: { type: 'string', example: 'A brief synopsis of distributed consistency...' },
          category: { type: 'string', example: 'Architecture' },
          tags: { type: 'array', items: { type: 'string' }, example: ['Distributed Systems', 'Cloud'] },
          coverImage: { type: 'string' },
          author: { $ref: '#/components/schemas/User' },
          isDeleted: { type: 'boolean', example: false },
          deletedAt: { type: 'string', format: 'date-time', nullable: true },
          views: { type: 'integer', example: 1420 },
          featured: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Comment: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: 'comm_001' },
          postId: { type: 'string', example: 'post_001' },
          author: { $ref: '#/components/schemas/User' },
          content: { type: 'string', example: 'Great insights on saga rollbacks!' },
          isDeleted: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      RegisterPayload: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Maya Patel' },
          email: { type: 'string', example: 'maya@meridian.dev' },
          password: { type: 'string', example: 'password123' },
          role: { type: 'string', enum: ['admin', 'user'], default: 'user' },
          bio: { type: 'string', example: 'Frontend Architect' },
        },
      },
      LoginPayload: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'admin@meridian.dev' },
          password: { type: 'string', example: 'admin123' },
        },
      },
      CreatePostPayload: {
        type: 'object',
        required: ['title', 'content', 'category'],
        properties: {
          title: { type: 'string', example: 'Zero-Pill Design Systems' },
          content: { type: 'string', example: 'Markdown formatted article content...' },
          excerpt: { type: 'string', example: 'Refining typography in data-dense interfaces' },
          category: { type: 'string', example: 'Design & UX' },
          tags: { type: 'array', items: { type: 'string' }, example: ['Typography', 'CSS'] },
          coverImage: { type: 'string' },
          featured: { type: 'boolean', default: false },
        },
      },
      CreateCommentPayload: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string', example: 'This approach saves transaction throughput.' },
        },
      },
    },
  },
  tags: [
    { name: 'Authentication', description: 'User registration, login, JWT rotation, and OAuth 2.0 social login' },
    { name: 'Posts', description: 'CRUD blog post management, slug generation, pagination, and soft deletes' },
    { name: 'Comments', description: 'Relational post comments with author attribution' },
    { name: 'Admin', description: 'RBAC administrative console, user moderation, trash recovery, and audit logs' },
    { name: 'Notifications', description: 'Server-Sent Events (SSE) real-time streaming' },
    { name: 'Testing', description: 'Automated unit and integration test suite runner' },
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user account',
        description: 'Hashes password using bcrypt (10 rounds) and generates JWT access and refresh token pair. Protected with sliding window rate limiter.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterPayload' } } },
        },
        responses: {
          201: { description: 'Account registered successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          429: { description: 'Rate limit exceeded' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate user credentials',
        description: 'Validates bcrypt password hash and issues 15-minute Access Token & 7-day Refresh Token.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginPayload' } } },
        },
        responses: {
          200: { description: 'User authenticated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          401: { description: 'Invalid email or password' },
          429: { description: 'Rate limit exceeded' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Exchange refresh token for fresh access token',
        description: 'Implements JWT refresh token rotation with validation.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: { refreshToken: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Tokens rotated successfully' },
          401: { description: 'Invalid or expired refresh token' },
        },
      },
    },
    '/auth/social-login': {
      post: {
        tags: ['Authentication'],
        summary: 'OAuth 2.0 social sign-in (Google & Facebook)',
        description: 'Exchanges OAuth credentials and issues Meridian JWT token pair.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['provider', 'name', 'email'],
                properties: {
                  provider: { type: 'string', enum: ['google', 'facebook'] },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  avatar: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Social authentication successful' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Sign out and clear tokens',
        responses: {
          200: { description: 'Successfully logged out' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current authenticated user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User profile retrieved', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/posts': {
      get: {
        tags: ['Posts'],
        summary: 'List paginated blog posts',
        description: 'Supports searching, tag/category filtering, and pagination. Excludes soft-deleted posts unless requested by admin.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 9 } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'tag', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'authorId', in: 'query', schema: { type: 'string' } },
          { name: 'includeDeleted', in: 'query', schema: { type: 'boolean', default: false } },
        ],
        responses: {
          200: { description: 'List of posts with pagination' },
        },
      },
      post: {
        tags: ['Posts'],
        summary: 'Create a new blog post',
        security: [{ bearerAuth: [] }],
        description: 'Generates URL-friendly slug, validates payload with Zod, and broadcasts real-time event.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePostPayload' } } },
        },
        responses: {
          201: { description: 'Post published successfully' },
          400: { description: 'Validation failed' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/posts/taxonomy': {
      get: {
        tags: ['Posts'],
        summary: 'Get list of active categories and tags',
        responses: {
          200: { description: 'Categories and tags list' },
        },
      },
    },
    '/posts/{identifier}': {
      get: {
        tags: ['Posts'],
        summary: 'Get article by URL slug or MongoDB ID',
        parameters: [
          { name: 'identifier', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Post details with author populated' },
          404: { description: 'Post not found' },
        },
      },
    },
    '/posts/{id}': {
      put: {
        tags: ['Posts'],
        summary: 'Update post content or details',
        security: [{ bearerAuth: [] }],
        description: 'RBAC: Authors can update only their own posts; Admins can update any post.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePostPayload' } } },
        },
        responses: {
          200: { description: 'Post updated' },
          403: { description: 'Forbidden: ownership required' },
          404: { description: 'Post not found' },
        },
      },
      delete: {
        tags: ['Posts'],
        summary: 'Soft-delete blog post (move to trash)',
        security: [{ bearerAuth: [] }],
        description: 'Sets isDeleted: true and records deletedAt timestamp. Post is preserved in the database.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Post moved to trash' },
          403: { description: 'Forbidden: ownership required' },
        },
      },
    },
    '/posts/{id}/restore': {
      patch: {
        tags: ['Posts'],
        summary: 'Restore soft-deleted post from trash',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Post restored back to publication feed' },
        },
      },
    },
    '/posts/{id}/permanent': {
      delete: {
        tags: ['Posts'],
        summary: 'Permanently purge post from database',
        security: [{ bearerAuth: [] }],
        description: 'Admins only. Removes post record and associated comments.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Post permanently purged' },
          403: { description: 'Admin role required' },
        },
      },
    },
    '/comments/post/{postId}': {
      get: {
        tags: ['Comments'],
        summary: 'List comments for an article',
        parameters: [{ name: 'postId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'List of relational comments' },
        },
      },
      post: {
        tags: ['Comments'],
        summary: 'Post a comment on an article',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'postId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateCommentPayload' } } },
        },
        responses: {
          201: { description: 'Comment created' },
        },
      },
    },
    '/comments/{commentId}': {
      put: {
        tags: ['Comments'],
        summary: 'Edit comment',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'commentId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateCommentPayload' } } },
        },
        responses: {
          200: { description: 'Comment updated' },
        },
      },
      delete: {
        tags: ['Comments'],
        summary: 'Delete comment',
        security: [{ bearerAuth: [] }],
        description: 'RBAC: Authors can delete only their own comments; Admins can delete any comment.',
        parameters: [{ name: 'commentId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Comment deleted' },
        },
      },
    },
    '/comments/all': {
      get: {
        tags: ['Comments'],
        summary: 'List all comments across posts for moderation',
        security: [{ bearerAuth: [] }],
        description: 'Admins only. Used in the Admin Control Panel for universal moderation.',
        responses: {
          200: { description: 'All comments list' },
          403: { description: 'Admin role required' },
        },
      },
    },
    '/admin/stats': {
      get: {
        tags: ['Admin'],
        summary: 'Platform metrics (Total users, posts, trash, comments, views)',
        security: [{ bearerAuth: [] }],
        description: 'Admins only. Computes real-time KPI aggregates.',
        responses: {
          200: { description: 'Aggregated platform metrics' },
          403: { description: 'Admin role required' },
        },
      },
    },
    '/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'List all users with post and comment counts',
        security: [{ bearerAuth: [] }],
        description: 'Admins only.',
        responses: {
          200: { description: 'User list' },
        },
      },
    },
    '/admin/users/{userId}/role': {
      patch: {
        tags: ['Admin'],
        summary: 'Update user role (admin / user)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['role'],
                properties: { role: { type: 'string', enum: ['admin', 'user'] } },
              },
            },
          },
        },
        responses: {
          200: { description: 'User role updated' },
        },
      },
    },
    '/admin/users/{userId}/status': {
      patch: {
        tags: ['Admin'],
        summary: 'Toggle user active/suspended status',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'User status updated' },
        },
      },
    },
    '/admin/trash-posts': {
      get: {
        tags: ['Admin'],
        summary: 'List soft-deleted posts for trash recovery',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of soft-deleted posts' },
        },
      },
    },
    '/admin/activity-logs': {
      get: {
        tags: ['Admin'],
        summary: 'Retrieve audit activity logs',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Audit log feed' },
        },
      },
    },
    '/notifications/stream': {
      get: {
        tags: ['Notifications'],
        summary: 'Real-time Server-Sent Events (SSE) stream',
        responses: {
          200: { description: 'Continuous event stream', content: { 'text/event-stream': {} } },
        },
      },
    },
    '/tests/run': {
      post: {
        tags: ['Testing'],
        summary: 'Execute unit and integration test suite',
        description: 'Runs password hashing, JWT, slug, soft-delete, and RBAC tests on the server.',
        responses: {
          200: { description: 'Test execution report with assertion counts and durations' },
        },
      },
    },
  },
};
