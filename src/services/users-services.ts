import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { users } from "../db/schema";

export const registerUser = async (user: any) => {
  const { Name, Email, Password } = user;

  // 1. Cek apakah email sudah terdaftar
  const existingUser = await db.select().from(users).where(eq(users.email, Email)).limit(1);
  if (existingUser.length > 0) {
    throw new Error("Email sudah terdaftar");
  }

  // 2. Hash password (menggunakan bun:password)
  const hashedPassword = await Bun.password.hash(Password);

  // 3. Insert user baru ke database
  await db.insert(users).values({
    name: Name,
    email: Email,
    password: hashedPassword,
  });
};
