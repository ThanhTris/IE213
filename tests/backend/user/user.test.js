const request = require("supertest");
const app = require("../../backend/src/app");

// Test user
describe("User Endpoint", () => {
  it("GET /api/users should return 404", async () => {
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeNull();
    expect(res.body.error).toBe("Route not found");
  });
});
