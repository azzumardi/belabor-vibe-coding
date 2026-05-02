# Implementasi Endpoint Logout User

## Deskripsi Tugas
Tugas ini bertujuan untuk menambahkan fungsionalitas **logout** bagi pengguna yang saat ini sedang login. Kamu diminta untuk membuat endpoint API menggunakan Elysia JS yang akan memvalidasi token *Authorization* dari *Header*, dan kemudian **menghapus** data *session* (token) tersebut dari database agar token usang tidak bisa digunakan lagi.

## Kebutuhan API (Endpoint Logout)

Buatkan satu buah endpoint untuk memproses permintaan logout.

> **Catatan Endpoint:**
> Pada permintaan (*request*) sebelumnya tertulis `GET /api/users/current`, namun untuk fungsionalitas logout, *best practice* yang seharusnya digunakan adalah method HTTP `DELETE` dengan path `/api/users/logout`. Oleh karena itu, kita akan menggunakan endpoint tersebut.

- **Endpoint:** `DELETE /api/users/logout`
- **Headers:**
  - `Authorization: Bearer <token>`
  *(Catatan: token ini adalah token UUID yang ada di tabel `sessions`. Kamu perlu memvalidasi eksistensi token ini sebelum menghapusnya).*
- **Response Body - Success (JSON):**
  ```json
  {
    "Data": "Ok"
  }
  ```
- **Response Body - Error (JSON):**
  ```json
  {
    "error": "Unauthorized"
  }
  ```
- **Aksi Database:** Jika proses validasi token berhasil, maka baris data di tabel `sessions` yang memiliki token tersebut **harus dihapus** secara permanen.

## Aturan Struktur Folder & Penamaan File

Patuhi aturan struktur dan penamaan file berikut:

1. **Routes (`src/routes/`)**
   - **Fungsi:** Tempat meletakkan definisi routing endpoint Elysia JS.
   - **Format Penamaan File:** Gunakan file `users-routes.ts` yang sudah ada (cukup tambahkan *route* baru di file ini).
2. **Services (`src/services/`)**
   - **Fungsi:** Tempat meletakkan inti *business logic* (seperti proses ekstraksi token, validasi eksistensi token di database, dan menjalankan operasi `delete` pada tabel `sessions` menggunakan Drizzle ORM).
   - **Format Penamaan File:** Gunakan file `users-services.ts` yang sudah ada.

---

## Tahapan Implementasi (Langkah demi Langkah)

Untuk menyelesaikan fitur ini, ikuti urutan langkah-langkah di bawah ini:

### 1. Buat Business Logic di Service (`src/services/users-services.ts`)
- Buka file `users-services.ts` di dalam direktori `src/services/`.
- Buat fungsi baru dengan nama `logoutUser(authHeader: string | undefined)`.
- **Logika di dalam fungsi `logoutUser`:**
  1. Lakukan pengecekan apakah nilai `authHeader` terisi. Jika kosong/tidak ada, lemparkan *error* dengan pesan `Unauthorized`.
  2. Periksa format header. Pastikan formatnya adalah `"Bearer <token>"`. Ambil *string* nilai token aslinya. Jika format tidak sesuai, lemparkan *error* `Unauthorized`.
  3. Lakukan proses *query* ke database Drizzle ORM. Cek apakah token tersebut benar-benar ada di tabel `sessions`.
  4. Bila token tidak ditemukan di tabel `sessions`, lemparkan *error* `Unauthorized`.
  5. Bila token valid dan ditemukan, jalankan perintah penghapusan data (`db.delete(sessions).where(...)`) untuk menghapus token tersebut dari tabel `sessions`.

### 2. Buat Routing Endpoint (`src/routes/users-routes.ts`)
- Buka file `users-routes.ts` yang ada di `src/routes/`.
- Tambahkan pendefinisian endpoint tambahan `.delete("/users/logout", ...)` di dalam *chain* router Elysia.
- Pada fungsi *handler* rute tersebut, ambil nilai header otorisasi melalui objek *context* `headers.authorization`.
- Panggil fungsi `logoutUser` (dari `users-services.ts`) dengan mem-passing parameter `headers.authorization`.
- Tangani format kembalian (*response*):
  - Saat blok `try` berhasil dieksekusi (fungsi `logoutUser` berjalan sempurna tanpa melemparkan error), kembalikan objek balasan sukses: `return { Data: "Ok" };`.
  - Saat ditangkap *error* pada blok `catch` (karena token salah/kosong), ubah status HTTP respons menjadi 401 dan kembalikan objek `return { error: "Unauthorized" };`.

### 3. Uji Coba (Testing)
- Nyalakan server secara lokal (biasanya dengan menjalankan perintah `bun run dev`).
- **Uji Coba Gagal (Tanpa Token):** Lakukan HTTP request `DELETE` ke `/api/users/logout` tanpa menyertakan *header* apapun. Pastikan Anda mendapat balasan `"error": "Unauthorized"`.
- **Uji Coba Berhasil:** 
  1. Lakukan Login melalui `POST /api/users/login` untuk mendapatkan token aktif.
  2. Lakukan HTTP request `DELETE` ke `/api/users/logout` menggunakan Header `Authorization: Bearer <token_aktif>`. Pastikan mendapat balasan sukses `{"Data": "Ok"}`.
  3. *Cross check*: Lakukan kembali request `GET /api/users/current` menggunakan token yang barusan dihapus/logout. Karena sesi sudah dihapus dari tabel, sistem harus menganggap token invalid dan mengembalikan `"error": "Unauthorized"`.
