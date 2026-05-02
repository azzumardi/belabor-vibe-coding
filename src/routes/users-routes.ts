import { Elysia, t } from "elysia";
import { registerUser, loginUser } from "../services/users-services";

export const usersRoutes = new Elysia({ prefix: "/api" }).post(
  "/users",
  async ({ body, set }) => {
    try {
      await registerUser(body);
      return { Data: "Ok" };
    } catch (error: any) {
      set.status = 400;
      return { Error: error.message || "Terjadi kesalahan" };
    }
  },
  {
    body: t.Object({
      Name: t.String(),
      Email: t.String(),
      Password: t.String(),
    }),
  }
).post(
  "/users/login",
  async ({ body, set }) => {
    try {
      const token = await loginUser(body);
      return { Data: token };
    } catch (error: any) {
      set.status = 401; // Unauthorized
      return { Error: error.message || "Email atau password salah" };
    }
  },
  {
    body: t.Object({
      Email: t.String(),
      Password: t.String(),
    }),
  }
);
