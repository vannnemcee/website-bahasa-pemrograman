/**
 * introData.js — Data panduan awal untuk setiap kategori bahasa pemrograman
 */

export const categoryIntro = {
  html: {
    abbreviation: "HyperText Markup Language",
    tagline: "Bahasa Penanda Struktur Halaman Web",
    fileName: "index.html",
    typeLabel: "Markup Language (Struktur)",
    ecosystemLabel: "Standar Web W3C & WHATWG",
    description:
      "HTML adalah bahasa standar untuk menyusun struktur halaman web. Setiap dokumen web menggunakan tag HTML untuk menandai judul, paragraf, gambar, tautan, maupun formulir agar browser dapat menampilkannya dengan tepat.",
    kepanjangan: [
      { huruf: "H", kata: "Hyper", arti: "Teks yang dapat saling terhubung melalui tautan (hyperlink)" },
      { huruf: "T", kata: "Text", arti: "Berbasis teks biasa yang ringan dan mudah dibaca" },
      { huruf: "M", kata: "Markup", arti: "Menggunakan tag <...> untuk menandai struktur elemen" },
      { huruf: "L", kata: "Language", arti: "Bahasa standar universal yang dipahami semua browser" },
    ],
    facts: [
      "Diciptakan oleh Tim Berners-Lee pada tahun 1991 di CERN.",
      "Versi HTML5 mendukung elemen semantik, audio, video, dan kanvas secara native.",
      "Setiap website di internet menggunakan HTML sebagai fondasi struktur dokumennya.",
      "Browser memparsing kode HTML menjadi pohon DOM sebelum merender tampilan visual.",
    ],
    whatYouLearn: [
      "Membuat judul dan sub-judul (h1 - h6)",
      "Menulis paragraf teks terstruktur",
      "Menambahkan tombol interaktif",
      "Membuat hyperlink navigasi halaman",
      "Menampilkan gambar dengan atribut src & alt",
      "Membuat kolom input teks dengan placeholder",
      "Menyusun daftar poin dengan ul dan li",
      "Mengelompokkan tata letak dengan div",
      "Menyusun formulir dengan elemen form",
    ],
    color: "#E11D48",
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
    bonusTitle: "Tugas Bebas HTML",
    bonusInstruction:
      "Buatlah halaman web bebas menggunakan HTML! Gabungkan tag heading, paragraf, tombol, link, daftar, atau gambar yang telah kamu pelajari.",
    bonusPlaceholder: `<h1>Profil Saya</h1>
<p>Saya sedang belajar membuat struktur web dengan HTML.</p>
<ul>
  <li>HTML Dasar</li>
  <li>CSS Layout</li>
</ul>
<button>Hubungi Saya</button>`,
  },

  css: {
    abbreviation: "Cascading Style Sheets",
    tagline: "Bahasa Desain dan Tata Letak Halaman Web",
    fileName: "style.css",
    typeLabel: "Style Sheet Language (Visual)",
    ecosystemLabel: "Standar Web W3C",
    description:
      "CSS digunakan untuk mengatur tampilan visual halaman HTML: warna, tipografi, jarak antar-elemen, bayangan, serta tata letak responsif di layar desktop maupun ponsel.",
    kepanjangan: [
      { huruf: "C", kata: "Cascading", arti: "Aturan gaya mengalir berurutan sesuai prioritas spesifisitas" },
      { huruf: "S", kata: "Style", arti: "Mengatur warna, ukuran huruf, border, dan tata letak" },
      { huruf: "S", kata: "Sheets", arti: "Lembar gaya yang terpisah rapi dari struktur dokumen" },
    ],
    facts: [
      "Diusulkan oleh Hakon Wium Lie pada tahun 1994.",
      "Mendukung lebih dari 16 juta warna melalui format Hex, RGB, dan HSL.",
      "Flexbox dan CSS Grid memungkinkan penyusunan layout kompleks tanpa tabel.",
      "Transisi dan animasi halus dapat dibuat langsung di CSS tanpa JavaScript.",
    ],
    whatYouLearn: [
      "Mengubah warna teks (color) & latar (background-color)",
      "Mengatur ukuran huruf (font-size)",
      "Membuat garis tepi (border) & sudut melengkung (border-radius)",
      "Mengatur jarak dalam (padding) & jarak luar (margin)",
      "Meratakan posisi teks (text-align)",
      "Menambahkan bayangan kotak (box-shadow)",
      "Mengaktifkan tata letak fleksibel (display: flex)",
    ],
    color: "#0284C7",
    example: `.kartu {
  background-color: #0f172a;
  color: #38bdf8;
  font-size: 16px;
  border: 2px solid #38bdf8;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}`,
    bonusTitle: "Tugas Bebas CSS",
    bonusInstruction:
      "Rancang kotak pratinjau dengan berbagai properti CSS! Eksperimenlah dengan warna, border, padding, border-radius, dan box-shadow.",
    bonusPlaceholder: `color: #f8fafc;
background-color: #0284c7;
font-size: 20px;
border: 2px solid #0369a1;
border-radius: 10px;
padding: 24px;
text-align: center;`,
  },

  javascript: {
    abbreviation: "JavaScript (ECMAScript)",
    tagline: "Bahasa Pemrograman Web untuk Logika & Interaktivitas",
    fileName: "script.js",
    typeLabel: "Dynamic Scripting Language",
    ecosystemLabel: "ECMA-262 // Browser & Node.js",
    description:
      "JavaScript membuat halaman web menjadi hidup dan interaktif. Bahasa ini berjalan langsung di browser untuk merespons aksi pengguna, mengelola data, melakukan perhitungan, dan membangun aplikasi web modern.",
    kepanjangan: [
      { huruf: "J", kata: "Java", arti: "Penamaan era 1995 yang terinspirasi tren saat itu (berbeda dari bahasa Java)" },
      { huruf: "S", kata: "Script", arti: "Bahasa skrip ringan yang langsung dieksekusi oleh mesin browser" },
    ],
    catatan: "JavaScript berbeda sama sekali dengan bahasa Java meskipun namanya mirip.",
    facts: [
      "Dirancang oleh Brendan Eich pada tahun 1995 dalam waktu 10 hari.",
      "Menjadi bahasa pemrograman paling banyak digunakan di dunia untuk pengembangan web.",
      "Dapat berjalan di browser maupun di server menggunakan runtime seperti Node.js.",
      "Digunakan oleh aplikasi web besar seperti Google Maps, Figma, dan YouTube.",
    ],
    whatYouLearn: [
      "Menampilkan output ke konsol (console.log)",
      "Membuat dialog pesan (alert)",
      "Menyimpan data pada variabel (let, const)",
      "Melakukan operasi matematika",
      "Logika kondisi dengan if statement",
      "Membuat fungsi standar & arrow function",
      "Menyimpan daftar data dalam array []",
      "Menggabungkan teks dengan template literals",
      "Mengulang instruksi dengan for loop",
    ],
    color: "#D97706",
    example: `const nama = "Programmer";
const level = 1;

console.log("Selamat datang, " + nama);

if (level > 0) {
  console.log("Siap memulai latihan!");
}`,
    bonusTitle: "Tugas Bebas JavaScript",
    bonusInstruction:
      "Tulis program JavaScript bebas menggunakan variabel, kondisi if, perulangan for, array, atau fungsi.",
    bonusPlaceholder: `const nama = "Budi";
let skor = 100;

console.log("Halo, " + nama);
if (skor >= 80) {
  console.log("Nilai sangat baik!");
}`,
  },

  typescript: {
    abbreviation: "Typed JavaScript at Any Scale",
    tagline: "JavaScript Modern dengan Sistem Tipe Data Statis",
    fileName: "main.ts",
    typeLabel: "Statically Typed Superset of JS",
    ecosystemLabel: "Dikembangkan oleh Microsoft",
    description:
      "TypeScript menambahkan sistem tipe statis di atas JavaScript. Kesalahan tipe data seperti salah memasukkan angka ke variabel teks dapat terdeteksi lebih awal sebelum kode dijalankan.",
    kepanjangan: [
      { huruf: "T", kata: "Type", arti: "Menyediakan pemeriksaan tipe data statis saat kompilasi" },
      { huruf: "S", kata: "Script", arti: "Superset dari JavaScript yang dikompilasi menjadi JS standar" },
    ],
    facts: [
      "Dikembangkan oleh Microsoft dan dirilis pertama kali pada tahun 2012.",
      "Semua kode JavaScript yang valid juga merupakan kode TypeScript yang valid.",
      "Menjadi standar utama pada framework modern seperti React, Next.js, dan Angular.",
      "Membantu editor kode memberikan autocomplete dan dokumentasi yang sangat akurat.",
    ],
    whatYouLearn: [
      "Anotasi tipe primitif: string, number, boolean",
      "Array bertipe dengan sintaks Type[]",
      "Tipe parameter dan return value pada fungsi",
      "Mendefinisikan bentuk objek dengan interface",
      "Union types dan type alias",
      "Properti opsional menggunakan tanda tanya (?)",
      "Fungsi fleksibel dengan Generics (<T>)",
      "Mengelompokkan konstanta menggunakan enum",
    ],
    color: "#2563EB",
    example: `interface Siswa {
  nama: string;
  nilai: number;
}

const murid: Siswa = {
  nama: "Budi",
  nilai: 95,
};

console.log(murid.nama + " meraih nilai " + murid.nilai);`,
    bonusTitle: "Tugas Bebas TypeScript",
    bonusInstruction:
      "Buat program TypeScript bebas dengan anotasi tipe variabel, interface objek, atau fungsi bertipe.",
    bonusPlaceholder: `interface Player {
  username: string;
  score: number;
}

const player: Player = {
  username: "Nadia",
  score: 120,
};

console.log("Player:", player.username, player.score);`,
  },

  python: {
    abbreviation: "Python Programming Language",
    tagline: "Bahasa Pemrograman yang Bersih, Ringkas & Serbaguna",
    fileName: "main.py",
    typeLabel: "High-Level General Purpose",
    ecosystemLabel: "Python Software Foundation",
    description:
      "Python dirancang agar mudah dibaca seperti bahasa manusia. Bahasa ini menjadi pilihan utama untuk pemula, otomasi tugas, analisis data, pengembangan backend, hingga kecerdasan buatan (AI).",
    kepanjangan: [
      { huruf: "P", kata: "Readable", arti: "Sintaks bersih dengan indentasi rapi tanpa kurung kurawal" },
      { huruf: "Y", kata: "Versatile", arti: "Dipakai dari web, skrip otomasi, hingga AI & data science" },
    ],
    catatan: "Python menggunakan indentasi (spasi) untuk menandai blok kode, bukan tanda { }.",
    facts: [
      "Diciptakan oleh Guido van Rossum dan dirilis pertama kali pada tahun 1991.",
      "Bahasa paling populer di bidang Machine Learning, AI, dan Data Science.",
      "Digunakan secara luas oleh NASA, Google, Spotify, dan Instagram.",
      "Namanya terinspirasi dari grup komedi Inggris Monty Python, bukan ular piton.",
    ],
    whatYouLearn: [
      "Mencetak teks dan angka dengan print()",
      "Membuat variabel dinamis tanpa kata kunci deklarasi",
      "Melakukan operasi matematika dasar",
      "Logika kondisi menggunakan if / else",
      "Menyimpan daftar data dengan list []",
      "Perulangan for dengan range()",
      "Membuat fungsi dengan kata kunci def",
      "Format teks modern menggunakan f-string",
    ],
    color: "#059669",
    example: `nama = "Programmer Muda"
tahun = 2026

print(f"Halo, {nama}!")
print("Tahun belajar:", tahun)

if tahun >= 2026:
    print("Siap berlatih logika Python!")`,
    bonusTitle: "Tugas Bebas Python",
    bonusInstruction:
      "Tulis program Python bebas menggunakan variabel, perulangan for, fungsi def, kondisi if, dan print().",
    bonusPlaceholder: `nama = "Budi"
nilai = [80, 90, 85]

for n in nilai:
    print(f"{nama} mendapat nilai {n}")`,
  },

  php: {
    abbreviation: "PHP: Hypertext Preprocessor",
    tagline: "Bahasa Server-Side Andalan untuk Pengembangan Web",
    fileName: "index.php",
    typeLabel: "Server-Side Scripting Language",
    ecosystemLabel: "The PHP Group // Web Backend",
    description:
      "PHP adalah bahasa pemrograman sisi server yang dirancang khusus untuk web. Skrip PHP berjalan di server untuk memproses formulir, berinteraksi dengan database, dan menghasilkan halaman HTML dinamis.",
    kepanjangan: [
      { huruf: "P", kata: "PHP", arti: "Singkatan rekursif dari PHP: Hypertext Preprocessor" },
      { huruf: "H", kata: "Hypertext", arti: "Menghasilkan dokumen HTML dinamis untuk browser" },
      { huruf: "P", kata: "Preprocessor", arti: "Diproses di server sebelum hasilnya dikirim ke pengguna" },
    ],
    facts: [
      "Diciptakan oleh Rasmus Lerdorf pada tahun 1994.",
      "Menggerakkan lebih dari 75% situs web yang menggunakan bahasa server-side, termasuk WordPress dan Wikipedia.",
      "Versi PHP 8 modern menawarkan peningkatan performa signifikan dengan compiler JIT.",
      "Setiap nama variabel di PHP wajib diawali simbol dollar ($).",
    ],
    whatYouLearn: [
      "Menampilkan output dengan echo dan print",
      "Membuka skrip dengan tag <?php ... ?>",
      "Mendeklarasikan variabel dengan awalan $",
      "Operasi aritmatika dasar",
      "Menggabungkan teks dengan operator titik (.)",
      "Percabangan logika dengan if",
      "Menyimpan data dalam array []",
      "Membaca isi array dengan foreach",
      "Membuat fungsi dengan kata kunci function",
    ],
    color: "#4F46E5",
    example: `<?php
$nama = "Programmer Web";
$tahun = 2026;

echo "Halo, " . $nama . "!\n";
echo "Selamat belajar PHP di tahun " . $tahun;
?>`,
    bonusTitle: "Tugas Bebas PHP",
    bonusInstruction:
      "Tulis skrip PHP bebas dengan variabel $, echo, kondisi if, array, atau perulangan foreach.",
    bonusPlaceholder: `<?php
$nama = "Siti";
$skor = 92;

echo "Nama: " . $nama . "\n";
if ($skor >= 75) {
    echo "Status: Lulus!";
}
?>`,
  },

  java: {
    abbreviation: "Java Programming Language",
    tagline: "Bahasa Berorientasi Objek untuk Aplikasi Skala Besar",
    fileName: "Main.java",
    typeLabel: "Object-Oriented & Strongly Typed",
    ecosystemLabel: "JVM (Java Virtual Machine)",
    description:
      "Java adalah bahasa pemrograman berorientasi objek yang terkenal dengan prinsip 'Write Once, Run Anywhere'. Kode Java berjalan di atas Java Virtual Machine (JVM) dan banyak dipakai untuk backend enterprise, perbankan, serta pengembangan Android.",
    kepanjangan: [
      { huruf: "J", kata: "JVM", arti: "Kode berjalan konsisten di berbagai sistem operasi melalui mesin virtual" },
      { huruf: "O", kata: "OOP", arti: "Berbasis class dan object yang terstruktur rapi" },
    ],
    facts: [
      "Dikembangkan oleh James Gosling di Sun Microsystems dan dirilis pada tahun 1995.",
      "Menjadi fondasi ekosistem Android serta sistem backend berskala besar di perbankan dan e-commerce.",
      "Memiliki sistem tipe statis yang ketat sehingga bug mudah dideteksi sejak awal.",
      "Setiap pernyataan di Java harus diakhiri tanda titik koma (;).",
    ],
    whatYouLearn: [
      "Mencetak output dengan System.out.println()",
      "Mendeklarasikan variabel int, String, dan boolean",
      "Melakukan operasi aritmatika dasar",
      "Percabangan logika dengan if",
      "Menyimpan data terurut dengan array bertipe",
      "Perulangan terstruktur dengan for loop",
      "Membuat method static",
      "Memahami struktur dasar class",
    ],
    color: "#EA580C",
    example: `public class Main {
  public static void main(String[] args) {
    String nama = "Budi";
    int nilai = 90;
    System.out.println("Halo " + nama);
    if (nilai >= 75) {
      System.out.println("Status: Lulus");
    }
  }
}`,
    bonusTitle: "Tugas Bebas Java",
    bonusInstruction:
      "Buat program Java bebas menggunakan System.out.println(), variabel int/String, percabangan if, atau perulangan for.",
    bonusPlaceholder: `String siswa = "Andi";
int[] nilai = {80, 90, 95};

for (int i = 0; i < nilai.length; i++) {
  System.out.println(siswa + " #" + (i + 1) + ": " + nilai[i]);
}`,
  },

  cpp: {
    abbreviation: "C++ Programming Language",
    tagline: "Bahasa Performa Tinggi untuk Sistem, Game, dan Algoritma",
    fileName: "main.cpp",
    typeLabel: "Compiled Systems Language",
    ecosystemLabel: "ISO C++ Standard",
    description:
      "C++ adalah bahasa pemrograman kompilasi yang memberi kendali penuh atas memori dan performa eksekusi. C++ banyak dipakai untuk membangun sistem operasi, game engine, perangkat tertanam, serta pemrograman kompetitif.",
    kepanjangan: [
      { huruf: "C", kata: "C Language", arti: "Dibangun di atas efisiensi bahasa C klasik" },
      { huruf: "++", kata: "Increment", arti: "Menambahkan fitur modern seperti class, struct, dan STL" },
    ],
    facts: [
      "Diciptakan oleh Bjarne Stroustrup pada tahun 1979 sebagai pengembangan dari bahasa C.",
      "Digunakan untuk membangun Unreal Engine, browser Chromium, dan komponen inti sistem operasi.",
      "Menjadi salah satu bahasa paling populer di olimpiade sains komputer dan competitive programming.",
      "Standar input/output konsol menggunakan stream cin dan cout dari pustaka <iostream>.",
    ],
    whatYouLearn: [
      "Menampilkan output dengan cout dan endl",
      "Mendeklarasikan tipe int dan string",
      "Melakukan operasi matematika dasar",
      "Membuat kondisi percabangan if",
      "Menyusun array berukuran tetap",
      "Menjalankan perulangan for loop",
      "Membuat fungsi dengan tipe kembalian",
      "Mengelompokkan data dengan struct",
    ],
    color: "#0369A1",
    example: `#include <iostream>
using namespace std;

int main() {
  string nama = "Budi";
  int skor = 95;
  cout << "Halo " << nama << endl;
  cout << "Skor: " << skor << endl;
  return 0;
}`,
    bonusTitle: "Tugas Bebas C++",
    bonusInstruction:
      "Tulis program C++ bebas dengan cout, variabel, perulangan for, fungsi, atau struct.",
    bonusPlaceholder: `int total = 0;
for (int i = 1; i <= 5; i++) {
  total = total + i;
  cout << "Langkah " << i << ": " << total << endl;
}`,
  },

  go: {
    abbreviation: "Go (Golang)",
    tagline: "Bahasa Modern yang Ringkas, Cepat, dan Andal untuk Cloud",
    fileName: "main.go",
    typeLabel: "Compiled Concurrent Language",
    ecosystemLabel: "Dikembangkan oleh Google",
    description:
      "Go (sering disebut Golang) dirancang oleh Google untuk memadukan kecepatan bahasa kompilasi seperti C dengan kemudahan membaca seperti Python. Go sangat populer untuk membangun API backend, microservices, dan infrastruktur cloud.",
    kepanjangan: [
      { huruf: "G", kata: "Google", arti: "Diciptakan oleh Robert Griesemer, Rob Pike, dan Ken Thompson di Google" },
      { huruf: "O", kata: "Open Source", arti: "Gratis, memiliki tooling lengkap, dan kompilasi sangat cepat" },
    ],
    facts: [
      "Dirilis secara publik oleh Google pada tahun 2009.",
      "Teknologi infrastruktur cloud besar seperti Docker dan Kubernetes ditulis menggunakan Go.",
      "Memiliki gaya penulisan seragam tanpa tanda titik koma (;) dan kondisi if tanpa tanda kurung ().",
      "Operator := mempermudah deklarasi variabel secara singkat dan tetap type-safe.",
    ],
    whatYouLearn: [
      "Mencetak output dengan fmt.Println()",
      "Deklarasi singkat variabel menggunakan :=",
      "Deklarasi eksplisit menggunakan var",
      "Operasi aritmatika dan kondisi if",
      "Menggunakan slice dinamis []string",
      "Perulangan for klasik dan range",
      "Membuat fungsi dengan parameter bertipe",
      "Memodelkan data dengan struct",
    ],
    color: "#0891B2",
    example: `package main
import "fmt"

func main() {
  nama := "Budi"
  nilai := 90
  fmt.Println("Halo,", nama)
  if nilai >= 80 {
    fmt.Println("Hasil: Lulus")
  }
}`,
    bonusTitle: "Tugas Bebas Go",
    bonusInstruction:
      "Tulis kode Go bebas menggunakan :=, fmt.Println(), slice, perulangan for/range, atau fungsi.",
    bonusPlaceholder: `buah := []string{"Apel", "Mangga", "Jeruk"}
for _, item := range buah {
  fmt.Println("Buah:", item)
}`,
  },

  sql: {
    abbreviation: "Structured Query Language",
    tagline: "Bahasa Standar untuk Mengelola dan Menganalisis Basis Data",
    fileName: "query.sql",
    typeLabel: "Declarative Query Language",
    ecosystemLabel: "RDBMS (PostgreSQL, MySQL, SQLite)",
    description:
      "SQL adalah bahasa standar untuk berbicara dengan basis data relasional. Dengan SQL, kamu dapat mengambil data spesifik, menyaring baris, mengurutkan laporan, menghitung statistik agregat, serta memperbarui rekaman tabel.",
    kepanjangan: [
      { huruf: "S", kata: "Structured", arti: "Mengelola data yang tersusun rapi dalam baris dan kolom tabel" },
      { huruf: "Q", kata: "Query", arti: "Mengajukan permintaan data secara deklaratif (apa yang dicari)" },
      { huruf: "L", kata: "Language", arti: "Bahasa standar di hampir semua sistem database modern" },
    ],
    facts: [
      "Dikembangkan pertama kali di IBM pada awal tahun 1970-an berdasarkan model relasional Edgar F. Codd.",
      "Digunakan di balik layar hampir semua aplikasi mobile, web e-commerce, perbankan, dan analitik bisnis.",
      "Kamu cukup menyatakan data apa yang diinginkan, dan mesin database yang menentukan cara tercepat mengambilnya.",
      "Dalam sandbox ini sudah tersedia tabel 'siswa' dan 'produk' yang siap langsung di-query.",
    ],
    whatYouLearn: [
      "Membaca semua data dengan SELECT *",
      "Memilih kolom spesifik dari tabel",
      "Menyaring data numerik dan teks dengan WHERE",
      "Mengurutkan hasil dengan ORDER BY ASC/DESC",
      "Membatasi jumlah baris dengan LIMIT",
      "Menghitung jumlah data dengan COUNT(*)",
      "Mengelompokkan dan merata-rata dengan GROUP BY",
      "Menambah dan memperbarui baris dengan INSERT & UPDATE",
    ],
    color: "#7C3AED",
    example: `SELECT nama, kelas, nilai
FROM siswa
WHERE nilai >= 80
ORDER BY nilai DESC;`,
    bonusTitle: "Tugas Bebas SQL",
    bonusInstruction:
      "Eksplorasi tabel 'siswa' dan 'produk' yang sudah tersedia! Coba kombinasikan SELECT, WHERE, ORDER BY, LIMIT, AVG/COUNT, atau UPDATE.",
    bonusPlaceholder: `SELECT nama, harga, stok
FROM produk
WHERE harga >= 150000
ORDER BY harga DESC;`,
  },
};
