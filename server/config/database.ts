import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoMemoryServer: MongoMemoryServer | null = null;
let isConnected = false;

export interface IUserDoc {
  _id: any;
  name: string;
  email: string;
  passwordHash?: string;
  role: "admin" | "user";
  userRole?: "admin" | "user";
  avatar?: string;
  bio?: string;
  provider?: "local" | "google" | "facebook";
  status: "active" | "suspended";
  createdAt: string;
  updatedAt: string;
}

export interface IPostDoc {
  _id: any;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  author: any; // User ID reference
  isDeleted: boolean;
  deletedAt?: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICommentDoc {
  _id: any;
  postId: any; // Post ID reference
  author: any; // User ID reference
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IActivityLogDoc {
  _id: any;
  action: string;
  userId?: any;
  userEmail?: string;
  targetType: "post" | "comment" | "user" | "auth" | "system";
  targetId?: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

/**
 * Initialize embedded MongoDB memory instance and connect Mongoose ODM
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  try {
    if (!mongoMemoryServer) {
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: "meridian_prod_db",
        },
      });
      console.log(
        "[MongoDB] Initialized embedded in-memory MongoDB server instance",
      );
    }

    const uri = mongoMemoryServer.getUri();

    // Configure Mongoose connection options
    await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(
      `[MongoDB] Mongoose successfully connected to database (${uri})`,
    );

    // Seed database with pre-built data
    await seedInitialData();

    return mongoose;
  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
    throw error;
  }
}

/**
 * Seed initial records into MongoDB if collection is empty
 */
async function seedInitialData() {
  const { User } = await import("../schema/userschema");
  const { Post } = await import("../schema/postschema");
  const { Comment } = await import("../schema/commentschema");
  const { ActivityLog } = await import("../schema/activitylogschema");

  const userCount = await User.countDocuments();
  if (userCount > 0) {
    return;
  }

  console.log(
    "[MongoDB] Seeding initial database records with MongoDB ObjectIds...",
  );

  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const userPasswordHash = await bcrypt.hash("password123", 10);

  // Standard 24-character hexadecimal MongoDB ObjectIds
  const adminUserId = new mongoose.Types.ObjectId("65f1a0000000000000000001");
  const regularUser1Id = new mongoose.Types.ObjectId(
    "65f1a0000000000000000002",
  );
  const regularUser2Id = new mongoose.Types.ObjectId(
    "65f1a0000000000000000003",
  );

  const adminUser = await User.create({
    _id: adminUserId,
    name: "Eleanor Vance",
    email: "admin@meridian.dev",
    password: adminPasswordHash,
    userRole: "admin",
    role: "admin",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: "Staff Systems Architect & Meridian Community Lead.",
    provider: "local",
    status: "active",
  });

  const regularUser1 = await User.create({
    _id: regularUser1Id,
    name: "Julian Chen",
    email: "julian@meridian.dev",
    password: userPasswordHash,
    userRole: "user",
    role: "user",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Full-stack engineer interested in distributed data protocols.",
    provider: "local",
    status: "active",
  });

  const regularUser2 = await User.create({
    _id: regularUser2Id,
    name: "Maya Patel",
    email: "maya@meridian.dev",
    password: userPasswordHash,
    userRole: "user",
    role: "user",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    bio: "Frontend craftsman, design system contributor, writer.",
    provider: "local",
    status: "active",
  });

  // Seed Posts with standard MongoDB ObjectIds
  const post1Id = new mongoose.Types.ObjectId("65f2b0000000000000000001");
  const post2Id = new mongoose.Types.ObjectId("65f2b0000000000000000002");
  const post3Id = new mongoose.Types.ObjectId("65f2b0000000000000000003");
  const post4Id = new mongoose.Types.ObjectId("65f2b0000000000000000004");

  const post1 = await Post.create({
    _id: post1Id,
    title:
      "Architecting Resilient Distributed Systems with Eventual Consistency",
    slug: "architecting-resilient-distributed-systems",
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
    excerpt:
      "Deconstructing real-world strategies for transactional consistency, sagas, and idempotency across decoupled cloud services.",
    author: adminUser._id,
    isDeleted: false,
    deletedAt: null,
    views: 1420,
  });

  const post2 = await Post.create({
    _id: post2Id,
    title:
      "Zero-Pill Design Systems: Elevating Typography in Data-Dense Interfaces",
    slug: "zero-pill-design-systems",
    content: `### The Anti-Pattern of Metadata Enclosures

A prevalent symptom of cookie-cutter interfaces is the reflexive wrapping of every metadata tag, date, and status inside colored pill capsules. When thirty colorful badges compete for visual attention, visual hierarchy breaks down.

#### The Three Visual Pillars
- **Unboxed Text Separation**: Use subtle typographic characters (\`·\`, \`/\`, \`—\`) with subdued opacity to group contextual information.
- **Tabular Figures**: Always format numeric values and counters with monospace tabular alignment (\`tabular-nums\`) to prevent layout shift.
- **Restraint Over Decoration**: Let whitespace and vertical rhythm carry the structure rather than borders inside borders.

Visual quietness directly increases reading comprehension and cognitive endurance during complex analytic workflows.`,
    excerpt:
      "Why modern digital design is abandoning pill capsules in favor of refined typographic rhythm and deliberate negative space.",
    author: regularUser2._id,
    isDeleted: false,
    deletedAt: null,
    views: 890,
  });

  const post3 = await Post.create({
    _id: post3Id,
    title:
      "Production JWT Hygiene: Rotating Refresh Tokens and Hardened Revocation",
    slug: "production-jwt-hygiene",
    content: `### Securing Modern Stateless Token Lifecycles

JSON Web Tokens (JWT) offer excellent ergonomics for distributed microservices, yet naive implementations introduce severe security vulnerabilities when revocation and lifetime boundaries are overlooked.

#### Essential Production Hardening
- **Short-Lived Access Tokens**: Keep access tokens strictly bounded to 10–15 minutes.
- **Refresh Token Rotation**: Each time a refresh token is exchanged, invalidate the previous token and issue a fresh pair.
- **Cryptographic Fingerprinting**: Bind refresh tokens to client user-agent digests or secure HttpOnly cookies to minimize cross-site exfiltration vectors.

In our accompanying source code, we demonstrate the Express middleware stack verifying cryptographic claims with granular rate limiting.`,
    excerpt:
      "A comprehensive guide to token expiration windows, rotating refresh tokens, and rate-limited authentication boundaries.",
    author: regularUser1._id,
    isDeleted: false,
    deletedAt: null,
    views: 1145,
  });

  const post4 = await Post.create({
    _id: post4Id,
    title: "Deprecated Protocol Migration Notes (Draft Archive)",
    slug: "deprecated-protocol-migration-notes",
    content: `Internal team notes discussing the sunsetting of legacy v1 REST polling endpoints in favor of real-time server-sent event push notifications. Archived for historical review.`,
    excerpt:
      "Internal deprecation audit documenting historical v1 endpoints prior to decommission.",
    author: adminUser._id,
    isDeleted: true,
    deletedAt: new Date(Date.now() - 24 * 3600 * 1000),
    views: 45,
  });

  // Seed Comments with standard MongoDB ObjectIds
  const comm1Id = new mongoose.Types.ObjectId("65f3c0000000000000000001");
  const comm2Id = new mongoose.Types.ObjectId("65f3c0000000000000000002");
  const comm3Id = new mongoose.Types.ObjectId("65f3c0000000000000000003");

  await Comment.create([
    {
      _id: comm1Id,
      postId: post1._id,
      author: regularUser1._id,
      content:
        "The section on idempotent keys during saga rollbacks is spot on. We implemented a deduplication window with Redis and it saved our transaction throughput.",
      isDeleted: false,
    },
    {
      _id: comm2Id,
      postId: post1._id,
      author: regularUser2._id,
      content:
        "Great architectural breakdown! How do you handle poison pill messages when outbox consumers encounter corrupted payloads?",
      isDeleted: false,
    },
    {
      _id: comm3Id,
      postId: post2._id,
      author: adminUser._id,
      content:
        "Completely agree on unboxing metadata. Typography carries structural hierarchy much cleaner than border-pill chaos.",
      isDeleted: false,
    },
  ]);

  // Seed Activity Logs with standard MongoDB ObjectIds
  const log1Id = new mongoose.Types.ObjectId("65f4d0000000000000000001");
  const log2Id = new mongoose.Types.ObjectId("65f4d0000000000000000002");
  const log3Id = new mongoose.Types.ObjectId("65f4d0000000000000000003");

  await ActivityLog.create([
    {
      _id: log1Id,
      action: "USER_REGISTERED",
      userId: adminUser._id,
      userEmail: adminUser.email,
      targetType: "user",
      targetId: adminUser._id.toString(),
      details: "Admin root account initialized with administrative privileges.",
    },
    {
      _id: log2Id,
      action: "POST_CREATED",
      userId: adminUser._id,
      userEmail: adminUser.email,
      targetType: "post",
      targetId: post1._id.toString(),
      details:
        'Published article "Architecting Resilient Distributed Systems".',
    },
    {
      _id: log3Id,
      action: "POST_SOFT_DELETED",
      userId: adminUser._id,
      userEmail: adminUser.email,
      targetType: "post",
      targetId: post4._id.toString(),
      details:
        'Soft-deleted post "Deprecated Protocol Migration Notes". Retained in MongoDB with isDeleted=true.',
    },
  ]);

  console.log("[MongoDB] Database seeding complete.");
}

/**
 * Disconnect MongoDB cleanly
 */
export async function disconnectDB(): Promise<void> {
  if (isConnected) {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
    }
    isConnected = false;
    console.log("[MongoDB] Disconnected from MongoDB");
  }
}
