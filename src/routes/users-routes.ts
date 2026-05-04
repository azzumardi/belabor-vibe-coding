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
    },
    response: {
      200: t.Object({
        Data: t.String({ example: 'Ok' })
      }),
      400: t.Object({
        Error: t.String({ example: 'Email sudah terdaftar' })
      })
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
    },
    response: {
      200: t.Object({
        Data: t.String({ example: '2f8b3318-9091-4e81-a308-1fd04e3c3be5' })
      }),
      401: t.Object({
        Error: t.String({ example: 'Email atau password salah' })
      })
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
    },
    response: {
      200: t.Object({
        Data: t.Object({
          id: t.Number({ example: 1 }),
          name: t.String({ example: 'Ardi' }),
          email: t.String({ example: 'ardi@localhost' }),
          createdAt: t.String({ example: '2024-05-01T12:00:00.000Z' })
        })
      }),
      401: t.Object({
        error: t.String({ example: 'Unauthorized' })
      })
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
    },
    response: {
      200: t.Object({
        Data: t.String({ example: 'Ok' })
      }),
      401: t.Object({
        error: t.String({ example: 'Unauthorized' })
      })
    }
  }
);
