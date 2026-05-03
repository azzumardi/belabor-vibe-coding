# Belajar Vibe Coding - User Management API

Aplikasi ini adalah sebuah RESTful API sederhana untuk manajemen pengguna (User Management) yang menyediakan fitur otentikasi. Dibangun untuk mendemonstrasikan integrasi modern *backend framework* dengan performa tinggi menggunakan Bun dan ekosistem di sekitarnya.

## 🚀 Technology Stack

Aplikasi ini dibangun menggunakan teknologi berikut:
- **Runtime:** [Bun](https://bun.sh/) (JavaScript/TypeScript runtime yang sangat cepat)
- **Web Framework:** [ElysiaJS](https://elysiajs.com/) (Framework web berkinerja tinggi untuk Bun)
- **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/) (TypeScript ORM yang ringan dan *type-safe*)
- **Database:** MySQL
- **Testing:** `bun:test` (Bawaan dari Bun)
- **Hashing Password:** `Bun.password` (Menggunakan algoritma Argon2 bawaan Bun)

## 📁 Arsitektur & Struktur Folder

Aplikasi ini menerapkan pemisahan lapisan (Separation of Concerns) sederhana agar kode tetap bersih dan mudah dipelihara.

```text
.
├── src/
│   ├── db/                 # Koneksi database & definisi skema ORM
│   │   ├── db.ts           # Instance koneksi MySQL 
│   │   └── schema.ts       # Definisi tabel Drizzle ORM
│   ├── routes/             # Controller / Routing endpoint (Elysia)
│   │   └── users-routes.ts # Routing untuk API pengguna
│   ├── services/           # Business Logic aplikasi
│   │   └── users-services.ts # Logika validasi, komparasi, dan akses database
│   └── index.ts            # Entry point aplikasi (Inisialisasi Elysia)
├── tests/                  # Unit tests
│   └── users.test.ts       # Skenario pengujian API pengguna
├── drizzle.config.ts       # Konfigurasi Drizzle ORM
├── package.json            
└── tsconfig.json           
```

**Aturan Penamaan File:**
- `routes/`: Menggunakan format jamak dengan akhiran `-routes.ts` (contoh: `users-routes.ts`).
- `services/`: Menggunakan format jamak dengan akhiran `-services.ts` (contoh: `users-services.ts`).

## 🗄️ Database Schema

Aplikasi ini menggunakan 2 tabel utama yang berelasi:

### 1. Tabel `users`
Menyimpan data otentikasi profil pengguna.
- `id`: `serial` / `bigint unsigned auto_increment` (Primary Key)
- `name`: `varchar(255)` - Nama pengguna
- `email`: `varchar(255)` - Email pengguna (Unik)
- `password`: `varchar(255)` - Password terenkripsi (Hashed)
- `createdAt`: `timestamp` - Waktu pembuatan akun

### 2. Tabel `sessions`
Menyimpan sesi aktif / token akses pengguna yang sedang login.
- `id`: `serial` (Primary Key)
- `token`: `varchar(255)` - Token akses (UUID)
- `userId`: `bigint unsigned` - Foreign Key ke tabel `users`
- `createdAt`: `timestamp` - Waktu sesi dimulai

---

## 🌐 API Endpoints

Seluruh API berada di bawah prefix `/api`.

### 1. Registrasi User
- **Endpoint:** `POST /api/users`
- **Body (JSON):**
  ```json
  {
    "Name": "John Doe",
    "Email": "john@example.com",
    "Password": "password123"
  }
  ```
- **Response Sukses:** `{"Data": "Ok"}`
- **Response Gagal:** `422 Unprocessable Entity` (jika format salah) atau `400 Bad Request` (jika email duplikat).

### 2. Login User
- **Endpoint:** `POST /api/users/login`
- **Body (JSON):**
  ```json
  {
    "Email": "john@example.com",
    "Password": "password123"
  }
  ```
- **Response Sukses:** `{"Data": "<token_uuid>"}`
- **Response Gagal:** `401 Unauthorized` (jika email/password salah).

### 3. Get Current User (Profil)
- **Endpoint:** `GET /api/users/current`
- **Headers:** `Authorization: Bearer <token_uuid>`
- **Response Sukses:**
  ```json
  {
    "Data": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-05-01T12:00:00.000Z"
    }
  }
  ```
- **Response Gagal:** `401 Unauthorized` (jika token tidak valid/tidak ada).

### 4. Logout User
- **Endpoint:** `DELETE /api/users/logout`
- **Headers:** `Authorization: Bearer <token_uuid>`
- **Response Sukses:** `{"Data": "Ok"}` (Token akan dihapus dari database).
- **Response Gagal:** `401 Unauthorized`.

---

## 🛠️ Cara Setup Project

1. **Prasyarat:** Pastikan Anda telah menginstal [Bun](https://bun.sh/) dan server MySQL di komputer Anda.
2. **Kloning Repositori:**
   ```bash
   git clone <repo_url>
   cd belajar-vibe-coding
   ```
3. **Instalasi Dependensi:**
   ```bash
   bun install
   ```
4. **Konfigurasi Database:**
   Buat file `.env` di *root* direktori dan tambahkan koneksi MySQL Anda:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/nama_database"
   ```
5. **Migrasi Skema Database:**
   Terapkan struktur tabel ke database MySQL menggunakan Drizzle:
   ```bash
   bunx drizzle-kit push
   ```

## 🚀 Cara Menjalankan Aplikasi

Jalankan server dalam mode *development* (otomatis me-*reload* jika ada perubahan kode):

```bash
bun run dev
```

Server Elysia akan menyala dan siap menerima *request* di: `http://localhost:3000`

## 🧪 Cara Melakukan Testing

Aplikasi ini dilengkapi dengan sekumpulan *unit tests* yang komprehensif menggunakan `bun:test` untuk memvalidasi kelancaran setiap *endpoint*. Pengujian ini secara mandiri mensimulasikan koneksi *request-response* terhadap instance Elysia JS.

Untuk menjalankan seluruh tes:

```bash
bun test
```

*(Catatan: Pengujian ini akan mereset data di dalam tabel `sessions` dan `users` pada database yang dihubungkan melalui file `.env`. Berhati-hatilah agar tidak menggunakan database produksi).*
