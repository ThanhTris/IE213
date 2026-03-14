const request = require("supertest");
const app = require("../../backend/src/app");

describe("Health Check", () => {
  it("GET /api/health should return standardized success payload", async () => {
    const res = await request(app).get("/api/health");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({ status: "OK" });
    expect(res.body.message).toBe("Server is running");
  });

  it("GET /health should return 404", async () => {
    const res = await request(app).get("/health");

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeNull();
    expect(res.body.error).toBe("Route not found");
  });
});

describe("Removed Root Endpoint", () => {
  it("GET /api should return 404", async () => {
    const res = await request(app).get("/api");

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeNull();
    expect(res.body.error).toBe("Route not found");
  });
});

describe("404 Handler", () => {
  it("GET /unknown should return 404", async () => {
    const res = await request(app).get("/unknown-route");

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeNull();
    expect(res.body.error).toBe("Route not found");
  });
});
