import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const DB_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DB_DIR, 'db_store.json');

export interface IUserDoc {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
  avatar?: string;
  bio?: string;
  provider?: 'local' | 'google' | 'facebook';
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface IPostDoc {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  coverImage?: string;
  author: string; // User ID reference
  isDeleted: boolean;
  deletedAt?: string | null;
  views: number;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICommentDoc {
  _id: string;
  postId: string; // Post ID reference
  author: string; // User ID reference
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IActivityLogDoc {
  _id: string;
  action: string;
  userId?: string;
  userEmail?: string;
  targetType: 'post' | 'comment' | 'user' | 'auth' | 'system';
  targetId?: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

// In-Memory & Persisted Database State
class InMemoryMongoStore {
  users: IUserDoc[] = [];
  posts: IPostDoc[] = [];
  comments: ICommentDoc[] = [];
  activityLogs: IActivityLogDoc[] = [];
  private initPromise: Promise<void> | null = null;

  load(): boolean {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.users) && data.users.length > 0) {
          this.users = data.users;
          this.posts = Array.isArray(data.posts) ? data.posts : [];
          this.comments = Array.isArray(data.comments) ? data.comments : [];
          this.activityLogs = Array.isArray(data.activityLogs) ? data.activityLogs : [];
          return true;
        }
      }
    } catch {
      // Fallback to in-memory seeding
    }
    return false;
  }

