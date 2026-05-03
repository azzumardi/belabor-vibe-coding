import { describe, it, expect, beforeEach } from "bun:test";
import { usersRoutes } from "../src/routes/users-routes";
import { db } from "../src/db/db";
import { users, sessions } from "../src/db/schema";

const app = usersRoutes;

describe("User API Tests", () => {
  beforeEach(async () => {
    // Cleanup database: sessions first, then users
    await db.delete(sessions);
    await db.delete(users);
  });

  describe("1. Registration (POST /api/users)", () => {
    it("should register a new user successfully with valid payload", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Name: "Junior Dev",
            Email: "junior@example.com",
            Password: "password123",
          }),
        })
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ Data: "Ok" });
    });

    it("should fail to register with a duplicate email", async () => {
      // First registration
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Name: "First User",
            Email: "duplicate@example.com",
            Password: "password123",
          }),
        })
      );

      // Second registration with same email
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Name: "Second User",
            Email: "duplicate@example.com",
            Password: "password123",
          }),
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.Error).toBe("Email sudah terdaftar");
    });

    it("should fail validation if Name is too long (> 255)", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Name: "A".repeat(256),
            Email: "long@example.com",
            Password: "password123",
          }),
        })
      );

      expect(response.status).toBe(422); // Validation error
    });

    it("should fail validation if Email is invalid", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Name: "User",
            Email: "invalid-email",
            Password: "password123",
          }),
        })
      );

      expect(response.status).toBe(422);
    });
  });

  describe("2. Login (POST /api/users/login)", () => {
    beforeEach(async () => {
      // Register a user for login tests
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Name: "Login User",
            Email: "login@example.com",
            Password: "password123",
          }),
        })
      );
    });

    it("should login successfully and return a token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Email: "login@example.com",
            Password: "password123",
          }),
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.Data).toBeDefined();
      expect(typeof data.Data).toBe("string");
    });

    it("should fail login with wrong password", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Email: "login@example.com",
            Password: "wrongpassword",
          }),
        })
      );

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.Error).toBe("Email atau password salah");
    });
  });

  describe("3. Get Current User (GET /api/users/current)", () => {
    let token: string;

    beforeEach(async () => {
      // Register and login to get token
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Name: "Current User",
            Email: "current@example.com",
            Password: "password123",
          }),
        })
      );

      const loginRes = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Email: "current@example.com",
            Password: "password123",
          }),
        })
      );
      const loginData = await loginRes.json();
      token = loginData.Data;
    });

    it("should return user profile with valid token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.Data).toBeDefined();
      expect(data.Data.email).toBe("current@example.com");
      expect(data.Data.name).toBe("Current User");
      expect(data.Data.password).toBeUndefined(); // Password should not be returned
    });

    it("should fail without Authorization header", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
        })
      );

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });
  });

  describe("4. Logout (DELETE /api/users/logout)", () => {
    let token: string;

    beforeEach(async () => {
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Name: "Logout User",
            Email: "logout@example.com",
            Password: "password123",
          }),
        })
      );

      const loginRes = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Email: "logout@example.com",
            Password: "password123",
          }),
        })
      );
      const loginData = await loginRes.json();
      token = loginData.Data;
    });

    it("should logout successfully and delete session", async () => {
      const logoutRes = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      expect(logoutRes.status).toBe(200);
      expect(await logoutRes.json()).toEqual({ Data: "Ok" });

      // Verify session is deleted by trying to get current user
      const verifyRes = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      expect(verifyRes.status).toBe(401);
    });
  });

});
