# Pembuatan Unit Test untuk Seluruh Endpoint API

## Deskripsi Tugas
Tugas ini bertujuan untuk memastikan kualitas dan konsistensi seluruh fungsionalitas API yang telah dibangun dengan membuat *Unit Tests* secara komprehensif. Kamu diminta untuk menyusun pengujian menggunakan alat bawaan (*test runner*) dari Bun, yaitu `bun test`.

## Aturan Struktur & Teknologi
- **Lokasi Direktori:** Simpan semua file spesifikasi pengujian di dalam folder `tests/` di *root* proyek (Contoh penamaan: `tests/users.test.ts`).
- **Test Runner:** Gunakan fungsionalitas dari module `bun:test` (`describe`, `it`, `expect`, `beforeAll`, `beforeEach`, dll).
- **Simulasi API:** Karena kita menggunakan Elysia JS, kamu dapat melakukan simulasi request HTTP secara langsung memanggil instance server (tanpa perlu membuka port/jaringan) menggunakan fitur `app.handle(new Request(...))`.

## Aturan Setup Database (Wajib!)
Agar setiap *test case* berjalan secara terisolasi dan konsisten, data di dalam database harus direset.
Kamu diwajibkan untuk membuat instruksi pembersihan data (*cleanup*) di dalam blok *setup* (`beforeAll` / `beforeEach` / `afterEach`) yang bertugas **menghapus semua data dari tabel `sessions` dan `users`**.
*(Tips: Selalu hapus tabel `sessions` terlebih dahulu sebelum menghapus tabel `users` untuk menghindari error batasan Foreign Key).*

---

## Daftar Skenario Pengujian (Test Scenarios)

Implementasikan skenario *unit test* untuk setiap API berikut sedetail mungkin tanpa harus terpaku pada struktur kode tertentu. Silakan buat detail *assertions*-nya sendiri sesuai dengan kontrak respon API dan *logic* di bawah ini:

### 1. Registrasi User (`POST /api/users`)
- Skenario: Harus mengembalikan respons sukses apabila payload pendaftaran (Name, Email, Password) valid dan lengkap.
- Skenario: Harus mengembalikan error apabila email yang digunakan sudah terdaftar (duplikat).
- Skenario: Harus mengembalikan error validasi (422) apabila atribut Name melebihi batas maksimal (255) atau terlalu pendek (< 3).
- Skenario: Harus mengembalikan error validasi apabila format Email salah.
- Skenario: Harus mengembalikan error validasi apabila panjang Password tidak memenuhi syarat minimal (misal < 6 karakter).

### 2. Login User (`POST /api/users/login`)
- Skenario: Harus berhasil mengembalikan Token UUID apabila kombinasi Email dan Password terdaftar dan cocok.
- Skenario: Harus dipastikan bahwa token login beserta `user_id` yang sah berhasil disisipkan (*insert*) ke dalam tabel `sessions` di database.
- Skenario: Harus mengembalikan error `Unauthorized` / salah kredensial jika email tidak ada di database.
- Skenario: Harus mengembalikan error `Unauthorized` / salah kredensial jika password yang diinputkan keliru.

### 3. Get Current User (`GET /api/users/current`)
- Skenario: Harus mengembalikan data profil pengguna yang sah (seperti id, name, email, createdAt — **kecuali password**) ketika request dikirim bersama header `Authorization: Bearer <token_yang_valid>`.
- Skenario: Harus menolak request (mengembalikan `Unauthorized`) jika header Authorization tidak disisipkan sama sekali.
- Skenario: Harus menolak request jika token yang disisipkan fiktif, tidak ditemukan di tabel `sessions`, atau format header tidak valid.

### 4. Logout User (`DELETE /api/users/logout`)
- Skenario: Harus mengembalikan respons sukses (`"Data": "Ok"`) dan memproses *logout* jika header otorisasi memuat token yang aktif.
- Skenario: Harus memverifikasi bahwa baris data di tabel `sessions` yang mengandung token terkait benar-benar **terhapus** dari database setelah proses logout berhasil.
- Skenario: Harus mengembalikan pesan error `Unauthorized` apabila *endpoint* logout diakses tanpa token atau menggunakan token yang salah/usang.

> **Catatan Implementasi:** Silakan terjemahkan daftar skenario di atas menjadi baris-baris kode `bun test` dengan pendekatan *clean code* terbaik menurutmu. Jangan ragu untuk menambahkan skenario *edge-cases* lain jika memang diperlukan.
