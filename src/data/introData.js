/**
 * introData.js — Data panduan awal untuk setiap kategori
 */

export const categoryIntro = {
  html: {
    abbreviation: "HyperText Markup Language",
    tagline: "Bahasa Penanda Halaman Web",
    description:
      "HTML adalah bahasa standar untuk membuat dan menyusun STRUKTUR halaman web. Setiap halaman web yang kamu lihat di internet — dibuat menggunakan HTML. HTML bukan bahasa pemrograman, melainkan bahasa MARKUP yang memberitahu browser bagaimana menampilkan konten.",
    kepanjangan: [
      { huruf: "H", kata: "Hyper", arti: "Teks yang bisa terhubung satu sama lain (hyperlink)" },
      { huruf: "T", kata: "Text", arti: "Berbasis teks — bisa ditulis di Notepad biasa" },
      { huruf: "M", kata: "Markup", arti: "Menggunakan tag <> untuk menandai konten" },
      { huruf: "L", kata: "Language", arti: "Bahasa yang dimengerti oleh browser" },
    ],
    facts: [
      "🌐 Diciptakan oleh Tim Berners-Lee pada tahun 1991",
      "📄 Versi terbaru adalah HTML5 yang dirilis tahun 2014",
      "🏷️ HTML menggunakan TAG seperti <h1>, <p>, <a> untuk menandai konten",
      "🚀 Setiap website di internet PASTI menggunakan HTML",
      "⚡ Browser membaca HTML dan mengubahnya jadi tampilan visual",
    ],
    whatYouLearn: [
      "Membuat judul dan paragraf dengan heading",
      "Menambahkan tombol yang bisa diklik",
      "Membuat link yang mengarah ke halaman lain",
      "Menampilkan gambar di halaman web",
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
    <p>Ini adalah paragraf pertamaku.</p>
    <button>Klik Saya</button>
    <a href="#">Kunjungi Website</a>
  </body>
</html>`,
    bonusTitle: "TUGAS BEBAS HTML",
    bonusInstruction:
      "Buatlah halaman web bebas menggunakan HTML! Gunakan kombinasi tag heading, paragraf, button, link, dan gambar yang telah kamu pelajari. Tidak ada aturan — ekspresikan kreativitasmu!",
    bonusPlaceholder: `<!DOCTYPE html>
<html>
  <head>
    <title>Halaman Bebas</title>
  </head>
  <body>
    <h1>Judul Halamanku</h1>
    <p>Ini paragrafku...</p>
    <button>Tombolku</button>
  </body>
</html>`,
    bonusMinLength: 20,
  },

  css: {
    abbreviation: "Cascading Style Sheets",
    tagline: "Bahasa untuk Mendesain Tampilan Web",
    description:
      "CSS adalah bahasa yang digunakan untuk mengatur TAMPILAN dan DESAIN halaman web. Kalau HTML adalah kerangka tulang, maka CSS adalah pakaian dan riasannya. Dengan CSS, kamu bisa mengubah warna, ukuran, jenis huruf, tata letak, dan banyak lagi.",
    kepanjangan: [
      { huruf: "C", kata: "Cascading", arti: "Style diterapkan bertingkat — dari atas ke bawah" },
      { huruf: "S", kata: "Style", arti: "Mengatur tampilan visual seperti warna dan ukuran" },
      { huruf: "S", kata: "Sheets", arti: "Berupa file/lembar yang berisi aturan styling" },
    ],
    facts: [
      "🎨 Diciptakan oleh Håkon Wium Lie pada tahun 1994",
      "🔗 CSS selalu bekerja berpasangan dengan HTML",
      "📱 CSS3 memiliki fitur animasi, grid layout, dan flexbox",
      "🌈 Bisa menggunakan nama warna, kode HEX (#FF0000), atau RGB",
      "✨ Satu file CSS bisa mengontrol tampilan RIBUAN halaman sekaligus",
    ],
    whatYouLearn: [
      "Mengubah warna teks dan background",
      "Mengatur ukuran font dengan font-size",
      "Menambahkan border dan border-radius",
      "Memberi padding (jarak dalam) pada elemen",
    ],
    icon: "✦",
    color: "#4CC9F0",
    colorDark: "#0077aa",
    example: `/* Contoh CSS dasar */
color: blue;
background-color: yellow;
font-size: 24px;
border: 2px solid red;`,
    bonusTitle: "TUGAS BEBAS CSS",
    bonusInstruction:
      "Buatlah desain bebas menggunakan CSS! Coba kombinasikan berbagai property yang sudah kamu pelajari. Lihat hasilnya secara langsung di preview.",
    bonusPlaceholder: `/* Desain bebas di sini! */
color: white;
background-color: navy;
font-size: 20px;
border: 3px solid gold;
padding: 20px;
border-radius: 8px;`,
    bonusMinLength: 10,
  },

  javascript: {
    abbreviation: "JavaScript",
    tagline: "Bahasa Pemrograman Web yang Membuat Website Hidup",
    description:
      "JavaScript adalah bahasa PEMROGRAMAN yang membuat halaman web menjadi interaktif dan dinamis. Berbeda dengan HTML dan CSS, JavaScript bisa membuat website BERPIKIR dan BEREAKSI terhadap aksi pengguna. Dari animasi, game, hingga aplikasi web modern — semuanya menggunakan JavaScript.",
    kepanjangan: [
      { huruf: "J", kata: "Java", arti: "Nama terinspirasi dari minuman kopi (bukan bahasa Java!)" },
      { huruf: "S", kata: "Script", arti: "Bahasa scripting yang berjalan di browser" },
    ],
    catatan: "⚠️ JavaScript BUKAN Java! Keduanya adalah bahasa yang BERBEDA sama sekali.",
    facts: [
      "⚡ Diciptakan oleh Brendan Eich pada tahun 1995 — hanya dalam 10 hari!",
      "🌍 Bahasa pemrograman paling populer di dunia selama 10+ tahun berturut-turut",
      "🖥️ Berjalan langsung di browser — tidak perlu instalasi apapun",
      "📦 Bisa digunakan untuk membuat website, aplikasi mobile, dan server",
      "🤖 Digunakan oleh perusahaan besar: Google, Facebook, Netflix, Twitter",
    ],
    whatYouLearn: [
      "Menampilkan pesan dengan console.log()",
      "Membuat popup dengan alert()",
      "Menyimpan data dalam variable (let, const)",
      "Melakukan operasi matematika",
      "Membuat kondisi dengan if statement",
      "Membuat fungsi yang bisa dipanggil ulang",
    ],
    icon: "{}",
    color: "#FFD166",
    colorDark: "#aa7700",
    example: `// Variable
let nama = "RPL";
let tahun = 2024;

// Kondisi
if (tahun > 2020) {
  console.log("Era Digital!");
}`,
    bonusTitle: "TUGAS BEBAS JAVASCRIPT",
    bonusInstruction:
      "Buatlah program JavaScript bebas! Gunakan kombinasi variable, kondisi if, dan function yang sudah kamu pelajari. Tidak ada jawaban yang salah — berkreasi sesuka hati!",
    bonusPlaceholder: `// Programku bebas di sini!
let nama = "Namaku";
let umur = 17;

if (umur >= 17) {
  console.log("Sudah remaja!");
}

function sapa() {
  console.log("Halo, " + nama);
}

sapa();`,
    bonusMinLength: 20,
  },
};
