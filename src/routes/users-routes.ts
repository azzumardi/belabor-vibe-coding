import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/users-services";

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
      Name: t.String({ minLength: 3, maxLength: 255 }),
      Email: t.String({ format: "email", minLength: 3, maxLength: 255 }),
      Password: t.String({ minLength: 6, maxLength: 255 }),
    }),
    detail: {
      tags: ['Users'],
      summary: 'Daftar pengguna baru',
      description: 'Endpoint untuk melakukan registrasi pengguna baru menggunakan Name, Email, dan Password.'
    }
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
    detail: {
      tags: ['Users'],
      summary: 'Login pengguna',
      description: 'Endpoint untuk melakukan login dan mendapatkan token akses.'
    }
  }
).get(
  "/users/current",
  async ({ headers, set }) => {
    try {
      const user = await getCurrentUser(headers.authorization);
      return { Data: user };
    } catch (error: any) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  },
  {
    detail: {
      tags: ['Users'],
      summary: 'Dapatkan profil pengguna',
      description: 'Endpoint untuk mengambil data profil pengguna yang sedang login berdasarkan token.'
    }
  }
).delete(
  "/users/logout",
  async ({ headers, set }) => {
    try {
      await logoutUser(headers.authorization);
      return { Data: "Ok" };
    } catch (error: any) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  },
  {
    detail: {
      tags: ['Users'],
      summary: 'Logout pengguna',
      description: 'Endpoint untuk menghapus sesi pengguna (logout).'
    }
  }
);