  save(): void {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(
        DB_FILE,
        JSON.stringify(
          {
            users: this.users,
            posts: this.posts,
            comments: this.comments,
            activityLogs: this.activityLogs,
          },
          null,
          2
        ),
        'utf-8'
      );
    } catch {
      // Ignore disk write errors
    }
  }

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      if (this.load()) {
        return;
      }

      // Seed default users if empty
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      const userPasswordHash = await bcrypt.hash('password123', 10);

    const adminUser: IUserDoc = {
      _id: 'usr_admin_001',
      name: 'Eleanor Vance',
      email: 'admin@meridian.dev',
      passwordHash: adminPasswordHash,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Staff Systems Architect & Meridian Community Lead.',
      provider: 'local',
      status: 'active',
      createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const regularUser1: IUserDoc = {
      _id: 'usr_reg_002',
      name: 'Julian Chen',
      email: 'julian@meridian.dev',
      passwordHash: userPasswordHash,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'Full-stack engineer interested in distributed data protocols.',
      provider: 'local',
      status: 'active',
      createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const regularUser2: IUserDoc = {
      _id: 'usr_reg_003',
      name: 'Maya Patel',
      email: 'maya@meridian.dev',
      passwordHash: userPasswordHash,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      bio: 'Frontend craftsman, design system contributor, writer.',
      provider: 'local',
      status: 'active',
      createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users = [adminUser, regularUser1, regularUser2];

    // Seed Posts
    this.posts = [
      {
        _id: 'post_001',
        title: 'Architecting Resilient Distributed Systems with Eventual Consistency',
        slug: 'architecting-resilient-distributed-systems',
        content: `### The Challenge of Distributed Invariants

When scaling modern backend architectures across global geographical regions, traditional ACID transactions frequently encounter fundamental network latency constraints. In this deep dive, we explore practical patterns for implementing **event-driven choreography**, idempotent messaging queues, and conflict-free replicated data structures.

#### Key Principles
1. **Network partitions are inevitable**: Design systems to remain available while synchronizing asynchronously.
2. **Idempotency keys on state transitions**: Every message delivery mechanism must withstand at-least-once delivery guarantees without duplicating transactional operations.
3. **Outbox pattern with change data capture**: Couple database commits with transactional messaging to prevent dual-write anomalies.

\`\`\`typescript
export interface SagaStep<TContext> {
  stepName: string;
  execute: (context: TContext) => Promise<TContext>;
  compensate: (context: TContext) => Promise<void>;
}
\`\`\`

By decomposing synchronous RPC calls into durable event streams, applications achieve bounded isolation boundaries and linear scalability.`,
        excerpt: 'Deconstructing real-world strategies for transactional consistency, sagas, and idempotency across decoupled cloud services.',
        category: 'Architecture',
        tags: ['Distributed Systems', 'Cloud', 'Microservices', 'Node.js'],
        author: adminUser._id,
        isDeleted: false,
        deletedAt: null,
        views: 1420,
        featured: true,
        createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
      },
      {
        _id: 'post_002',
        title: 'Zero-Pill Design Systems: Elevating Typography in Data-Dense Interfaces',
        slug: 'zero-pill-design-systems',
        content: `### The Anti-Pattern of Metadata Enclosures

A prevalent symptom of cookie-cutter interfaces is the reflexive wrapping of every metadata tag, date, and status inside colored pill capsules. When thirty colorful badges compete for visual attention, visual hierarchy breaks down.

#### The Three Visual Pillars
- **Unboxed Text Separation**: Use subtle typographic characters (\`·\`, \`/\`, \`—\`) with subdued opacity to group contextual information.
- **Tabular Figures**: Always format numeric values and counters with monospace tabular alignment (\`tabular-nums\`) to prevent layout shift.
- **Restraint Over Decoration**: Let whitespace and vertical rhythm carry the structure rather than borders inside borders.

Visual quietness directly increases reading comprehension and cognitive endurance during complex analytic workflows.`,
        excerpt: 'Why modern digital design is abandoning pill capsules in favor of refined typographic rhythm and deliberate negative space.',
        category: 'Design & UX',
        tags: ['Design Systems', 'Typography', 'Frontend', 'CSS'],
        author: regularUser2._id,
        isDeleted: false,
        deletedAt: null,
        views: 890,
        featured: true,
        createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      },
      {
        _id: 'post_003',
        title: 'Production JWT Hygiene: Rotating Refresh Tokens and Hardened Revocation',
        slug: 'production-jwt-hygiene',
        content: `### Securing Modern Stateless Token Lifecycles

JSON Web Tokens (JWT) offer excellent ergonomics for distributed microservices, yet naive implementations introduce severe security vulnerabilities when revocation and lifetime boundaries are overlooked.

#### Essential Production Hardening
- **Short-Lived Access Tokens**: Keep access tokens strictly bounded to 10–15 minutes.
- **Refresh Token Rotation**: Each time a refresh token is exchanged, invalidate the previous token and issue a fresh pair.
- **Cryptographic Fingerprinting**: Bind refresh tokens to client user-agent digests or secure HttpOnly cookies to minimize cross-site exfiltration vectors.

In our accompanying source code, we demonstrate the Express middleware stack verifying cryptographic claims with granular rate limiting.`,
        excerpt: 'A comprehensive guide to token expiration windows, rotating refresh tokens, and rate-limited authentication boundaries.',
        category: 'Security',
        tags: ['Security', 'JWT', 'Authentication', 'Express'],
        author: regularUser1._id,
        isDeleted: false,
        deletedAt: null,
        views: 1145,
        featured: false,
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      },
      {
        _id: 'post_004',
        title: 'Deprecated Protocol Migration Notes (Draft Archive)',
        slug: 'deprecated-protocol-migration-notes',
        content: `Internal team notes discussing the sunsetting of legacy v1 REST polling endpoints in favor of real-time server-sent event push notifications. Archived for historical review.`,
        excerpt: 'Internal deprecation audit documenting historical v1 endpoints prior to decommission.',
        category: 'Engineering',
        tags: ['Legacy', 'Migration', 'Archive'],
        author: adminUser._id,
        isDeleted: true, // Soft-deleted post demonstrating soft delete functionality!
        deletedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        views: 45,
        featured: false,
        createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      },
    ];

    // Seed Comments
    this.comments = [
      {
        _id: 'comm_001',
        postId: 'post_001',
        author: regularUser1._id,
        content: 'The section on idempotent keys during saga rollbacks is spot on. We implemented a deduplication window with Redis and it saved our transaction throughput.',
        isDeleted: false,
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      },
      {
        _id: 'comm_002',
        postId: 'post_001',
        author: regularUser2._id,
        content: 'Great architectural breakdown! How do you handle poison pill messages when outbox consumers encounter corrupted payloads?',
        isDeleted: false,
        createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      },
      {
        _id: 'comm_003',
        postId: 'post_002',
        author: adminUser._id,
        content: 'Completely agree on unboxing metadata. Typography carries structural hierarchy much cleaner than border-pill chaos.',
        isDeleted: false,
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      },
    ];

    // Seed Activity Logs
    this.activityLogs = [
      {
        _id: 'log_001',
        action: 'USER_REGISTERED',
        userId: adminUser._id,
        userEmail: adminUser.email,
        targetType: 'user',
        targetId: adminUser._id,
        details: 'Admin root account initialized with administrative privileges.',
        createdAt: adminUser.createdAt,
      },
      {
        _id: 'log_002',
        action: 'POST_CREATED',
        userId: adminUser._id,
        userEmail: adminUser.email,
        targetType: 'post',
        targetId: 'post_001',
        details: 'Published article "Architecting Resilient Distributed Systems".',
        createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
      },
      {
        _id: 'log_003',
        action: 'POST_SOFT_DELETED',
        userId: adminUser._id,
        userEmail: adminUser.email,
        targetType: 'post',
        targetId: 'post_004',
        details: 'Soft-deleted post "Deprecated Protocol Migration Notes". Retained in database with isDeleted=true.',
        createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      },
    ];
    this.save();
    })();

    return this.initPromise;
  }
}

export const dbStore = new InMemoryMongoStore();
// Initialize database on import
dbStore.init();

