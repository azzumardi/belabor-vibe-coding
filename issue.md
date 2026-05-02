# Fitur Registrasi User (Backend)

Dokumen ini berisi panduan implementasi langkah demi langkah untuk fitur registrasi pengguna baru menggunakan Bun, Elysia, dan Drizzle ORM. Harap ikuti instruksi di bawah ini dengan teliti.

## 1. Persiapan Dependency Tambahan
Pastikan kamu menginstal library untuk melakukan hashing password, yaitu `bcrypt`. (Bisa juga menggunakan `bun:password` bawaan Bun jika lebih disukai, tetapi pastikan menggunakan skema bcrypt). Jika menggunakan paket eksternal `bcrypt`:
- Jalankan perintah: `bun add bcrypt`
- Jalankan perintah: `bun add -d @types/bcrypt`

## 2. Update Database Schema (`src/db/schema.ts`)
Update schema tabel `users` yang sudah ada agar sesuai dengan spesifikasi berikut:
- `id`: integer, auto increment, primary key
- `name`: varchar(255), not null
- `email`: varchar(255), not null, unique
- `password`: varchar(255), not null (akan menyimpan hash password)
- `created_at`: timestamp, default ke current_timestamp

Setelah schema diupdate, jangan lupa jalankan migrasi database menggunakan Drizzle Kit (`bun run db:generate` dan `bun run db:push`).

## 3. Buat Folder Structure
Buat folder baru di dalam folder `src` untuk merapikan struktur kode:
- `src/routes/`: Untuk menyimpan file routing Elysia.
- `src/services/`: Untuk menyimpan file yang berisi business logic.

## 4. Buat Service Layer (`src/services/users-services.ts`)
Buat file `users-services.ts` di dalam folder `src/services/`.
File ini bertanggung jawab untuk menangani logika bisnis registrasi.
- Buat sebuah function (misalnya `registerUser`) yang menerima input `Name`, `Email`, dan `Password`.
- **Langkah-langkah dalam function:**
  1. Lakukan query ke database menggunakan Drizzle untuk mengecek apakah `Email` yang diinput sudah ada di tabel `users`.
  2. Jika email sudah ada, lemparkan custom error atau kembalikan pesan gagal.
  3. Jika email belum ada, lakukan hashing pada `Password` menggunakan `bcrypt`.
  4. Insert data user baru (name, email, password yang sudah di-hash) ke dalam tabel `users`.

## 5. Buat Route Layer (`src/routes/users-routes.ts`)
Buat file `users-routes.ts` di dalam folder `src/routes/`.
- Buat plugin Elysia baru di dalam file ini.
- Definisikan endpoint HTTP `POST /api/users`.
- Parsing Request Body. **Format Request Body yang diharapkan:**
  ```json
  {
    "Name": "Ardi",
    "Email": "ardi@localhost",
    "Password": "rahasia"
  }
  ```
- Di dalam handler endpoint ini, panggil function `registerUser` dari `users-services.ts` dengan data dari body.
- **Response Handling:**
  - Jika registrasi berhasil, kembalikan HTTP status code 200/201 dengan JSON body:
    ```json
    {
      "Data": "Ok"
    }
    ```
  - Jika registrasi gagal (misalnya karena error "Email sudah terdaftar" dari service), tangkap error tersebut dan kembalikan HTTP status code 400 dengan JSON body:
    ```json
    {
      "Error": "Email sudah terdaftar"
    }
    ```

## 6. Integrasi ke Entry Point (`src/index.ts`)
- Buka file `src/index.ts`.
- Import plugin route yang sudah dibuat dari `src/routes/users-routes.ts`.
- Daftarkan route tersebut ke dalam instance utama aplikasi Elysia (`app.use(...)`) agar endpoint `POST /api/users` terekspos dan bisa diakses.

## Kriteria Penerimaan (Acceptance Criteria)
- Endpoint `POST /api/users` berjalan dengan normal dan dapat dipanggil lewat REST API client.
- Password tersimpan di database secara aman dalam bentuk hash bcrypt.
- Sistem menolak pendaftaran jika email sudah digunakan dan mengembalikan format JSON error yang tepat.
- Struktur folder (`routes` dan `services`) serta standar penamaan file ditaati dengan baik.
