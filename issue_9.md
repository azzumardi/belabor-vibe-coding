# Implementasi Swagger UI untuk Dokumentasi API

## Deskripsi Tugas
Tugas ini bertujuan untuk menyediakan halaman dokumentasi API yang interaktif menggunakan **Swagger UI**. Dengan adanya Swagger, pengembang lain atau *client app* dapat dengan mudah melihat kontrak API (endpoint, payload, headers, response) dan bisa langsung menguji API tersebut melalui antarmuka visual di browser (biasanya via endpoint `/swagger`).

Karena aplikasi kita menggunakan *framework* Elysia JS, integrasi ini dapat dilakukan dengan sangat efisien menggunakan *plugin* resmi `@elysiajs/swagger`.

---

## Tahapan Implementasi (Langkah demi Langkah)

Tolong jalankan langkah-langkah detail di bawah ini untuk mengimplementasikan fitur Swagger:

### 1. Instalasi Dependency (Plugin)
- Buka terminal/konsol yang mengarah ke *root* direktori proyek.
- Lakukan instalasi *package* resmi dari Elysia dengan menjalankan perintah:
  ```bash
  bun add @elysiajs/swagger
  ```

### 2. Registrasi Plugin di Entry Point (`src/index.ts`)
- Buka file utama aplikasi, yaitu `src/index.ts`.
- Lakukan *import* plugin `swagger` di bagian paling atas file:
  ```typescript
  import { swagger } from "@elysiajs/swagger";
  ```
- Modifikasi inisialisasi instance `app` (Elysia) untuk menyertakan (me-`.use()`) plugin swagger. Pastikan plugin ini disisipkan **sebelum** memuat *routes* yang lain agar ia bisa mendeteksi *route* yang terdaftar setelahnya. Tambahkan juga sedikit konfigurasi `documentation` untuk menamai judul API.
  Contoh implementasi:
  ```typescript
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
    // ... rute .get("/") dan lainnya biarkan seperti semula
  ```

### 3. Tambahkan Metadata Dokumentasi pada Routes (`src/routes/users-routes.ts`)
Agar tampilan Swagger UI tidak hanya berisi kerangka kosong, kita harus memberinya konteks (deskripsi dan pengelompokan/ *tags*).
- Buka file `src/routes/users-routes.ts`.
- Pada setiap definisi rute (parameter ke-3 berupa *object* tempat mendefinisikan `body`), tambahkan properti `detail`.
- Di dalam objek `detail`, tambahkan:
  - `tags: ['Users']` (agar semua endpoint pengguna dikelompokkan ke dalam satu grup "Users").
  - `summary` (penjelasan singkat maksimal 1 kalimat).
  - `description` (penjelasan lebih panjang terkait behavior API).
- **Contoh untuk endpoint Registrasi:**
  ```typescript
  .post(
    "/users",
    async ({ body, set }) => { /* handler code... */ },
    {
      body: t.Object({ ... }),
      detail: {
        tags: ['Users'],
        summary: 'Daftar pengguna baru',
        description: 'Endpoint untuk melakukan registrasi pengguna baru menggunakan Name, Email, dan Password.'
      }
    }
  )
  ```
- **Tugasmu:** Lakukan hal yang sama (tambahkan blok `detail` dan tag `'Users'`) untuk ketiga endpoint sisanya: `/users/login`, `/users/current`, dan `/users/logout`.

### 4. Uji Coba (Testing)
- Nyalakan server di lokal dengan perintah:
  ```bash
  bun run dev
  ```
- Buka *browser* (Chrome/Firefox/dll) dan navigasikan ke URL: `http://localhost:3000/swagger`.
- **Ekspektasi Hasil:**
  1. Halaman web interaktif Swagger UI termuat dengan judul "Belajar Vibe Coding - API Documentation".
  2. Terdapat blok kelompok "Users".
  3. Di dalamnya memuat 4 buah endpoint (POST registrasi, POST login, GET current, DELETE logout) dengan *summary* yang telah kamu buat.
  4. Klik tombol "Try it out" pada endpoint `/users` (Registrasi), isikan data, dan pastikan API bisa ditembak dan menghasilkan respons yang sah dari database langsung dari halaman tersebut.
