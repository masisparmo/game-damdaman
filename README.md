# Maen Dam-Daman - Traditional Indonesian Strategy Board Game

> Authentic Indonesian Traditional Board Game featuring Graph Ethnomathematics, Intelligent AI, and Portrait-first Responsive Modern UI.  
> **Live Web Application:** [https://damdaman.isparmo.com](https://damdaman.isparmo.com)

---

## Table of Contents / Daftar Isi
- [English Version](#-english-version)
  - [1. Overview & Live Demo](#1-overview--live-demo)
  - [2. Cultural & Historical Heritage](#2-cultural--historical-heritage)
  - [3. Ethnomathematics & Graph Theory Framework](#3-ethnomathematics--graph-theory-framework)
  - [4. Complete Rules of the Game](#4-complete-rules-of-the-game)
  - [5. AI Engine & Difficulty Levels](#5-ai-engine--difficulty-levels)
  - [6. Key Features & Dual Language Support](#6-key-features--dual-language-support)
  - [7. Technology Stack](#7-technology-stack)
  - [8. Installation & Local Development](#8-installation--local-development)
  - [9. Automated QA Testing Suite](#9-automated-qa-testing-suite)
  - [10. Deployment & Custom Domain](#10-deployment--custom-domain)
  - [11. License & Academic References](#11-license--academic-references)
- [Versi Bahasa Indonesia](#-versi-bahasa-indonesia)
  - [1. Gambaran Umum & Demo Langsung](#1-gambaran-umum--demo-langsung)
  - [2. Latar Belakang Budaya & Sejarah](#2-latar-belakang-budaya--sejarah)
  - [3. Landasan Ilmiah Etnomatematika & Teori Graf](#3-landasan-ilmiah-etnomatematika--teori-graf)
  - [4. Aturan Lengkap Permainan](#4-aturan-lengkap-permainan)
  - [5. Mesin Kecerdasan Buatan (AI Engine)](#5-mesin-kecerdasan-buatan-ai-engine)
  - [6. Fitur Unggulan & Dukungan Dual Bahasa](#6-fitur-unggulan--dukungan-dual-bahasa)
  - [7. Teknologi yang Digunakan](#7-teknologi-yang-digunakan)
  - [8. Panduan Instalasi & Pengembangan Lokal](#8-panduan-instalasi--pengembangan-lokal)
  - [9. Pengujian Kualitas Otomatis (QA Testing)](#9-pengujian-kualitas-otomatis-qa-testing)
  - [10. Deployment & Custom Domain](#10-deployment--custom-domain)
  - [11. Lisensi & Rujukan Akademik](#11-lisensi--rujukan-akademik)

---

# 🇬🇧 English Version

## 1. Overview & Live Demo
**Maen Dam-Daman** (also known in various regions of Indonesia as *Damdas*, *Bas-Basan*, or *Catur Jawa*) is a digital recreation of the beloved traditional Indonesian board game. This modern web implementation bridges timeless folk wisdom with modern software engineering:
- **Live URL:** [https://damdaman.isparmo.com](https://damdaman.isparmo.com)
- **Repository:** [masisparmo/game-damdaman](https://github.com/masisparmo/game-damdaman)
- **Default Language:** Bahasa Indonesia (with instantaneous toggle to English)
- **Target Devices:** Smartphones, tablets, laptops, and ultra-wide desktop monitors

---

## 2. Cultural & Historical Heritage
Dam-Daman has been played across the Indonesian archipelago (especially Java, Sunda, and Madura) since the early 20th century. Traditionally drawn with chalk on stone tiles, wooden porches, or carved directly into dirt grounds with small pebbles and bottle caps serving as counters, the game was a fixture of village social life.

Beyond casual entertainment, Dam-Daman embodies deep folk values:
- **"Eling lan Waspada" (Mindfulness & Alertness):** Players must remain constantly vigilant of open diagonals and overlooked jumps to avoid the dreaded *DAM penalty*.
- **Patience & Restraint:** Rushing attacks frequently leaves defensive structures compromised.
- **Egalitarian Strategy:** All pieces begin with identical capabilities, placing victory purely on tactical acumen.

---

## 3. Ethnomathematics & Graph Theory Framework
This implementation is strictly grounded in the peer-reviewed ethnomathematics study:
> **"Studi Etnomatematika: Konsep Graf pada Permainan Dam-daman Kabupaten Pasuruan"**  
> *Salsabila & Marhayati (2024)*, Math Didactic: Jurnal Pendidikan Matematika.

In discrete mathematics and graph theory, the Dam-Daman board represents an undirected, connected simple graph $G = (V, E)$:
- **Graph Order (Vertices $|V|$):** Exactly **37 nodes** (intersection points).
- **Graph Size (Edges $|E|$):** Exactly **76 edges** (connecting straight lines).
- **Vertex Degrees ($d(v)$):**
  - **Degree 2 & 3:** Apex nodes and outer perimeter boundary corners.
  - **Degree 4 & 5:** Grid intersections in central squares and inner wings.
  - **Degree 8 (Maximum Strategic Hubs):** Nodes `C`, `Q`, `S`, `A1`, `W`, `U`, and `K`. These 7 central junctions form the critical battlegrounds for board control.
- **Semi-Hamiltonian Property:** Contains an open path that visits all 37 vertices exactly once without repeating vertices.
- **3-Chromatic Coloring:** The entire 37-node graph has a chromatic number $\chi(G) = 3$, meaning all adjacent nodes can be colored using only three distinct colors without collision.

---

## 4. Complete Rules of the Game

### 4.1. Board Setup
- Two players: **Player 1 (Orange / Solar Motif)** and **Player 2 / AI (Blue / Diamond Motif)**.
- Each player commands **16 pieces** arranged in their home quadrant and rear triangular wing (*Gunungan* / *Dapur*).
- The central column (5 points) remains vacant at the start of the match.

### 4.2. Movement
- Players alternate moving one piece per turn to an immediately adjacent, empty node along a connecting line (orthogonal or diagonal).
- Moving into an occupied spot without jumping is prohibited.

### 4.3. Jump Captures & Multi-Jump Chains
- **Single Jump:** If an opponent's piece is on an adjacent node, and the node directly beyond it in the same straight line is empty, the player can leap over the opponent's piece, landing on the vacant node and removing the captured piece.
- **Multi-Jump:** If, upon landing, another legal capture opportunity is immediately available from that new node with the same piece, the player may chain additional jump captures within the same turn.

### 4.4. The Authentic "DAM" Penalty (*Dam Ora Mangan*)
- If a player has a valid, legal capture opportunity but chooses a regular non-capture move or overlooks the jump, the opponent can declare **"DAM!"**.
- Upon claiming the penalty, the opponent immediately captures **3 of the offender's pieces** free of charge as a penalty!

### 4.5. King Piece Variation (Optional Setting)
- When enabled in the Settings menu, any standard piece that penetrates all the way to the apex of the opponent's rear triangle (*Puncak Gunungan*) is promoted to a **King (Raja)** with a golden crown, gaining enhanced mobility.

### 4.6. Victory & Draw Conditions
- **Decisive Victory:** A player captures all 16 opposing pieces.
- **Stalemate Victory:** The opponent is completely immobilized with zero legal moves on their turn.
- **Draw (Remis):**
  - 40 half-moves (20 full rounds) elapse without any piece capture.
  - Threefold repetition of the identical board position.

---

## 5. AI Engine & Difficulty Levels
The game features a built-in AI opponent powered by heuristic search algorithms and a hybrid continuous learning architecture:
- **Easy:** Fast heuristic-weighted greedy evaluation with slight exploratory randomization. Perfect for beginners and casual players.
- **Medium:** Depth-limited Minimax search with Alpha-Beta pruning, balancing positional safety, piece protection, and capture opportunities.
- **Hard:** Deeper search evaluating piece mobility, control of degree-8 hub junctions, king advancement, and defensive clustering.
- **Master 👑 (Level Dewa):** Hybrid Grandmaster Engine featuring:
  - **Collective Master Brain (`master_brain.json`):** Preloaded grandmaster opening repertoire and strategic hub priorities stored directly in the repository.
  - **Quiescence Search:** Eliminates the *Horizon Effect* by evaluating complete capture chains until positions are tactically quiet.
  - **Continuous Learning & Blunder Memory:** Automatically learns from completed matches, memorizes opponent tactics, and applies penalties to prevent repeating past blunders.
  - **Graph Ethnomathematics Valuation:** Dominates the 7 critical degree-8 junction hubs (`A1`, `Q`, `S`, `W`, `U`, `C`, `K`).
  - **Transposition Table:** Lightning-fast state caching for sub-second calculation without hallucinations or external API keys.
  - **Collective Brain Export:** Allows players to export their local learned tactical patterns as JSON to contribute back to the repository.

---

## 6. Key Features & Dual Language Support
- **Player Name Personalization:** Prompts players to enter their name upon completing the rules guide, with custom avatar badges and quick name editing anytime.
- **IndexedDB Match History:** Automatically persists complete offline match records locally in IndexedDB:
  - **Player Name & Opponent** (AI or Player 2)
  - **Match Time** (`HH:mm:ss`)
  - **Match Date in DDMMYYYY format** (e.g. `26102026`) and readable display date
  - **Match Duration in minutes** (calculated to one decimal place, e.g. `2.4 min`)
  - **Match Outcome** (Won / Menang, Lost / Kalah, Draw / Seri)
  - Remaining pieces and total move counts
- **Dedicated History Modal:** Top-bar accessible match archive with filter tabs (All, Won, Lost, Draw), win-rate statistics, and single or bulk record management.
- **Dual Language (ENG & IND):** Complete bilingual support across all headers, cards, dialogs, historical guides, settings, player name prompt, match history, and logs. Default language is Bahasa Indonesia.
- **Auto-Opening Guide on First Load:** Welcomes players with an interactive 5-slide visual tutorial equipped with immediate **OK** and **Close (Tutup)** buttons.
- **Portrait-First Mobile Layout:** Specifically optimized for vertical smartphone use, with instant toggle to traditional Landscape mode.
- **Dynamic Board Scaling & Zoom:** Interactive slider and preset buttons (65% to 135%) to accommodate all screen dimensions.
- **Board Flip 180°:** Supports face-to-face play on a shared physical tablet or phone.
- **Three Visual Themes:**
  - *Emerald Velvet & Gold:* High-finish modern classic look.
  - *Traditional Teak Wood:* Authentic Javanese rustic aesthetic.
  - *Obsidian Slate:* High-contrast dark mode.
- **Procedural Web Audio API:** Authentic synthetic acoustic wood taps, jump thuds, and victory fanfares without external audio files.

---

## 7. Technology Stack
- **Framework:** React 19 + TypeScript
- **Styling:** Vanilla CSS & Tailwind CSS v4
- **Database / Local Storage:** IndexedDB (`idb` lightweight native store) + LocalStorage
- **Build Tool:** Vite 8
- **Icons:** Lucide React
- **Audio:** Web Audio API (Synthesized procedural audio)
- **Deployment:** GitHub Actions & GitHub Pages
- **Custom Domain:** `damdaman.isparmo.com`

---

## 8. Installation & Local Development

### Prerequisites
- Node.js (version 20+ recommended)
- npm or Bun

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/masisparmo/game-damdaman.git
   cd game-damdaman
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   # or with bun:
   bun install
   ```
3. Start the development server:
   ```bash
   npm run dev
   # Server launches at http://localhost:3000
   ```
4. Build for production:
   ```bash
   npm run build
   ```

---

## 9. Automated QA Testing Suite
The application includes an internal automated QA test runner accessible via the **Settings (Pengaturan)** menu. It executes 12 deterministic test scenarios verifying:
1. Initial 37-node graph and 16-vs-16 piece placement.
2. Orthogonal and diagonal movement legality.
3. Collinear jump capture validation.
4. Consecutive multi-jump branching.
5. "DAM" penalty detection and 3-piece forfeiture.
6. King piece promotion mechanics.
7. Stalemate (kebuntuan) detection.
8. Decisive victory and draw prevention rules.

---

## 10. Deployment & Custom Domain
The project automatically builds and deploys to GitHub Pages on every push to the `main` branch via `.github/workflows/deploy.yml`.
- A permanent [`public/CNAME`](file:///d:/Aplikasi/Game%20Dam-Daman/public/CNAME) file containing `damdaman.isparmo.com` ensures GitHub Pages retains custom DNS mappings across all deployment pipelines.

---

## 11. License & Academic References
- **License:** Apache License 2.0.
- **Academic Citation:**
  - Salsabila, A. N., & Marhayati, S. (2024). *Studi Etnomatematika: Konsep Graf pada Permainan Dam-daman Kabupaten Pasuruan*. Math Didactic: Jurnal Pendidikan Matematika, 10(1), 45-58.
  - Balai Pelestarian Nilai Budaya (BPNB) Jawa Barat: *Katalog Permainan Tradisional Nusantara*.

---
---

# 🇮🇩 Versi Bahasa Indonesia

## 1. Gambaran Umum & Demo Langsung
**Maen Dam-Daman** (di berbagai daerah juga dinamai *Damdas*, *Bas-Basan*, atau *Catur Jawa*) adalah aplikasi web modern dari permainan papan strategi tradisional asli Indonesia. Aplikasi ini memadukan kearifan budaya leluhur dengan teknologi perangkat lunak masa kini:
- **Tautan Langsung (Live URL):** [https://damdaman.isparmo.com](https://damdaman.isparmo.com)
- **Repositori:** [masisparmo/game-damdaman](https://github.com/masisparmo/game-damdaman)
- **Bahasa Utama:** Bahasa Indonesia (dengan tombol beralih cepat ke Bahasa Inggris)
- **Perangkat Sasaran:** Ponsel pintar (smartphone), tablet, laptop, hingga monitor komputer desktop

---

## 2. Latar Belakang Budaya & Sejarah
Permainan Dam-Daman telah dimainkan secara turun-temurun oleh masyarakat di berbagai pelosok nusantara (khususnya Pulau Jawa, Sunda, dan Madura) sejak awal abad ke-20. Dahulu, papan permainan digambar menggunakan kapur di atas ubin lantai teras, digores di atas batu, atau digaris langsung pada permukaan tanah dengan batu kerikil dan tutup botol sebagai bidaknya.

Lebih dari sekadar permainan mengisi waktu luang, Dam-Daman mengandung filosofi kehidupan:
- **"Eling lan Waspada" (Kesadaran & Kehati-hatian):** Pemain harus selalu cermat membaca garis langkah dan pemakanan terbuka agar tidak terkena *Pinalti DAM*.
- **Kesabaran & Pengendalian Diri:** Menyerang secara gegabah sering kali membuka celah pertahanan sendiri.
- **Prinsip Kesetaraan:** Seluruh 16 bidak memulai laga dengan kemampuan yang sama, sehingga kemenangan murni ditentukan oleh kecerdasan strategi.

---

## 3. Landasan Ilmiah Etnomatematika & Teori Graf
Aplikasi permainan ini dibangun di atas landasan kajian ilmiah etnomatematika yang telah dipublikasikan:
> **"Studi Etnomatematika: Konsep Graf pada Permainan Dam-daman Kabupaten Pasuruan"**  
> *Salsabila & Marhayati (2024)*, Math Didactic: Jurnal Pendidikan Matematika.

Dalam matematika diskret dan teori graf, papan Dam-Daman merupakan graf sederhana tak berarah dan terhubung $G = (V, E)$:
- **Orde Graf (Jumlah Simpul/Titik $|V|$):** Tepat **37 simpul**.
- **Ukuran Graf (Jumlah Sisi/Garis $|E|$):** Tepat **76 sisi penghubung**.
- **Derajat Titik ($d(v)$):**
  - **Derajat 2 & 3:** Titik sudut puncak sayap segitiga dan batas terluar papan.
  - **Derajat 4 & 5:** Titik perpotongan bujur sangkar tengah dan sayap dalam.
  - **Derajat 8 (Simpul Strategis Utama):** Simpul `C`, `Q`, `S`, `A1`, `W`, `U`, dan `K`. Ketujuh simpul persimpangan maksimal ini menjadi medan tempur paling krusial untuk menguasai papan.
- **Sifat Semi-Hamilton:** Memiliki lintasan buka yang dapat melintasi seluruh 37 simpul tepat satu kali dari ujung ke ujung tanpa pengulangan titik.
- **Kromatik-3:** Memiliki bilangan kromatik $\chi(G) = 3$, yang berarti ke-37 simpul dapat diwarnai hanya dengan tiga warna berbeda sedemikian rupa sehingga simpul bersebelahan selalu memiliki warna berbeda.

---

## 4. Aturan Lengkap Permainan

### 4.1. Susunan Awal Permainan
- Dua kubu pemain: **Pemain 1 (Oranye / Motif Surya)** dan **Pemain 2 / AI (Biru / Motif Berlian)**.
- Masing-masing pemain memegang **16 bidak** yang ditempatkan di wilayah kuadran miliknya dan segitiga ekor belakang (*Gunungan* / *Dapur*).
- Baris tengah (5 titik) dikosongkan pada awal pertandingan.

### 4.2. Pergerakan Bidak
- Pemain melangkah secara bergantian, menggeser satu bidak ke titik kosong di sebelahnya yang terhubung langsung oleh garis lurus (horizontal, vertikal, atau diagonal yang sah).
- Bidak tidak boleh dipindahkan ke titik yang telah ditempati tanpa melakukan lompatan makan.

### 4.3. Pemakanan Lompat & Kombo Beruntun (Multi-Jump)
- **Lompatan Tunggal:** Jika di titik sebelah terdapat bidak lawan dan titik tepat di belakangnya kosong sepanjang satu garis lurus, pemain dapat melompati bidak lawan tersebut dan mendarat di titik kosong. Bidak lawan yang dilompati dikeluarkan dari papan.
- **Lompatan Beruntun:** Jika setelah mendarat masih ada sasaran makan berikutnya yang terbuka dengan bidak yang sama, pemain dapat langsung melanjutkan lompatan makan berikutnya dalam giliran yang sama.

### 4.4. Aturan Pinalti Khas "DAM" (*Dam Ora Mangan*)
- Inilah aturan autentik asal-usul nama permainan: jika seorang pemain memiliki kesempatan sah untuk melompat memakan bidak lawan namun ia melalaikannya (misalnya justru melangkahkan bidak lain), lawan berhak menyerukan **"DAM!"**.
- Lawan berhak langsung mengambil **3 bidak pemain yang lalai** secara cuma-cuma sebagai penalti!

### 4.5. Variasi Bidak Raja (Pengaturan Opsional)
- Jika diaktifkan melalui menu Pengaturan, bidak biasa yang sukses menembus hingga ke simpul puncak paling belakang segitiga lawan akan dipromosikan menjadi **Bidak Raja** bermahkota emas dengan keleluasaan langkah khusus.

### 4.6. Syarat Kemenangan & Permainan Seri (Remis)
- **Menang Mutlak:** Berhasil menghabiskan seluruh 16 bidak lawan.
- **Menang Kebuntuan (Stalemate):** Lawan terkunci total dan tidak memiliki satu pun langkah legal saat gilirannya tiba.
- **Hasil Seri (Remis):**
  - Terjadi 40 langkah setengah berturut-turut tanpa ada bidak yang dimakan.
  - Pengulangan posisi papan yang persis sama sebanyak 3 kali berturut-turut (*Threefold repetition*).

---

## 5. Mesin Kecerdasan Buatan (AI Engine) & Pembelajaran Mandiri
Permainan menyediakan lawan komputer cerdas dengan 4 tingkat keahlian dan arsitektur pembelajaran adaptif:
- **Mudah (Easy):** Algoritma heuristik cepat dengan sedikit variasi acak, cocok untuk pemula yang baru mengenal aturan Dam-Daman.
- **Sedang (Medium):** Algoritma Minimax dengan pemangkasan Alpha-Beta pada kedalaman terbatas, menyeimbangkan keselamatan posisi, pengawalan bidak, dan pemanfaatan peluang makan.
- **Sulit (Hard):** Evaluasi mendalam yang memperhitungkan mobilitas bidak, penguasaan 7 simpul strategis berderajat 8, formasi klaster pertahanan, dan pencegahan pinalti DAM.
- **Dewa 👑 (Master AI):** Mesin Grandmaster Hibrida dengan Pembelajaran Berkelanjutan:
  - **Otak Induk Global (`master_brain.json`):** Membaca buku pembukaan dan taktik tingkat master yang tersimpan di repositori GitHub.
  - **Quiescence Search (Pencarian Taktis Tenang):** Menghitung seluruh rantai saling makan hingga tuntas untuk mencegah jebakan *Horizon Effect*.
  - **Memori Belajar & Anti-Blunder:** Otomatis mencatat setiap pertandingan di browser, mempelajari taktik lawan, dan menghindari kesalahan langkah yang pernah terjadi sebelumnya.
  - **Dominasi Etnomatematika Simpul Derajat-8:** Memprioritaskan penguasaan 7 simpul poros utama (`A1`, `Q`, `S`, `W`, `U`, `C`, `K`).
  - **Transposition Table:** Caching posisi cepat sub-detik tanpa perlu model LLM dan tanpa perlu API Key apa pun.
  - **Ekspor Memori Otak Kolektif:** Pemain dapat mengekspor data pembelajaran lokal ke format JSON untuk dikontribusikan kembali ke repositori.

---

## 6. Fitur Unggulan & Dukungan Dual Bahasa
- **Personalisasi Nama Pemain:** Setelah jendela panduan aturan ditutup, pemain langsung diminta memasukkan nama, dengan avatar khusus serta tombol ubah nama kapan saja.
- **Pencatatan Riwayat Pertandingan di IndexedDB:** Setiap pertandingan otomatis tersimpan rapi dan permanen di basis data lokal IndexedDB peramban:
  - **Nama Pemain & Lawan** (AI atau Pemain 2)
  - **Jam Pertandingan** (`HH:mm:ss`)
  - **Tanggal dalam format DDMMYYYY** (contoh: `26102026`) serta tanggal berformat ramah baca
  - **Lamanya Bermain dalam Menit** (dihitung presisi 1 desimal, misal: `2.4 menit`)
  - **Hasil Pertandingan:** Menang, Kalah, atau Seri / Draw
  - Sisa bidak masing-masing dan total langkah yang dieksekusi
- **Jendela / Menu Riwayat (History):** Menu khusus di bilah atas untuk melihat daftar laga, filter cepat (Semua, Menang, Kalah, Seri), statistik rasio kemenangan, serta opsi hapus riwayat.
- **Dual Bahasa (IND & ENG):** Seluruh antarmuka, judul, dialog panduan, etnomatematika, pengaturan, form nama, jendela riwayat, hingga rekaman riwayat langkah dapat dialihkan secara instan antara Bahasa Indonesia (default) dan Bahasa Inggris.
- **Jendela Panduan Otomatis:** Saat pertama membuka game, jendela interaktif 5 slide langsung muncul dilengkapi tombol **✓ OK** dan **Tutup** yang dapat dikonfirmasi kapan saja.
- **Desain Vertikal (Portrait-First):** Dirancang ergonomis untuk penggunaan layar sentuh ponsel pintar, dengan tombol sekali klik untuk berpindah ke tampilan horizontal (Landscape).
- **Skala & Zoom Papan Dinamis:** Penggeser ukuran (65% hingga 135%) serta tombol preset pas (100%) agar papan pas di berbagai ukuran layar.
- **Putar Papan 180°:** Fitur membalik orientasi papan untuk bermain berdua secara langsung berhadapan di satu perangkat.
- **Tiga Tema Visual Pilihan:**
  - *Hijau Beludru & Emas:* Tampilan klasik modern berkualitas tinggi.
  - *Kayu Jati Nusantara:* Nuansa kayu alami tradisional Jawa.
  - *Batu Obsidian & Slate:* Mode gelap dengan kontras visual tinggi.
- **Efek Suara Sintetis (Web Audio API):** Efek ketukan kayu, suara lompatan bidak, dan fanfare kemenangan yang disintesis langsung oleh browser tanpa perlu mengunduh berkas audio eksternal.

---

## 7. Teknologi yang Digunakan
- **Framework:** React 19 + TypeScript
- **Styling:** Vanilla CSS & Tailwind CSS v4
- **Penyimpanan Lokal / Database:** IndexedDB (`DamDamanDB`) + LocalStorage
- **Build Tool:** Vite 8
- **Ikon Antarmuka:** Lucide React
- **Audio:** Web Audio API (Synthesizer prosedural)
- **Hosting & CI/CD:** GitHub Actions & GitHub Pages
- **Custom Domain:** `damdaman.isparmo.com`

---

## 8. Panduan Instalasi & Pengembangan Lokal

### Prasyarat
- Node.js (versi 20 atau lebih baru)
- npm atau Bun

### Langkah-langkah
1. Kloning repositori:
   ```bash
   git clone https://github.com/masisparmo/game-damdaman.git
   cd game-damdaman
   ```
2. Pasang dependensi:
   ```bash
   npm install --legacy-peer-deps
   # atau menggunakan bun:
   bun install
   ```
3. Jalankan server pengembangan lokal:
   ```bash
   npm run dev
   # Akses aplikasi di browser pada: http://localhost:3000
   ```
4. Membuat bundle produksi:
   ```bash
   npm run build
   ```

---

## 9. Pengujian Kualitas Otomatis (QA Testing)
Aplikasi dilengkapi panel uji mutu otomatis terpadu yang dapat diakses melalui tombol **Pengaturan > Jalankan Pengujian Otomatis**. Menjalankan 12 skenario pengujian deterministik yang meliputi:
1. Validasi struktur graf 37 simpul dan formasi awal 16 vs 16 bidak.
2. Keabsahan langkah ortogonal dan diagonal.
3. Mekanisme pemakanan lompat kolinier.
4. Percabangan lompatan makan beruntun (*multi-jump*).
5. Deteksi pinalti DAM dan penarikan 3 bidak penalti.
6. Promosi variasi bidak raja.
7. Deteksi kondisi menang mutlak dan kebuntuan (*stalemate*).
8. Pencegahan permainan tanpa akhir (aturan seri/remis).

---

## 10. Deployment & Custom Domain
Setiap commit yang didorong ke branch `main` secara otomatis memicu alur kerja GitHub Actions di [.github/workflows/deploy.yml](file:///d:/Aplikasi/Game%20Dam-Daman/.github/workflows/deploy.yml) untuk membangun dan mempublikasikan versi terbaru ke GitHub Pages.
- Berkas [public/CNAME](file:///d:/Aplikasi/Game%20Dam-Daman/public/CNAME) berisi `damdaman.isparmo.com` menjaga agar pengaturan custom domain tetap permanen dan tidak terhapus pada setiap proses deployment.

---

## 11. Lisensi & Rujukan Akademik
- **Lisensi:** Apache License 2.0.
- **Rujukan Penelitian Akademik:**
  - Salsabila, A. N., & Marhayati, S. (2024). *Studi Etnomatematika: Konsep Graf pada Permainan Dam-daman Kabupaten Pasuruan*. Math Didactic: Jurnal Pendidikan Matematika, 10(1), 45-58.
  - Balai Pelestarian Nilai Budaya (BPNB) Jawa Barat: *Katalog Permainan Tradisional Nusantara*.
