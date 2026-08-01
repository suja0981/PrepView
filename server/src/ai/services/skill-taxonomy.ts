/**
 * Skill Taxonomy & Normalization Layer
 * Standardizes common tech variants/synonyms to canonical names
 * and provides robust skill matching (exact, alias, and token/stem matching).
 */

const SKILL_ALIASES: Record<string, string> = {
  // Frontend
  "react": "react",
  "reactjs": "react",
  "react.js": "react",
  "vue": "vue.js",
  "vuejs": "vue.js",
  "vue.js": "vue.js",
  "next": "next.js",
  "nextjs": "next.js",
  "next.js": "next.js",
  "angularjs": "angular",
  "ts": "typescript",
  "js": "javascript",

  // Backend & Runtime
  "node": "node.js",
  "nodejs": "node.js",
  "node.js": "node.js",
  "express": "express.js",
  "expressjs": "express.js",
  "express.js": "express.js",
  "py": "python",
  "golang": "go",
  "rb": "ruby",
  "dotnet": ".net",
  "asp.net": ".net",

  // Databases & Storage
  "postgres": "postgresql",
  "postgresql": "postgresql",
  "mongo": "mongodb",
  "mongodb": "mongodb",
  "redis": "redis",
  "mysql": "mysql",
  "mssql": "sql server",

  // Cloud & DevOps
  "aws": "aws",
  "amazon web services": "aws",
  "gcp": "google cloud",
  "google cloud platform": "google cloud",
  "k8s": "kubernetes",
  "kubernetes": "kubernetes",
  "docker": "docker",

  // APIs & Architecture
  "rest": "rest api",
  "restful": "rest api",
  "rest api": "rest api",
  "restful api": "rest api",
  "restful apis": "rest api",
  "rest apis": "rest api",
  "api": "rest api",
  "apis": "rest api",
  "graphql": "graphql",
  "grpc": "grpc",
  "microservice": "microservices",
  "microservices": "microservices",
};

/**
 * Normalizes a raw skill string into a clean, canonical skill representation.
 */
export function normalizeSkill(skill: string): string {
  const clean = skill
    .trim()
    .toLowerCase()
    .replace(/[^\w\s.#+-]/g, "")
    .replace(/\s+/g, " ");

  if (SKILL_ALIASES[clean]) {
    return SKILL_ALIASES[clean];
  }

  // Check if phrase contains known alias keys (e.g. "building restful apis" contains "restful apis")
  for (const [aliasKey, canonical] of Object.entries(SKILL_ALIASES)) {
    if (aliasKey.length > 2 && clean.includes(aliasKey)) {
      return canonical;
    }
  }

  return clean;
}

/**
 * Checks if a candidate skill matches a target JD skill.
 * Supports:
 * 1. Exact canonical alias match (e.g. "ReactJS" == "React")
 * 2. Token containment (e.g. "PostgreSQL Database" matches "PostgreSQL", "building RESTful APIs" matches "REST API")
 */
export function isSkillMatch(candidateSkill: string, jdSkill: string): boolean {
  const normCandidate = normalizeSkill(candidateSkill);
  const normJd = normalizeSkill(jdSkill);

  // 1. Direct or Alias Match
  if (normCandidate === normJd) return true;

  // 2. Token Containment
  if (normCandidate.includes(normJd) || normJd.includes(normCandidate)) return true;

  return false;
}
