const request = require("supertest");
const app = require("../../backend/src/app");

// Test product
describe("Product Endpoint", () => {
  it("GET /api/products should return 200 with empty array", async () => {
    const res = await request(app).get("/api/products");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
    expect(res.body.message).toBe("Products retrieved");
  });
});
