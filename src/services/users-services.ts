import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { users, sessions } from "../db/schema";

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

export const loginUser = async (user: any) => {
  const { Email, Password } = user;

  // 1. Cari user di database berdasarkan Email
  const existingUser = await db.select().from(users).where(eq(users.email, Email)).limit(1);
  if (existingUser.length === 0) {
    throw new Error("Email atau password salah");
  }

  // 2. Verifikasi password hash
  const isValidPassword = await Bun.password.verify(Password, existingUser[0].password);
  if (!isValidPassword) {
    throw new Error("Email atau password salah");
  }

  // 3. Generate token UUID
  const token = crypto.randomUUID();

  // 4. Simpan session ke database
  await db.insert(sessions).values({
    token,
    userId: existingUser[0].id,
  });

  // 5. Kembalikan token
  return token;
};
