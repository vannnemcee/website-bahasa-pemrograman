/**
 * introData.js — Data panduan awal untuk setiap kategori
 */

export const categoryIntro = {
  html: {
    abbreviation: "HyperText Markup Language",
    tagline: "Bahasa Penanda Struktur Halaman Web",
    description:
      "HTML adalah bahasa standar untuk membuat dan menyusun STRUKTUR halaman web. Setiap halaman web yang kamu lihat di internet — dibuat menggunakan HTML. HTML bukan bahasa pemrograman, melainkan bahasa MARKUP yang memberitahu browser bagaimana menampilkan konten.",
    kepanjangan: [
      { huruf: "H", kata: "Hyper", arti: "Teks yang bisa terhubung satu sama lain (hyperlink)" },
      { huruf: "T", kata: "Text", arti: "Berbasis teks — bisa ditulis di text editor biasa" },
      { huruf: "M", kata: "Markup", arti: "Menggunakan tag <> untuk menandai konten" },
      { huruf: "L", kata: "Language", arti: "Bahasa standar yang dimengerti oleh browser" },
    ],
    facts: [
      "🌐 Diciptakan oleh Tim Berners-Lee pada tahun 1991",
      "📄 Versi modern adalah HTML5 yang mendukung audio, video, dan kanvas",
      "🏷️ HTML menggunakan TAG seperti <h1>, <p>, <a> untuk menandai elemen",
      "🚀 Setiap website di internet PASTI menggunakan HTML sebagai fondasi",
      "⚡ Browser membaca HTML dan mengubahnya jadi tampilan visual di layar",
    ],
    whatYouLearn: [
      "Membuat judul dan sub-judul (h1 - h6)",
      "Menulis paragraf teks terstruktur",
      "Menambahkan tombol interaktif",
      "Membuat hyperlink navigasi halaman",
      "Menampilkan gambar dengan atribut src & alt",
      "Membuat form dan kolom input teks",
      "Menyusun daftar poin dengan ul dan li",
      "Mengelompokkan tata letak dengan div",
    ],
    icon: "</>",
    color: "#FF667D",
    colorDark: "#aa2244",
    example: `<!DOCTYPE html>
<html>
  <head>
    <title>Halaman Ku</title>
  </head>
  <body>
    <h1>Halo Dunia!</h1>
    <p>Ini adalah halaman web pertamaku.</p>
    <input type="text" placeholder="Masukkan nama" />
    <button>Klik Saya</button>
  </body>
</html>`,
    bonusTitle: "TUGAS BEBAS HTML",
    bonusInstruction:
      "Buatlah halaman web bebas menggunakan HTML! Gunakan kombinasi tag heading, paragraf, button, link, input, dan gambar yang telah kamu pelajari. Tidak ada aturan — ekspresikan kreativitasmu!",
    bonusPlaceholder: `<!DOCTYPE html>
<html>
  <head>
    <title>Web Portofolioku</title>
  </head>
  <body>
    <h1>Selamat Datang!</h1>
    <p>Saya sedang belajar membuat website.</p>
    <button>Kunjungi Profil</button>
  </body>
</html>`,
    bonusMinLength: 20,
  },

  css: {
    abbreviation: "Cascading Style Sheets",
    tagline: "Bahasa Desain dan Gaya Tampilan Halaman Web",
    description:
      "CSS adalah bahasa yang digunakan untuk MENDESAIN dan MEMPERCANTIK tampilan halaman HTML. Jika HTML adalah kerangka tulang bangunan, maka CSS adalah cat dinding, jendela kaca, dekorasi interior, dan tata letak estetikanya.",
    kepanjangan: [
      { huruf: "C", kata: "Cascading", arti: "Aturan gaya mengalir dari atas ke bawah secara berurutan" },
      { huruf: "S", kata: "Style", arti: "Mengatur gaya visual: warna, ukuran, font, dan jarak" },
      { huruf: "S", kata: "Sheets", arti: "Lembar dokumen instruksi desain yang terpisah dari HTML" },
    ],
    facts: [
      "🎨 Diciptakan oleh Hakon Wium Lie pada 10 Oktober 1994",
      "🌈 Mendukung lebih dari 16 juta kombinasi warna (RGB, Hex, HSL)",
      "📱 Membuat website responsif dan pas di layar HP maupun laptop",
      "✨ Bisa membuat animasi halus tanpa bantuan JavaScript",
      "🎯 Format dasarnya sangat sederhana: selector { property: value; }",
    ],
    whatYouLearn: [
      "Mengubah warna teks (color) & background",
      "Mengatur ukuran font teks (font-size)",
      "Membuat garis tepi (border) & sudut melengkung (border-radius)",
      "Mengatur jarak dalam (padding) & jarak luar (margin)",
      "Meratakan posisi teks ke tengah (text-align)",
      "Menambahkan bayangan bergaya retro (box-shadow)",
      "Mengaktifkan tata letak fleksibel (display: flex)",
    ],
    icon: "✦",
    color: "#4CC9F0",
    colorDark: "#006699",
    example: `/* Kartu Profil Retro */
.kartu {
  background-color: #1a1a2e;
  color: #4CC9F0;
  font-size: 16px;
  border: 2px solid #4CC9F0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}`,
    bonusTitle: "TUGAS BEBAS CSS",
    bonusInstruction:
      "Desainlah kotak preview dengan berbagai property CSS yang telah kamu pelajari! Bereksperimenlah dengan kombinasi warna, border, padding, border-radius, dan bayangan.",
    bonusPlaceholder: `/* Desain kotak gayamu sendiri! */
color: #4CC9F0;
background-color: #0f172a;
font-size: 20px;
border: 2px solid #38bdf8;
border-radius: 12px;
padding: 24px;
text-align: center;`,
    bonusMinLength: 10,
  },

  javascript: {
    abbreviation: "JavaScript Programming Language",
    tagline: "Bahasa Pemrograman Web yang Membuat Halaman Hidup",
    description:
      "JavaScript adalah bahasa PEMROGRAMAN yang membuat halaman web menjadi interaktif dan dinamis. Berbeda dengan HTML dan CSS, JavaScript bisa membuat website BERPIKIR dan BEREAKSI terhadap aksi pengguna. Dari animasi, game, hingga aplikasi web modern — semuanya menggunakan JavaScript.",
    kepanjangan: [
      { huruf: "J", kata: "Java", arti: "Nama terinspirasi dari kopi dan tren era 90-an (bukan bahasa Java!)" },
      { huruf: "S", kata: "Script", arti: "Bahasa scripting yang berjalan langsung di browser pengguna" },
    ],
    catatan: "⚠️ JavaScript BUKAN Java! Keduanya adalah bahasa pemrograman yang BERBEDA sama sekali.",
    facts: [
      "⚡ Diciptakan oleh Brendan Eich pada tahun 1995 — hanya dalam 10 hari!",
      "🌍 Bahasa pemrograman paling populer di dunia selama 10+ tahun berturut-turut",
      "🖥️ Berjalan langsung di browser — tidak perlu instalasi apapun",
      "📦 Bisa digunakan untuk membuat website, aplikasi mobile, game, dan server",
      "🤖 Digunakan oleh perusahaan teknologi dunia: Google, Netflix, Meta, YouTube",
    ],
    whatYouLearn: [
      "Menampilkan pesan log di console (console.log)",
      "Membuat popup interaktif dengan alert()",
      "Menyimpan data ke variable (let, const)",
      "Melakukan operasi hitung matematika",
      "Membuat logika kondisi dengan if statement",
      "Membuat fungsi reusable (function & arrow function)",
      "Menyimpan kumpulan data dengan array []",
      "Menggabungkan teks dengan template literals",
      "Perulangan otomatis dengan for loop",
    ],
    icon: "{}",
    color: "#FFD166",
    colorDark: "#aa7700",
    example: `// Program JavaScript
let nama = "Programmer";
let level = 1;

console.log("Selamat datang, " + nama);

if (level > 0) {
  console.log("Siap memulai quest coding!");
}`,
    bonusTitle: "TUGAS BEBAS JAVASCRIPT",
    bonusInstruction:
      "Buatlah program JavaScript bebas! Gunakan kombinasi variable, kondisi if, perulangan for, dan function yang sudah kamu pelajari. Tidak ada jawaban yang salah — berkreasi sesuka hati!",
    bonusPlaceholder: `// Tulis kode JavaScript bebasmu di sini!
let nama = "Evan";
let skor = 100;

console.log("Halo, " + nama);
console.log("Skormu: " + skor);

if (skor >= 100) {
  console.log("Selamat! Kamu mencapai skor maksimal!");
}`,
    bonusMinLength: 15,
  },

  python: {
    abbreviation: "Python Programming Language",
    tagline: "Bahasa Pemrograman Modern yang Bersih, Kuat & Serbaguna",
    description:
      "Python adalah bahasa pemrograman tingkat tinggi yang dirancang agar mudah dibaca dan dipahami seperti bahasa Inggris. Digunakan secara luas untuk kecerdasan buatan (AI), analisis data, pembuatan bot, hingga pengembangan aplikasi web dan game.",
    kepanjangan: [
      { huruf: "P", kata: "Power", arti: "Sangat kuat untuk AI, Machine Learning, dan otomatisasi" },
      { huruf: "Y", kata: "Yield", arti: "Menghasilkan kode efisien dengan baris yang jauh lebih sedikit" },
      { huruf: "T", kata: "Typing", arti: "Dynamic Typing yang fleksibel dan sangat ramah bagi pemula" },
      { huruf: "H", kata: "High-level", arti: "Tingkat tinggi, sintaksis bersih dan mendekati bahasa manusia" },
      { huruf: "O", kata: "Open", arti: "Open-source, 100% gratis, dan didukung komunitas internasional" },
      { huruf: "N", kata: "Named", arti: "Dinamai oleh penciptanya dari serial komedi Monty Python" },
    ],
    catatan: "🐍 Python menggunakan spasi/indentasi untuk menandai blok kode, bukan kurung kurawal {}!",
    facts: [
      "⚡ Diciptakan oleh Guido van Rossum pada tahun 1991 di Belanda",
      "🤖 Bahasa nomor #1 di dunia untuk AI, Machine Learning & Data Science",
      "🚀 Digunakan oleh raksasa teknologi: NASA, Google, Netflix, Spotify, Instagram",
      "📚 Sintaksisnya sangat ringkas sehingga proses belajar jauh lebih cepat",
      "🖥️ Sangat populer untuk otomatisasi tugas harian dan pemrograman robotika",
    ],
    whatYouLearn: [
      "Mencetak teks dan angka dengan print()",
      "Menyimpan nilai ke dalam variable tanpa kata kunci rumit",
      "Melakukan operasi hitung matematika otomatis",
      "Logika pengkondisian dengan pernyataan if",
      "Menyimpan banyak data dalam sebuah list []",
      "Perulangan otomatis dengan for dan range()",
      "Mendefinisikan fungsi kustom dengan kata kunci def",
      "Menggabungkan teks modern dengan fitur f-string",
    ],
    icon: "🐍",
    color: "#4ADE80",
    colorDark: "#15803d",
    example: `# Program Python Modern
nama = "Programmer Muda"
tahun = 2026

print(f"Halo, {nama}!")
print("Tahun Belajar:", tahun)

if tahun >= 2026:
    print("Era AI dan Coding Masa Depan!")`,
    bonusTitle: "TUGAS BEBAS PYTHON",
    bonusInstruction:
      "Buatlah program Python bebas! Gunakan kombinasi print(), variable, operasi matematika, dan kondisi if yang sudah kamu pelajari. Berkreasi sesuka hati!",
    bonusPlaceholder: `# Tulis program Python bebasmu di sini!
nama = "Programmer Hebat"
nilai_a = 15
nilai_b = 25
total = nilai_a + nilai_b

print("Nama:", nama)
print("Hasil Penjumlahan:", total)

if total > 30:
    print("Hebat! Total melebihi 30!")`,
    bonusMinLength: 15,
  },
};
