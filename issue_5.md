# Implementasi Endpoint Get Current User

## Deskripsi Tugas
Tugas ini bertujuan untuk menambahkan endpoint API baru untuk mendapatkan profil dari *user* yang saat ini sedang login. Kamu diminta untuk membuat endpoint `GET /api/users/current` menggunakan framework Elysia JS, serta memvalidasi token otentikasi yang dikirim melalui *Header Authorization*.

## Kebutuhan API (Endpoint Get Current User)

Buatkan satu buah endpoint untuk mengambil data user berdasarkan token.

- **Endpoint:** `GET /api/users/current`
- **Headers:**
  - `Authorization: Bearer <token>`
  *(Catatan penting: token ini adalah UUID yang sebelumnya diserahkan saat user melakukan proses login dan tersimpan di tabel `sessions`. Validasi token ini untuk mengetahui id user yang bersangkutan).*
- **Response Body - Success (JSON):**
  ```json
  {
    "Data": {
      "id": 1,
      "name": "ardi",
      "email": "ardi@localhost",
      "created_at": "timestamp"
    }
  }
  ```
- **Response Body - Error (JSON):**
  ```json
  {
    "error": "Unauthorized"
  }
  ```

## Aturan Struktur Folder & Penamaan File

Untuk menjaga kerapian proyek, patuhi aturan struktur dan penamaan file berikut:

1. **Routes (`src/routes/`)**
   - **Fungsi:** Tempat meletakkan definisi routing endpoint Elysia JS.
   - **Format Penamaan File:** Gunakan file `users-routes.ts` yang sudah ada (tambahkan *route* di file ini).
2. **Services (`src/services/`)**
   - **Fungsi:** Tempat meletakkan inti *business logic* (seperti proses ekstraksi token, validasi ke database tabel `sessions`, dan pengambilan profil dari tabel `users`).
   - **Format Penamaan File:** Gunakan file `users-services.ts` yang sudah ada.

---

## Tahapan Implementasi (Langkah demi Langkah)

Untuk menyelesaikan fitur ini, ikuti urutan langkah-langkah di bawah ini:

### 1. Buat Business Logic di Service (`src/services/users-services.ts`)
- Buka file `users-services.ts` di dalam direktori `src/services/`.
- Buat fungsi baru dengan nama `getCurrentUser(authHeader: string | undefined)`.
- **Logika di dalam fungsi `getCurrentUser`:**
  1. Lakukan pengecekan apakah nilai `authHeader` terisi. Jika kosong/tidak ada, lemparkan *error* dengan pesan `Unauthorized`.
  2. Periksa format header. Format standar adalah `"Bearer <token>"`. Ambil *string* nilai token aslinya (hapus kata "Bearer "). Jika format tidak sesuai, lemparkan *error* `Unauthorized`.
  3. Lakukan proses *query* ke database Drizzle ORM. Lakukan pencarian di tabel `sessions` menggunakan `token` yang barusan diekstrak.
  4. Bila tidak ditemukan di tabel `sessions`, lemparkan *error* `Unauthorized`.
  5. Bila ditemukan, ambil nilai `userId` dari hasil pencarian `sessions` tersebut, lalu lakukan pencarian ke tabel `users` berdasarkan `id` = `userId`. (Atau bisa juga diselesaikan dengan satu *query* menggunakan metode `join` database).
  6. Jika user ternyata tidak ditemukan di tabel `users`, lemparkan *error* `Unauthorized`.
  7. Jika *user* ditemukan, kembalikan data *user* tersebut, **namun** hanya menyertakan field `id`, `name`, `email`, dan `createdAt`. Jangan pernah mengembalikan kolom `password`!

### 2. Buat Routing Endpoint (`src/routes/users-routes.ts`)
- Buka file `users-routes.ts` yang ada di `src/routes/`.
- Tambahkan pendefinisian endpoint tambahan `.get("/users/current", ...)` di dalam router Elysia.
- Pada fungsi *handler* rute tersebut, gunakan objek konteks (misal `{ headers, set }`) untuk mengambil nilai header otorisasi melalui `headers.authorization`.
- Panggil fungsi `getCurrentUser` (dari `users-services.ts`) dengan mem-passing parameter `headers.authorization`.
- Tangani format kembalian (*response*):
  - Saat `try` berhasil, kembalikan objek balasan dengan format data terbungkus di dalam properti `"Data"` (contoh: `return { Data: userProfile };`).
  - Saat ditangkap *error* pada blok `catch` (misalnya karena `Unauthorized`), ubah status code respons menjadi 401 dan kembalikan objek `return { error: "Unauthorized" };`.

### 3. Uji Coba (Testing)
- Nyalakan server secara lokal (biasanya dengan menjalankan perintah `bun run dev`).
- Uji Coba Gagal (Tanpa Token): Lakukan permintaan HTTP GET ke `/api/users/current` menggunakan alat bantu seperti Postman, curl, atau file `.http`. Jangan kirim *header* apapun. Pastikan Anda mendapat balasan berupa `"error": "Unauthorized"`.
- Uji Coba Berhasil: 
  1. Lakukan pendaftaran (*register*) atau *login* melalui `POST /api/users/login` terlebih dahulu untuk mendapatkan token asli.
  2. Sisipkan token tersebut dalam *request* ke endpoint `/api/users/current` menggunakan Header dengan *key* `Authorization` dan *value* `Bearer <token_yang_diterima>`.
  3. Pastikan balasan yang muncul berisi informasi profil Anda dengan format JSON yang sesuai (*success body*).
