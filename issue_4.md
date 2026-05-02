# Implementasi Fitur Login User & Session Management

## Deskripsi Tugas
Tugas ini bertujuan untuk menambahkan fungsionalitas login bagi pengguna yang sudah terdaftar. Kamu akan diminta untuk membuat tabel `sessions` untuk menyimpan token login pengguna dan membuat endpoint API untuk memproses otentikasi login menggunakan Elysia JS.

## Kebutuhan Skema Database

Buatlah tabel baru bernama `sessions` dengan spesifikasi kolom sebagai berikut:
- `id`: integer, auto increment, primary key
- `token`: varchar(255), not null (ini akan berisi UUID sebagai token akses untuk pengguna yang berhasil login)
- `user_id`: integer, not null (merupakan Foreign Key yang merujuk ke tabel `users`)
- `created_at`: timestamp, default current_timestamp

**Instruksi:** 
Tambahkan definisi tabel ini ke dalam skema database Drizzle ORM kamu (biasanya di file schema). Jangan lupa untuk menjalankan migrasi database (push/generate) setelah skema diperbarui.

## Kebutuhan API (Endpoint Login)

Buatkan satu buah endpoint untuk menangani proses login.

- **Endpoint:** `POST /api/users/login`
- **Request Body (JSON):**
  ```json
  {
    "Email": "ardi@localhost",
    "Password": "rahasia"
  }
  ```
- **Response Body - Success (JSON):**
  ```json
  {
    "Data": "token-uuid-akan-tampil-di-sini"
  }
  ```
- **Response Body - Error (JSON):**
  ```json
  {
    "Error": "Email atau password salah"
  }
  ```

## Aturan Struktur Folder & Penamaan File

Untuk menjaga kerapian proyek, pastikan kamu mengikuti aturan struktur dan penamaan file di dalam folder `src/` ini:

1. **Routes (`src/routes/`)**
   - **Fungsi:** Folder ini khusus berisi definisi routing endpoint menggunakan Elysia JS.
   - **Format Penamaan File:** Gunakan format jamak dengan akhiran `-routes.ts` (contoh: `users-routes.ts`).
2. **Services (`src/services/`)**
   - **Fungsi:** Folder ini khusus berisi inti *business logic* aplikasi (seperti validasi input, query ke database, komparasi password, dan pembuatan token).
   - **Format Penamaan File:** Gunakan format jamak dengan akhiran `-services.ts` (contoh: `users-services.ts`).

---

## Tahapan Implementasi (Langkah demi Langkah)

Untuk menyelesaikan fitur ini, ikuti urutan tahapan berikut dengan teliti:

### 1. Update Skema Database
- Buka file definisi skema Drizzle ORM kamu.
- Tambahkan pendefinisian tabel `sessions` sesuai spesifikasi di atas beserta relasinya dengan tabel `users` (Foreign Key).
- Jalankan perintah *generate* atau *push* dari Drizzle untuk mengaplikasikan struktur tabel baru ini ke dalam database MySQL.

### 2. Buat Business Logic di Service (`src/services/users-services.ts`)
- Buat atau edit file `users-services.ts` di dalam folder `src/services/`.
- Buat sebuah fungsi `login(requestBody)` yang menerima payload email dan password dari user.
- **Logika di dalam fungsi:**
  1. Cari user di database berdasarkan `Email` dari tabel `users`.
  2. Jika user tidak ditemukan, lemparkan *error* dengan pesan `Email atau password salah`.
  3. Jika user ditemukan, bandingkan `Password` dari input dengan password yang ada di database. Pastikan menggunakan metode komparasi *hash* yang sama dengan saat fitur registrasi dibuat (misalnya menggunakan bcrypt/argon2).
  4. Jika hasil komparasi password tidak cocok, lemparkan *error* dengan pesan `Email atau password salah`.
  5. Jika password cocok, *generate* sebuah string `UUID` baru untuk dijadikan token.
  6. Simpan token `UUID` tersebut beserta `user_id` milik user yang sedang login ke dalam tabel `sessions`.
  7. Kembalikan/return nilai `token` tersebut dari fungsi ini.

### 3. Buat Routing Endpoint (`src/routes/users-routes.ts`)
- Buat atau edit file `users-routes.ts` di dalam folder `src/routes/`.
- Definisikan endpoint `POST /api/users/login`.
- Panggil fungsi `login` dari `users-services.ts` yang sudah dibuat pada langkah sebelumnya dengan mengirimkan payload dari `body`.
- Tangani format *response* agar sesuai dengan kontrak API yang diminta: 
  - Jika proses berhasil, bungkus token dalam properti `"Data"`.
  - Jika terjadi error (misalnya kredensial salah), tangkap error tersebut dan kembalikan properti `"Error"` dengan status code yang relevan (misal 400 atau 401).
- Pastikan routing dari file `users-routes.ts` ini sudah didaftarkan pada instance utama Elysia kamu (biasanya di file `src/index.ts`).

### 4. Uji Coba (Testing)
- Jalankan server Elysia kamu (biasanya `bun run dev`).
- Lakukan request HTTP POST ke `/api/users/login` menggunakan kredensial (email/password) yang salah. Pastikan kamu mendapatkan response error.
- Lakukan request HTTP POST dengan kredensial user yang benar (yang sudah ada di database). Pastikan kamu menerima balasan berisi token UUID.
- Cek tabel `sessions` di dalam database kamu untuk memastikan data token dan `user_id` telah berhasil disisipkan.
