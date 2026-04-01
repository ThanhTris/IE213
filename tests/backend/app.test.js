const request = require("supertest");
const app = require("../../backend/src/app");

describe("App Core Configuration & Middlewares", () => {
  it("GET /health should return 200 and server running JSON message", async () => {
    const res = await request(app).get("/health");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({ status: "OK" });
    expect(res.body.message).toBe("Server is running");
  });

  it("GET /api/duong-dan-ma should return 404 with standardized error", async () => {
    const res = await request(app).get("/api/duong-dan-ma");

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.message).toBe("Không tìm thấy đường dẫn");
  });
});
