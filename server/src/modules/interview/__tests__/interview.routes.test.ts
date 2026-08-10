import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../../app";

const app = createApp();

describe("Interview Routes (Supertest Integration)", () => {
  describe("GET /api/v1/interviews without authentication", () => {
    it("should return 401 Authentication required when token cookie is missing", async () => {
      const response = await request(app).get("/api/v1/interviews");
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Authentication required");
    });
  });

  describe("POST /api/v1/interviews without authentication", () => {
    it("should return 401 Authentication required when token cookie is missing", async () => {
      const response = await request(app)
        .post("/api/v1/interviews")
        .send({
          role: "Frontend Engineer",
          difficulty: "medium",
          type: "technical",
          mode: "text",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
