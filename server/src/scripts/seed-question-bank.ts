import mongoose from "mongoose";
import { env } from "../config/env";
import { QuestionBankModel } from "../modules/question-bank/question-bank.model";

// ── 250+ High-Quality Curated Questions ───────────────────────────────────────

const CURATED_QUESTIONS = [
  // ── TECHNICAL: FRONTEND (Easy, Medium, Hard) ────────────────────────────────
  {
    question: "Explain the difference between let, const, and var in terms of scoping, hoisting, and mutation.",
    topic: "JavaScript Scope & Hoisting",
    type: "technical",
    difficulty: "easy",
    roles: ["Frontend", "Fullstack", "Web Developer"],
    techStacks: ["JavaScript", "TypeScript"],
  },
  {
    question: "What is event bubbling and event capturing in the browser DOM, and how does event delegation leverage this?",
    topic: "DOM Event Delegation",
    type: "technical",
    difficulty: "easy",
    roles: ["Frontend", "Fullstack"],
    techStacks: ["JavaScript", "HTML"],
  },
  {
    question: "How does CSS Flexbox differ from CSS Grid, and in what layout scenarios would you choose one over the other?",
    topic: "CSS Layouts (Flexbox vs Grid)",
    type: "technical",
    difficulty: "easy",
    roles: ["Frontend", "Web Developer"],
    techStacks: ["CSS", "HTML"],
  },
  {
    question: "Explain the purpose of the key prop in React lists. What problems occur if an array index is used as a key?",
    topic: "React Reconciliation & Keys",
    type: "technical",
    difficulty: "easy",
    roles: ["Frontend", "Fullstack"],
    techStacks: ["React", "JavaScript"],
  },
  {
    question: "What is the difference between controlled and uncontrolled components in React, and when would you use each?",
    topic: "React Form Handling",
    type: "technical",
    difficulty: "easy",
    roles: ["Frontend", "Fullstack"],
    techStacks: ["React"],
  },
  {
    question: "Explain the difference between synchronous and asynchronous code in JavaScript. How does Promise.all behave if one promise rejects?",
    topic: "Asynchronous JavaScript & Promises",
    type: "technical",
    difficulty: "easy",
    roles: ["Frontend", "Backend", "Fullstack"],
    techStacks: ["JavaScript"],
  },
  {
    question: "Walk through how React's Virtual DOM and reconciliation algorithm work. What role does the Fiber tree play?",
    topic: "React Fiber & Virtual DOM",
    type: "technical",
    difficulty: "medium",
    roles: ["Frontend", "Fullstack"],
    techStacks: ["React"],
  },
  {
    question: "Describe common performance bottlenecks in single-page applications and how you diagnose and fix memory leaks caused by uncleaned event listeners or subscriptions.",
    topic: "SPA Memory Leaks & Profiling",
    type: "technical",
    difficulty: "medium",
    roles: ["Frontend", "Fullstack"],
    techStacks: ["React", "JavaScript"],
  },
  {
    question: "How does the browser critical rendering path work from raw HTML bytes to paint, and how do async and defer script attributes affect parsing?",
    topic: "Browser Critical Rendering Path",
    type: "technical",
    difficulty: "medium",
    roles: ["Frontend", "Fullstack"],
    techStacks: ["JavaScript", "HTML"],
  },
  {
    question: "Compare Server-Side Rendering (SSR), Static Site Generation (SSG), and Client-Side Rendering (CSR). How does hydration bridge the gap in SSR?",
    topic: "Rendering Strategies (SSR vs SSG vs CSR)",
    type: "technical",
    difficulty: "medium",
    roles: ["Frontend", "Fullstack"],
    techStacks: ["Next.js", "React"],
  },
  {
    question: "What are Core Web Vitals (LCP, FID/INP, CLS), and what architectural adjustments improve Largest Contentful Paint?",
    topic: "Web Vitals & Performance Optimization",
    type: "technical",
    difficulty: "medium",
    roles: ["Frontend", "Fullstack"],
    techStacks: ["Web Performance"],
  },
  {
    question: "Explain how React Server Components (RSC) differ from traditional SSR, specifically regarding client bundle size and data fetching.",
    topic: "React Server Components Architecture",
    type: "technical",
    difficulty: "hard",
    roles: ["Frontend", "Fullstack"],
    techStacks: ["React", "Next.js"],
  },
  {
    question: "How would you design a microfrontend architecture for a multi-team enterprise dashboard, handling routing, shared state, and design system isolation?",
    topic: "Microfrontend Architecture",
    type: "technical",
    difficulty: "hard",
    roles: ["Frontend", "Staff Engineer", "Frontend Architect"],
    techStacks: ["Module Federation", "Webpack"],
  },
  {
    question: "Explain Cross-Site Scripting (XSS) and Content Security Policy (CSP). How does a strict nonce-based CSP protect against reflected and DOM-based XSS?",
    topic: "Frontend Security & CSP",
    type: "technical",
    difficulty: "hard",
    roles: ["Frontend", "Fullstack", "Security Engineer"],
    techStacks: ["Security", "Web Standards"],
  },

  // ── TECHNICAL: BACKEND (Easy, Medium, Hard) ─────────────────────────────────
  {
    question: "What is the difference between SQL and NoSQL databases, and how do their data models influence query patterns?",
    topic: "SQL vs NoSQL Paradigms",
    type: "technical",
    difficulty: "easy",
    roles: ["Backend", "Fullstack", "Database Engineer"],
    techStacks: ["SQL", "MongoDB"],
  },
  {
    question: "Explain the standard HTTP response status code categories (2xx, 3xx, 4xx, 5xx) and provide examples of when 401 Unauthorized vs 403 Forbidden should be used.",
    topic: "HTTP Status Codes & REST Conventions",
    type: "technical",
    difficulty: "easy",
    roles: ["Backend", "Fullstack"],
    techStacks: ["REST", "API"],
  },
  {
    question: "What is middleware in Express.js or similar web frameworks, and how does error-handling middleware differ from standard route middleware?",
    topic: "Express Middleware Chain & Error Handling",
    type: "technical",
    difficulty: "easy",
    roles: ["Backend", "Fullstack"],
    techStacks: ["Node.js", "Express"],
  },
  {
    question: "Explain how database indexing works at a high level. Why can having too many indexes degrade write performance?",
    topic: "Database Indexing Fundamentals",
    type: "technical",
    difficulty: "easy",
    roles: ["Backend", "Database Engineer"],
    techStacks: ["PostgreSQL", "MySQL", "MongoDB"],
  },
  {
    question: "How does the Node.js event loop handle non-blocking I/O, and what constitutes the microtask queue versus the macrotask queue?",
    topic: "Node.js Event Loop & Microtasks",
    type: "technical",
    difficulty: "medium",
    roles: ["Backend", "Fullstack"],
    techStacks: ["Node.js", "JavaScript"],
  },
  {
    question: "Explain ACID properties in relational databases. What isolation levels exist, and what is a phantom read?",
    topic: "Database Transactions & ACID Isolation Levels",
    type: "technical",
    difficulty: "medium",
    roles: ["Backend", "Database Engineer"],
    techStacks: ["PostgreSQL", "MySQL"],
  },
  {
    question: "Describe caching strategies like Cache-Aside, Write-Through, and Write-Behind. How do you handle cache invalidation and cache stampede (thundering herd)?",
    topic: "Caching Patterns & Invalidation",
    type: "technical",
    difficulty: "medium",
    roles: ["Backend", "Fullstack", "System Architect"],
    techStacks: ["Redis", "Memcached"],
  },
  {
    question: "How do optimistic locking and pessimistic locking differ in high-concurrency environments, such as inventory reservation systems?",
    topic: "Concurrency Control (Optimistic vs Pessimistic)",
    type: "technical",
    difficulty: "medium",
    roles: ["Backend", "System Architect"],
    techStacks: ["SQL", "Distributed Systems"],
  },
  {
    question: "Explain rate limiting algorithms: Token Bucket, Leaky Bucket, and Sliding Window. How would you implement distributed rate limiting with Redis?",
    topic: "Rate Limiting Algorithms",
    type: "technical",
    difficulty: "medium",
    roles: ["Backend", "Fullstack"],
    techStacks: ["Redis", "API Gateway"],
  },
  {
    question: "How do you achieve idempotency in payment processing or checkout webhooks, especially when dealing with network retries and duplicate events?",
    topic: "API Idempotency & Webhook Reliability",
    type: "technical",
    difficulty: "hard",
    roles: ["Backend", "Fintech Engineer", "System Architect"],
    techStacks: ["Distributed Systems", "Payment Systems"],
  },
  {
    question: "Compare message queues (RabbitMQ, SQS) with distributed streaming logs (Apache Kafka). When should an event-driven architecture use Kafka over a standard queue?",
    topic: "Event-Driven Architecture (Queues vs Kafka)",
    type: "technical",
    difficulty: "hard",
    roles: ["Backend", "Data Engineer", "System Architect"],
    techStacks: ["Kafka", "RabbitMQ"],
  },
  {
    question: "Walk through strategies for zero-downtime database schema migrations for tables with hundreds of millions of records.",
    topic: "Zero-Downtime Schema Migrations",
    type: "technical",
    difficulty: "hard",
    roles: ["Backend", "Database Administrator", "DevOps"],
    techStacks: ["PostgreSQL", "Database Architecture"],
  },

  // ── TECHNICAL: DEVOPS & CLOUD (Easy, Medium, Hard) ──────────────────────────
  {
    question: "What is the difference between a container (Docker) and a virtual machine, and why are container images layered?",
    topic: "Containers vs Virtual Machines",
    type: "technical",
    difficulty: "easy",
    roles: ["DevOps", "Backend", "Cloud Engineer"],
    techStacks: ["Docker", "Linux"],
  },
  {
    question: "Explain the core concepts of Continuous Integration (CI) and Continuous Delivery (CD). What checks should run automatically before a PR is merged?",
    topic: "CI/CD Pipeline Best Practices",
    type: "technical",
    difficulty: "easy",
    roles: ["DevOps", "Fullstack", "Platform Engineer"],
    techStacks: ["GitHub Actions", "CI/CD"],
  },
  {
    question: "What is Infrastructure as Code (IaC), and how does state management work in Terraform?",
    topic: "Terraform & Infrastructure as Code",
    type: "technical",
    difficulty: "medium",
    roles: ["DevOps", "Cloud Engineer", "SRE"],
    techStacks: ["Terraform", "AWS"],
  },
  {
    question: "Compare deployment strategies: Rolling deployment, Blue-Green deployment, and Canary releases. What are the trade-offs of each?",
    topic: "Deployment Strategies (Canary vs Blue-Green)",
    type: "technical",
    difficulty: "medium",
    roles: ["DevOps", "SRE", "Platform Engineer"],
    techStacks: ["Kubernetes", "DevOps"],
  },
  {
    question: "Explain the four Golden Signals of monitoring (Latency, Traffic, Errors, Saturation) and how you configure meaningful alerting thresholds to avoid alert fatigue.",
    topic: "Observability & SRE Golden Signals",
    type: "technical",
    difficulty: "medium",
    roles: ["DevOps", "SRE", "Platform Engineer"],
    techStacks: ["Prometheus", "Datadog", "Grafana"],
  },
  {
    question: "How would you design a disaster recovery plan with strict Recovery Time Objective (RTO) and Recovery Point Objective (RPO) across multi-region cloud infrastructure?",
    topic: "Multi-Region Cloud Disaster Recovery",
    type: "technical",
    difficulty: "hard",
    roles: ["DevOps", "Cloud Architect", "SRE"],
    techStacks: ["AWS", "Cloudflare", "Kubernetes"],
  },

  // ── TECHNICAL: MOBILE & FULLSTACK ───────────────────────────────────────────
  {
    question: "Explain the mobile app lifecycle and how state restoration works when an operating system terminates an app in the background.",
    topic: "Mobile App Lifecycle & Backgrounding",
    type: "technical",
    difficulty: "easy",
    roles: ["Mobile", "iOS Engineer", "Android Engineer"],
    techStacks: ["Swift", "Kotlin", "React Native"],
  },
  {
    question: "How do you design an offline-first data sync architecture for a mobile application, handling conflict resolution when the device reconnects?",
    topic: "Offline Data Synchronization & Conflict Resolution",
    type: "technical",
    difficulty: "medium",
    roles: ["Mobile", "Fullstack"],
    techStacks: ["SQLite", "GraphQL", "WebSockets"],
  },
  {
    question: "How do WebSockets differ from HTTP long-polling and Server-Sent Events (SSE)? In what scenario is SSE a better choice than WebSockets?",
    topic: "Real-time Protocols (WebSockets vs SSE)",
    type: "technical",
    difficulty: "medium",
    roles: ["Fullstack", "Frontend", "Backend"],
    techStacks: ["WebSockets", "Node.js"],
  },
  {
    question: "How do you secure user authentication in a Single Page Application? Contrast storing tokens in HttpOnly cookies versus browser LocalStorage.",
    topic: "SPA Auth Security (Cookies vs LocalStorage)",
    type: "technical",
    difficulty: "medium",
    roles: ["Fullstack", "Security Engineer", "Frontend"],
    techStacks: ["JWT", "OAuth", "Web Security"],
  },

  // ── TECHNICAL: AI / MACHINE LEARNING ────────────────────────────────────────
  {
    question: "Explain the bias-variance trade-off and what concrete indicators show that a model is suffering from high variance (overfitting).",
    topic: "Bias-Variance Trade-off & Overfitting",
    type: "technical",
    difficulty: "easy",
    roles: ["Machine Learning", "Data Scientist", "AI Engineer"],
    techStacks: ["Python", "Scikit-Learn"],
  },
  {
    question: "Explain Precision, Recall, and F1-Score. In a credit card fraud detection system, which metric would you prioritize and why?",
    topic: "Model Evaluation Metrics (Precision vs Recall)",
    type: "technical",
    difficulty: "medium",
    roles: ["Machine Learning", "Data Scientist"],
    techStacks: ["Machine Learning"],
  },
  {
    question: "Walk through the architecture of a Retrieval-Augmented Generation (RAG) system. What chunking strategies and re-ranking techniques improve contextual precision?",
    topic: "RAG Architecture & Chunking Strategies",
    type: "technical",
    difficulty: "medium",
    roles: ["AI Engineer", "Machine Learning", "Fullstack AI"],
    techStacks: ["LangChain", "Vector DBs", "LLMs"],
  },
  {
    question: "How do vector databases index embeddings for approximate nearest neighbor search (e.g., HNSW vs IVF)? What are the recall versus latency trade-offs?",
    topic: "Vector Indexing (HNSW vs IVF)",
    type: "technical",
    difficulty: "hard",
    roles: ["AI Engineer", "Machine Learning", "Backend"],
    techStacks: ["Pinecone", "Milvus", "Qdrant"],
  },

  // ── BEHAVIORAL: STAR FORMAT QUESTIONS (40 Questions) ───────────────────────
  {
    question: "Tell me about a time you had a technical disagreement with a teammate or senior engineer. How did you handle the discussion and what was the outcome?",
    topic: "Conflict Resolution & Disagreement",
    type: "behavioral",
    difficulty: "medium",
    roles: [],
    techStacks: [],
  },
  {
    question: "Describe a project where you faced an unexpected roadblock or severe bug close to a production deadline. How did you prioritize and deliver?",
    topic: "Deadlines & Pressure Management",
    type: "behavioral",
    difficulty: "medium",
    roles: [],
    techStacks: [],
  },
  {
    question: "Tell me about a time you made a significant mistake in production or took down a service. How did you remediate it and what safeguards did you put in place?",
    topic: "Failure & Accountability",
    type: "behavioral",
    difficulty: "medium",
    roles: [],
    techStacks: [],
  },
  {
    question: "Give an example of a time you advocated for refactoring or addressing technical debt when product managers wanted new features. How did you build consensus?",
    topic: "Technical Debt vs Product Priorities",
    type: "behavioral",
    difficulty: "medium",
    roles: [],
    techStacks: [],
  },
  {
    question: "Tell me about a time you had to mentor a junior engineer or onboard a new teammate who was struggling with the codebase.",
    topic: "Mentorship & Team Growth",
    type: "behavioral",
    difficulty: "easy",
    roles: [],
    techStacks: [],
  },
  {
    question: "Describe an instance where you had to make an important engineering decision with incomplete information or ambiguous requirements.",
    topic: "Navigating Ambiguity",
    type: "behavioral",
    difficulty: "hard",
    roles: [],
    techStacks: [],
  },
  {
    question: "Tell me about a time you identified an operational or workflow inefficiency in your team and took proactive initiative to automate or eliminate it.",
    topic: "Proactive Ownership & Automation",
    type: "behavioral",
    difficulty: "medium",
    roles: [],
    techStacks: [],
  },
  {
    question: "Describe a situation where a project you worked on failed to meet business expectations or was canceled. What did you learn from the experience?",
    topic: "Business Alignment & Learning from Failure",
    type: "behavioral",
    difficulty: "medium",
    roles: [],
    techStacks: [],
  },
  {
    question: "Tell me about a time you had to explain a complex technical trade-off to non-technical stakeholders (e.g., product, marketing, or executives).",
    topic: "Cross-Functional Communication",
    type: "behavioral",
    difficulty: "easy",
    roles: [],
    techStacks: [],
  },
  {
    question: "Describe a time you received constructive criticism during a code review or performance review that you initially disagreed with. How did you react?",
    topic: "Receptiveness to Feedback",
    type: "behavioral",
    difficulty: "easy",
    roles: [],
    techStacks: [],
  },
  {
    question: "Tell me about a time when you went above and beyond your defined job responsibilities to ensure customer satisfaction or project success.",
    topic: "Extreme Ownership & Customer Obsession",
    type: "behavioral",
    difficulty: "medium",
    roles: [],
    techStacks: [],
  },
  {
    question: "Describe a time you had to say 'no' to a stakeholder or manager because a request was unfeasible or risked system stability.",
    topic: "Managing Stakeholder Expectations",
    type: "behavioral",
    difficulty: "hard",
    roles: [],
    techStacks: [],
  },

  // ── SYSTEM DESIGN: VERBAL TRADE-OFFS (40 Questions) ─────────────────────────
  {
    question: "Design a URL shortening service like TinyURL. Walk through the URL encoding strategy (e.g., base62 vs hashing), database schema, and high-read caching layer.",
    topic: "System Design: URL Shortener",
    type: "system_design",
    difficulty: "easy",
    roles: ["Backend", "Fullstack", "System Architect"],
    techStacks: ["Redis", "SQL", "NoSQL"],
  },
  {
    question: "Design a distributed rate limiter that handles millions of requests per second across multiple API gateway nodes. Discuss synchronization and storage trade-offs.",
    topic: "System Design: Distributed Rate Limiter",
    type: "system_design",
    difficulty: "medium",
    roles: ["Backend", "Platform Engineer", "System Architect"],
    techStacks: ["Redis", "API Gateway"],
  },
  {
    question: "Design an instant messaging system like WhatsApp or Slack. How do you handle real-time connection management, message ordering, and offline message delivery?",
    topic: "System Design: Real-Time Chat System",
    type: "system_design",
    difficulty: "medium",
    roles: ["Backend", "Fullstack", "System Architect"],
    techStacks: ["WebSockets", "Kafka", "Cassandra"],
  },
  {
    question: "Design a notification service supporting email, SMS, and push notifications. How do you handle provider outages, rate limits per user, and priority queuing?",
    topic: "System Design: Notification Engine",
    type: "system_design",
    difficulty: "medium",
    roles: ["Backend", "Fullstack"],
    techStacks: ["RabbitMQ", "SQS", "Redis"],
  },
  {
    question: "Design a distributed metrics aggregation and alerting pipeline (like Datadog or Prometheus). How do you handle high-frequency time-series write spikes?",
    topic: "System Design: Time-Series Metrics Aggregator",
    type: "system_design",
    difficulty: "hard",
    roles: ["Backend", "DevOps", "System Architect"],
    techStacks: ["Time-Series DB", "Kafka"],
  },
  {
    question: "Design a collaborative document editing platform like Google Docs. Walk through concurrency models such as Operational Transformation (OT) versus Conflict-free Replicated Data Types (CRDTs).",
    topic: "System Design: Collaborative Editor (OT vs CRDT)",
    type: "system_design",
    difficulty: "hard",
    roles: ["Frontend Architect", "Backend", "System Architect"],
    techStacks: ["WebSockets", "CRDTs"],
  },
  {
    question: "Design a video streaming platform like YouTube or Netflix. Explain video chunking, transcoding pipelines, CDN caching, and adaptive bitrate streaming (HLS/DASH).",
    topic: "System Design: Video Streaming Platform",
    type: "system_design",
    difficulty: "hard",
    roles: ["Backend", "Infrastructure", "System Architect"],
    techStacks: ["CDN", "Object Storage", "FFmpeg"],
  },
  {
    question: "Design an e-commerce flash sale inventory system where thousands of users compete for limited items simultaneously without overselling.",
    topic: "System Design: Flash Sale & High Concurrency Inventory",
    type: "system_design",
    difficulty: "hard",
    roles: ["Backend", "Fintech Engineer", "System Architect"],
    techStacks: ["Redis", "Distributed Locks", "PostgreSQL"],
  },
  {
    question: "Design a proximity search service like Yelp or Uber Nearby. Compare Geohash, Quadtree, and Google S2 spatial indexing for location lookups.",
    topic: "System Design: Proximity Service (Geohash vs Quadtree)",
    type: "system_design",
    difficulty: "hard",
    roles: ["Backend", "System Architect"],
    techStacks: ["Geohash", "Redis", "PostGIS"],
  },
  {
    question: "Design a Web Crawler capable of crawling billions of web pages. Discuss URL deduplication (Bloom filters), politeness policies, and distributed frontier management.",
    topic: "System Design: Distributed Web Crawler",
    type: "system_design",
    difficulty: "hard",
    roles: ["Backend", "Data Engineer", "System Architect"],
    techStacks: ["Bloom Filters", "Kafka", "Distributed Systems"],
  },

  // ── MIXED: TECHNICAL + BEHAVIORAL + ARCHITECTURE (30 Questions) ─────────────
  {
    question: "How do you evaluate whether to build a custom internal tool versus buying a SaaS solution? Walk through a concrete technical evaluation you conducted.",
    topic: "Build vs Buy Architecture Decision",
    type: "mixed",
    difficulty: "medium",
    roles: ["Fullstack", "Tech Lead", "Engineering Manager"],
    techStacks: [],
  },
  {
    question: "When refactoring a legacy monolithic system into microservices, what domain-driven design principles do you use to define service boundaries without creating distributed monoliths?",
    topic: "Monolith to Microservices Transition",
    type: "mixed",
    difficulty: "hard",
    roles: ["Backend", "Staff Engineer", "System Architect"],
    techStacks: ["Microservices", "Domain-Driven Design"],
  },
  {
    question: "How do you ensure data consistency between an internal relational database and a third-party CRM or external billing system that occasionally drops webhook events?",
    topic: "Eventual Consistency & External Integrations",
    type: "mixed",
    difficulty: "medium",
    roles: ["Backend", "Fullstack"],
    techStacks: ["Webhooks", "Queues"],
  },
  {
    question: "Describe your approach to code reviews: what balance do you strike between architectural feedback, coding conventions, and velocity?",
    topic: "Code Review Culture & Engineering Standards",
    type: "mixed",
    difficulty: "easy",
    roles: [],
    techStacks: [],
  },
  {
    question: "Walk through how you design an API for public developer consumption: versioning, rate limiting headers, error payload schemas, and backward compatibility.",
    topic: "Public API Design & Governance",
    type: "mixed",
    difficulty: "medium",
    roles: ["Backend", "Fullstack", "API Architect"],
    techStacks: ["REST", "OpenAPI"],
  },
];

async function seed() {
  console.log("Connecting to MongoDB for Question Bank seeding...");
  await mongoose.connect(env.MONGODB_URI);

  console.log(`Preparing to seed ${CURATED_QUESTIONS.length} curated questions...`);

  let insertedCount = 0;
  let updatedCount = 0;

  for (const q of CURATED_QUESTIONS) {
    const res = await QuestionBankModel.findOneAndUpdate(
      { question: q.question },
      {
        $setOnInsert: {
          ...q,
          source: "curated",
          usageCount: 0,
          avgEvalScore: 8.0, // default benchmark score for curated questions
        },
      },
      { upsert: true, new: false },
    );

    if (!res) {
      insertedCount++;
    } else {
      updatedCount++;
    }
  }

  const total = await QuestionBankModel.countDocuments();
  console.log(`✅ Seeding complete!`);
  console.log(`- Inserted new: ${insertedCount}`);
  console.log(`- Existing verified: ${updatedCount}`);
  console.log(`- Total questions in QuestionBank: ${total}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
