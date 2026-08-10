import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../../app";

const app = createApp();

describe("Auth Routes (Supertest Integration)", () => {
  describe("GET /", () => {
    it("should return 200 health check info", async () => {
      const response = await request(app).get("/");
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.service).toBe("prepview-server");
    });
  });

  describe("POST /api/v1/auth/register Validation", () => {
    it("should return 400 validation error if body is empty", async () => {
      const response = await request(app).post("/api/v1/auth/register").send({});
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it("should return 400 validation error if password is too short", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({ name: "Alex", email: "alex@example.com", password: "123" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/login Validation", () => {
    it("should return 400 validation error on invalid email format", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "invalid-email", password: "Password123" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
