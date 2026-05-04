import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { db } from "./db/db";
import { users } from "./db/schema";
import { usersRoutes } from "./routes/users-routes";

const app = new Elysia()
  .use(swagger({
    documentation: {
      info: {
        title: 'Belajar Vibe Coding - API Documentation',
        version: '1.0.0',
        description: 'Dokumentasi RESTful API untuk User Management'
      }
    }
  }))
  .use(usersRoutes)
  .get("/", () => "Hello Elysia")
  .get("/users", async () => {
    try {
      return await db.select().from(users);
    } catch (error) {
      return { error: "Database connection failed. Make sure your DATABASE_URL is correct." };
    }
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
