# Bug: Nama User Terpotong (Truncated) Saat Registrasi Jika Terlalu Panjang

## Deskripsi Bug
Telah ditemukan sebuah *bug* pada fungsionalitas pendaftaran (*register*) pengguna baru. Ketika ada *request* masuk untuk mendaftar dengan nama yang panjangnya melebihi 255 karakter, API kita tetap menganggapnya valid dan membalas dengan status sukses (`{"Data": "Ok"}`).

Namun di balik layar, nama tersebut terpotong otomatis menjadi tepat 255 karakter saat disisipkan ke database MySQL. Hal ini disebabkan karena skema database (Drizzle ORM) telah membatasi kolom `name` maksimal sebesar 255 karakter (`varchar(255)`). Di sisi lain, *route* Elysia JS kita belum memiliki validasi batas panjang karakter, sehingga data dibiarkan masuk ke dalam *service* dan langsung dipaksa masuk ke database.

## Target Perbaikan
Kita harus memutus rantai *bug* ini di pintu gerbang utama (level Routing/API). API harus secara proaktif menolak dan mengembalikan HTTP *error validation* jika panjang karakter pada atribut `Name` melampaui batas yang diizinkan, sebelum membebani fungsi *service*.

## Lokasi File yang Perlu Diubah
- **Routes:** `src/routes/users-routes.ts`

---

## Tahapan Perbaikan (Langkah demi Langkah)

Untuk mengatasi *bug* ini, kamu hanya perlu mengikuti instruksi sederhana berikut:

### 1. Update Skema Validasi di Elysia Route
- Buka file `users-routes.ts` di dalam direktori `src/routes/`.
- Temukan bagian di mana *endpoint* registrasi `POST /api/users` didefinisikan.
- Perhatikan argumen ketiga pada definisi route tersebut, yaitu bagian di mana *schema validation* untuk `body` menggunakan kelas TypeBox (`t.Object`).
- Saat ini pendefinisian field tersebut tidak memiliki batas:
  ```typescript
  body: t.Object({
    Name: t.String(),
    Email: t.String(),
    Password: t.String(),
  })
  ```
- Tambahkan properti validasi batas maksimum karakter dengan menggunakan parameter konfigurasi `{ maxLength: 255 }` pada atribut Name. Untuk pencegahan jangka panjang, berikan juga konfigurasi yang sama pada `Email` dan `Password`. Modifikasi kodenya menjadi seperti berikut:
  ```typescript
  body: t.Object({
    Name: t.String({ minLength: 3, maxLength: 255 }),
    Email: t.String({ format: "email", minLength: 3, maxLength: 255 }),
    Password: t.String({ minLength: 6, maxLength: 255 }),
  })
  ```
*(Catatan: Dengan menambahkan `maxLength`, jika ada payload yang melebihi batas, Elysia JS akan secara otomatis mencegah eksekusi fungsi handler dan melempar respons HTTP status 422 Unprocessable Entity berisikan detail error).*

### 2. Uji Coba (Testing)
Setelah diubah, jalankan server (`bun run dev`) dan lakukan uji coba validasi ini:
1. **Skenario Nama Terlalu Panjang:** Kirim HTTP request `POST` ke `/api/users` dengan menyisipkan nilai "Name" sepanjang 300 karakter (bisa dengan menyalin huruf "A" berulang-ulang).
   - Ekspektasi: API menolak *request* dan membalas dengan status validasi error (Biasanya berstatus HTTP 400 atau 422 bawaan Elysia). Jangan sampai sistem membalas `{"Data": "Ok"}`.
2. **Skenario Nama Normal:** Kirim HTTP request `POST` ke `/api/users` dengan data wajar (panjang < 255 karakter).
   - Ekspektasi: Registrasi sukses, mengembalikan balasan `{"Data": "Ok"}` dan utuh masuk ke database tanpa terpotong.
