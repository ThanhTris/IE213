const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "../tests/backend/app.test.js",
      "../tests/backend/user/**/*.test.js",
    ],
  },
});
