# EBOOK: Permainan Dam-Daman Online
## Panduan Lengkap Cara Main Hingga Cara Membuatnya
**Penulis:** Isparmo (masisparmo)  
**Website:** [https://damdaman.isparmo.com](https://damdaman.isparmo.com)  
**Repository:** [https://github.com/masisparmo/game-damdaman](https://github.com/masisparmo/game-damdaman)  
**Status Dokumen:** *Living Document (Terus Diperbarui Seiring Proses Pengembangan)*  
**Versi:** 1.0.0 (Tahap Inisiasi Dokumentasi & Redesign UI/UX)

---

## DAFTAR ISI

- [PRAKATA](#prakata)
- [BAB 1: SEJARAH, BUDAYA, DAN ETNOMATEMATIKA DAM-DAMAN](#bab-1-sejarah-budaya-dan-etnomatematika-dam-daman)
  - [1.1. Latar Belakang & Filosofi Tradisional](#11-latar-belakang--filosofi-tradisional)
  - [1.2. Landasan Akademik Etnomatematika](#12-landasan-akademik-etnomatematika)
  - [1.3. Struktur Papan Berbasis Teori Graf](#13-struktur-papan-berbasis-teori-graf)
- [BAB 2: ATURAN RESMI & CARA BERMAIN DAM-DAMAN](#bab-2-aturan-resmi--cara-bermain-dam-daman)
  - [2.1. Penyiapan Papan & Distribusi Bidak](#21-penyiapan-papan--distribusi-bidak)
  - [2.2. Pergerakan Bidak Legal](#22-pergerakan-bidak-legal)
  - [2.3. Mekanisme Melompati & Memakan Bidak](#23-mekanisme-melompati--memakan-bidak)
  - [2.4. Lompatan Beruntun (Multi-Jump)](#24-lompatan-beruntun-multi-jump)
  - [2.5. Aturan Sakral "DAM Ora Mangan" (Pinalti DAM)](#25-aturan-sakral-dam-ora-mangan-pinalti-dam)
  - [2.6. Promosi Bidak Raja (Puncak Gunungan)](#26-promosi-bidak-raja-puncak-gunungan)
  - [2.7. Kondisi Kemenangan, Kekalahan, dan Remis (Draw)](#27-kondisi-kemenangan-kekalahan-dan-remis-draw)
- [BAB 3: ARSITEKTUR TEKNOLOGI & PERANCANGAN SISTEM](#bab-3-arsitektur-teknologi--perancangan-sistem)
  - [3.1. Pemilihan Teknologi (Tech Stack)](#31-pemilihan-teknologi-tech-stack)
  - [3.2. Struktur Proyek & Organisasi File](#32-struktur-proyek--organisasi-file)
  - [3.3. Sistem Grafika Vektor Dinamis (SVG)](#33-sistem-grafika-vektor-dinamis-svg)
  - [3.4. Efek Suara Prosedural dengan Web Audio API](#34-efek-suara-prosedural-dengan-web-audio-api)
  - [3.5. Persistensi Data Lokal dengan IndexedDB](#35-persistensi-data-lokal-dengan-indexeddb)
- [BAB 4: REKAYASA ENGINE PERMAINAN (GAME ENGINE)](#bab-4-rekayasa-engine-permainan-game-engine)
  - [4.1. Representasi State Permainan](#41-representasi-state-permainan)
  - [4.2. Model Simpul Graf & Matriks Ketetanggaan](#42-model-simpul-graf--matriks-ketetanggaan)
  - [4.3. Algoritma Generator Langkah Legal (Move Generator)](#43-algoritma-generator-langkah-legal-move-generator)
  - [4.4. Validasi Langkah Memakan & Multi-Jump](#44-validasi-langkah-memakan--multi-jump)
  - [4.5. Logika Klaim Pinalti DAM (Dam Ora Mangan)](#45-logika-klaim-pinalti-dam-dam-ora-mangan)
- [BAB 5: MEMBANGUN KECERDASAN BUATAN (AI ENGINE)](#bab-5-membangun-kecerdasan-buatan-ai-engine)
  - [5.1. Tingkat Mudah (Easy): Heuristik Greedy Acak](#51-tingkat-mudah-easy-heuristik-greedy-acak)
  - [5.2. Tingkat Sedang (Medium): Minimax dengan Alpha-Beta Pruning](#52-tingkat-sedang-medium-minimax-dengan-alpha-beta-pruning)
  - [5.3. Tingkat Sulit (Hard): Evaluasi Posisi Berbobot Hub Strategis](#53-tingkat-sulit-hard-evaluasi-posisi-berbobot-hub-strategis)
  - [5.4. Tingkat Dewa (Master Brain): Quiescence Search & Pembelajaran Kontinu](#54-tingkat-dewa-master-brain-quiescence-search--pembelajaran-kontinu)
- [BAB 6: MULTIPLAYER ONLINE REALTIME DENGAN SUPABASE](#bab-6-multiplayer-online-realtime-dengan-supabase)
  - [6.1. Arsitektur Komunikasi Realtime Peer-to-Peer](#61-arsitektur-komunikasi-realtime-peer-to-peer)
  - [6.2. Manajemen Room DAM-XXXX & Quick Match](#62-manajemen-room-dam-xxxx--quick-match)
  - [6.3. Sinkronisasi State & Broadcast Reaksi Emotikon](#63-sinkronisasi-state--broadcast-reaksi-emotikon)
  - [6.4. Penanganan Reconnect & Latensi](#64-penanganan-reconnect--latensi)
- [BAB 7: DESAIN UI/UX MODERN BERBASIS ERGONOMI CHESS.COM](#bab-7-desain-uiux-modern-berbasis-ergonomi-chesscom)
  - [7.1. Analisis Kebutuhan Redesign](#71-analisis-kebutuhan-redesign)
  - [7.2. Pola "Sandwich Layout" (Opponent Bar - Board - Player Bar - Action Bar)](#72-pola-sandwich-layout-opponent-bar---board---player-bar---action-bar)
  - [7.3. Ergonomi Mobile-First & Zero-Scroll Viewport](#73-ergonomi-mobile-first--zero-scroll-viewport)
  - [7.4. Tema Estetika (Hijau Beludru, Kayu Jati, Batu Obsidian)](#74-tema-estetika-hijau-beludru-kayu-jati-batu-obsidian)
  - [7.5. Aksesibilitas Visual & Glif Ramah Buta Warna](#75-aksesibilitas-visual--glif-ramah-buta-warna)
- [BAB 8: JURNAL & LOG PERJALANAN PENGEMBANGAN (LIVING CHANGELOG)](#bab-8-jurnal--log-perjalanan-pengembangan-living-changelog)
- [BAB 9: PANDUAN DEPLOYMENT & PENUTUP](#bab-9-panduan-deployment--penutup)

---

## PRAKATA

Buku ini lahir dari keinginan melestarikan salah satu warisan budaya permainan tradisional Nusantara: **Dam-Daman** (sering disebut juga *Damdas*, *Bas-Basan*, atau *Catur Jawa*). 

Di era digital, permainan tradisional sering kali terlupakan karena kalah bersaing dengan game modern. Namun, Dam-Daman memiliki keistimewaan yang luar biasa: di balik kesederhanaan papan kapur dan bidak kerikil, tersimpan **struktur matematika diskrit tingkat tinggi (Teori Graf)** dan **filosofi kehidupan Jawa yang mendalam: *Eling lan Waspada***.

Buku ini ditulis dengan pendekatan ganda yang saling melengkapi:
1. **Untuk Pemain & Pendidik:** Memberikan pemahaman komprehensif tentang cara bermain, strategi menang, filosofi nilai karakter, dan konsep etnomatematika di baliknya.
2. **Untuk Programmer & Software Engineer:** Memberikan panduan teknis langkah-demi-langkah (*step-by-step tutorial*) tentang bagaimana membangun aplikasi web game strategi modern dari nol: mulai dari merancang graf SVG interaktif, membangun rule engine anti-curang, menciptakan AI Minimax tingkat dewa yang bisa belajar sendiri, menghubungkan sistem multiplayer online realtime tanpa backend server rumit, hingga menyempurnakan UI/UX sekelas aplikasi kelas dunia seperti *Chess.com*.

Semoga buku ini bermanfaat bagi para pengembang game, praktisi pendidikan, pemerhati budaya, dan siapa saja yang mencintai warisan intelektual Nusantara.

---

## BAB 1: SEJARAH, BUDAYA, DAN ETNOMATEMATIKA DAM-DAMAN

### 1.1. Latar Belakang & Filosofi Tradisional
Dam-Daman diperkirakan telah dimainkan di berbagai pelosok Nusantara (terutama di Pulau Jawa, Sunda, dan Madura) sejak awal abad ke-20 atau bahkan lebih awal. Dahulu, anak-anak dan orang dewasa memainkannya di pelataran rumah, teras surau, atau pos ronda. Papan cukup digambar menggunakan kapur atau digores di atas tanah liat, sedangkan bidak menggunakan kerikil, pecahan genteng, atau tutup botol.

Dam-Daman bukan sekadar sarana hiburan pengisi waktu luang. Di dalamnya terkandung falsafah hidup:
* ***Eling lan Waspada* (Ingat dan Waspada):** Seorang pemain tidak boleh lengah sedetik pun. Satu kelalaian melihat kesempatan melompat akan berujung pada pinalti telak (*DAM Ora Mangan*).
* **Kesabaran dan Pengendalian Diri:** Menyerang secara membabi buta tanpa perhitungan matang sering kali membuka celah pertahanan sendiri.
* **Kesetaraan Peluang:** Semua bidak memulai permainan dengan kedudukan dan kemampuan yang sama. Kemenangan mutlak ditentukan oleh ketajaman taktik pemain, bukan faktor keberuntungan.

### 1.2. Landasan Akademik Etnomatematika
Aplikasi ini dibangun dengan merujuk langsung pada penelitian etnomatematika terindeks:
> **"Studi Etnomatematika: Konsep Graf pada Permainan Dam-daman Kabupaten Pasuruan"**  
> *Salsabila & Marhayati (2024)*, Math Didactic: Jurnal Pendidikan Matematika, Vol. 10 No. 1, hal. 45-58.

Etnomatematika adalah jembatan antara budaya lokal dengan matematika formal. Dam-Daman membuktikan bahwa masyarakat tradisional Nusantara telah mempraktikkan konsep topologi jaringan dan matematika diskrit berabad-abad sebelum teori tersebut diformalkan di dunia akademik barat.

### 1.3. Struktur Papan Berbasis Teori Graf
Dalam matematika diskrit, papan Dam-Daman dimodelkan sebagai **Graf Sederhana Terhubung Tak Berarah** $G = (V, E)$:
* **Jumlah Simpul / Vertices ($|V|$):** Tepat **37 simpul**. Terdiri dari 25 simpul pada grid tengah ($5 \times 5$) ditambah masing-masing 6 simpul pada dua sayap segitiga (*gunungan* atau *dapur*).
* **Jumlah Sisi / Edges ($|E|$):** Tepat **76 sisi** (garis penghubung ortogonal dan diagonal).
* **Derajat Simpul ($d(v)$):**
  * *Derajat 2 & 3:* Simpul ujung segitiga dan sudut terluar papan.
  * *Derajat 4 & 5:* Persimpangan grid tengah dan simpul batas sayap.
  * *Derajat 8 (Hub Strategis Tertinggi):* Terdapat **7 simpul sentral** (dalam notasi kode: `C`, `Q`, `S`, `A1`, `W`, `U`, `K`). Simpul-simpul berderajat 8 ini adalah persimpangan vital yang memungkinkan bidak bergerak ke 8 arah sekaligus, menjadikannya medan tempur paling strategis untuk mengontrol papan.
* **Sifat Semi-Hamiltonian:** Terdapat lintasan terbuka yang dapat mengunjungi seluruh 37 simpul tepat satu kali tanpa pengulangan.
* **Pewarnaan Graf 3-Kromatik:** Bilangan kromatik graf papan Dam-Daman adalah $\chi(G) = 3$. Artinya, seluruh 37 simpul dapat diwarnai dengan 3 warna berbeda sedemikian rupa sehingga tidak ada dua simpul bertetangga yang memiliki warna sama.

---

## BAB 2: ATURAN RESMI & CARA BERMAIN DAM-DAMAN

### 2.1. Penyiapan Papan & Distribusi Bidak
1. Permainan dimainkan oleh dua orang: **Pemain 1 (P1 - Bidak Oranye / Motif Surya)** dan **Pemain 2 / AI (P2 - Bidak Biru / Motif Intan Bintang)**.
2. Masing-masing pemain memiliki **16 bidak**.
3. Posisi awal:
   * 16 bidak P1 ditempatkan pada daerah pertahanannya (6 simpul di sayap segitiga bawah + 10 simpul pada dua baris grid bawah).
   * 16 bidak P2 ditempatkan pada daerah pertahanannya (6 simpul di sayap segitiga atas + 10 simpul pada dua baris grid atas).
   * **Baris tengah (5 simpul netral)** dibiarkan kosong sebagai zona tempur awal.

### 2.2. Pergerakan Bidak Legal
* Pemain melangkah secara bergantian, satu langkah per giliran.
* Bidak biasa dapat bergeser ke **satu simpul kosong yang bertetangga langsung** melalui garis lintasan yang tersedia (ke depan, ke samping, diagonal, maupun ke belakang).
* Bidak tidak boleh melompati simpul kosong lebih dari satu langkah jika bukan aksi memakan.

### 2.3. Mekanisme Melompati & Memakan Bidak
* Jika di simpul yang bertetangga terdapat bidak lawan, dan simpul persis di belakangnya (pada garis lurus yang sama) dalam kondisi kosong, maka pemain **wajib atau berhak melompati** bidak lawan tersebut.
* Bidak lawan yang dilompati dinyatakan mati (*captured*) dan dikeluarkan dari papan.

### 2.4. Lompatan Beruntun (Multi-Jump)
* Apabila setelah mendarat dari satu lompatan memakan, bidak yang sama mendapati posisi baru yang memungkinkan untuk melompati bidak lawan lainnya, maka pemain **dapat melanjutkan lompatan kedua, ketiga, dan seterusnya** dalam giliran yang sama.
* Rangkaian lompatan berakhir jika tidak ada lagi bidak lawan yang bisa dimakan atau pemain memilih menyelesaikan gilirannya.

### 2.5. Aturan Sakral "DAM Ora Mangan" (Pinalti DAM)
Inilah aturan paling unik dan menegangkan dalam Dam-Daman yang membedakannya dari catur atau dam-daman internasional (*checkers*):
* Jika seorang pemain berada dalam posisi yang **bisa memakan bidak lawan**, namun ia **lalai melihatnya** atau **sengaja melangkah biasa**, maka lawannya berhak meneriakkan / menekan tombol **"DAM!"**.
* Sebagai ganjaran atas kelalaian tersebut (*Dam Ora Mangan*), pemain yang mengklaim pinalti berhak **mengambil 3 bidak lawan sekaligus secara cuma-cuma** dari papan!
* Mekanisme ini menanamkan etos ketelitian dan konsentrasi tinggi.

### 2.6. Promosi Bidak Raja (Puncak Gunungan)
* Fitur opsional yang dapat diaktifkan: Jika sebuah bidak berhasil menembus pertahanan lawan hingga mencapai **puncak segitiga belakang lawan (*Puncak Gunungan / Apex Node*)**, bidak tersebut dipromosikan menjadi **Raja (King)** bermahkota emas.
* Raja memiliki keleluasaan manuver yang lebih lincah dan berwibawa di atas papan.

### 2.7. Kondisi Kemenangan, Kekalahan, dan Remis (Draw)
* **Menang Mutlak:** Pemain berhasil menghabisi ke-16 bidak lawan hingga habis.
* **Menang Kunci (Stalemate):** Lawan masih memiliki bidak, tetapi seluruh bidaknya terkunci total dan tidak memiliki langkah legal sama sekali pada gilirannya.
* **Remis (Seri):**
  1. Terjadi **40 setengah-langkah (20 putaran penuh)** berturut-turut tanpa adanya bidak yang dimakan.
  2. Terjadi pengulangan posisi papan yang sama persis sebanyak 3 kali berturut-turut (*threefold repetition*).

---

## BAB 3: ARSITEKTUR TEKNOLOGI & PERANCANGAN SISTEM

### 3.1. Pemilihan Teknologi (Tech Stack)
Aplikasi dibangun dengan prinsip *zero-bloat*, kecepatan kilat (*sub-second response*), dan kemudahan akses di semua peramban (*cross-platform web application*):
* **React 19 & TypeScript:** Memberikan keandalan *type-safety*, modularitas komponen, dan *state management* modern berbasis hook.
* **Vite 6 / 8:** Perkakas build modern ultra-cepat dengan *Hot Module Replacement (HMR)* instan.
* **Tailwind CSS v4:** Utilitas penataan gaya modern, responsif, hemat ukuran CSS, dan mudah dikustomisasi.
* **SVG (Scalable Vector Graphics):** Papan dan bidak digambar menggunakan elemen SVG murni dengan perhitungan matematika koordinat graf, bukan gambar raster png/jpg. Menghasilkan visual yang sangat tajam di layar resolusi tinggi (Retina display) dan ukuran file yang sangat kecil.
* **Lucide React:** Koleksi ikon modern yang bersih dan konsisten.
* **Canvas Confetti:** Efek visual semarak saat pemain meraih kemenangan.
* **Web Audio API:** Efek suara sintetis prosedural tanpa memerlukan unduhan berkas MP3/WAV eksternal.
* **IndexedDB:** Database browser lokal untuk menyimpan statistik dan riwayat permainan lengkap tanpa membebani server.
* **Supabase Realtime (WebSocket):** Sinkronisasi langkah multiplayer online secara instan antar perangkat dengan kode kamar ringkas (*DAM-XXXX*).

### 3.2. Struktur Proyek & Organisasi File
```
game-damdaman/
├── public/
│   ├── data/
│   │   └── master_brain.json      # Pengetahuan taktik pembukaan AI Dewa
│   ├── audio/                     # Cadangan aset suara
│   └── favicon.svg                # Ikon aplikasi web
├── src/
│   ├── components/                # Komponen antarmuka pengguna (UI)
│   │   ├── Board.tsx              # Komponen utama visual papan SVG
│   │   ├── ModalTutorial.tsx      # Panduan cara bermain
│   │   ├── ModalEtnomatematika.tsx# Penjelasan ilmiah teori graf
│   │   ├── ModalSettings.tsx      # Pengaturan audio, tema, & aturan
│   │   ├── ModalGameOver.tsx      # Dialog akhir pertandingan
│   │   ├── ModalGameHistory.tsx   # Penampil riwayat dari IndexedDB
│   │   ├── ModalOnlineLobby.tsx   # Lobi kamar online & Quick Match
│   │   └── ModalPlayerName.tsx    # Pengganti nama pemain
│   ├── game/                      # Logika murni permainan (Headless Engine)
│   │   ├── boardData.ts           # Definisi 37 simpul, 76 sisi & koordinat
│   │   ├── rulesEngine.ts         # Mesin aturan langkah legal & pinalti
│   │   ├── aiEngine.ts            # Kecerdasan buatan (Easy s.d. Master)
│   │   ├── aiMemory.ts            # Pembelajaran adaptif memori AI Dewa
│   │   ├── onlineMatch.ts         # Integrasi Supabase Realtime
│   │   ├── db.ts                  # Lapisan penyimpanan IndexedDB
│   │   └── audio.ts               # Sintesis suara Web Audio API
│   ├── i18n.tsx                   # Dukungan dual bahasa (ID & EN)
│   ├── App.tsx                    # Komponen orkestrator utama aplikasi
│   ├── main.tsx                   # Entry point aplikasi
│   └── index.css                  # Gaya global Tailwind
├── EBOOK_PANDUAN_DAM_DAMAN.md     # Dokumen master buku panduan lengkap
├── package.json                   # Dependensi & script proyek
└── vite.config.ts                 # Konfigurasi bundling Vite
```

### 3.3. Sistem Grafika Vektor Dinamis (SVG)
Tidak seperti catur konvensional yang menggunakan petak kotak persegi (*checkerboard tiles*), papan Dam-Daman adalah **jaringan topologi garis dan simpul**. Oleh karena itu, pendekatan terbaik adalah menggunakan SVG dengan `viewBox`:
* **Mode Tegak (Portrait):** Menggunakan kanvas $560 \times 860$ piksel. Sangat proporsional untuk layar smartphone vertikal, di mana Pemain 1 berada di sisi bawah dan Pemain 2/AI berada di sisi atas.
* **Mode Mendatar (Landscape):** Menggunakan kanvas $980 \times 580$ piksel untuk orientasi horizontal klasik di monitor komputer.
* Proyeksi koordinat ternormalisasi ($0.0 \dots 1.0$) dipetakan secara matematis ke koordinat piksel SVG dengan fungsi transformasi rotasi trigonometris, sehingga logika engine terpisah bersih dari tampilan visual.

### 3.4. Efek Suara Prosedural dengan Web Audio API
Untuk menjamin permainan tetap ringan dan dapat dimainkan saat koneksi lambat tanpa menunggu unduhan file audio besar, seluruh efek suara disintesis langsung menggunakan `AudioContext`:
* **Suara Langkah Biasa (*Piece Slide*):** Gelombang sinus frekuensi rendah dengan amplop atenuasi eksponensial lembut yang meniru ketukan batu kerikil di atas papan kayu.
* **Suara Memakan Bidak (*Capture*):** Nada frekuensi menengah dengan resonansi tegas.
* **Suara Pinalti DAM (*Dam Claim*):** Rentetan bunyi frekuensi tajam yang mengagetkan dan dramatis.
* **Suara Kemenangan (*Victory Fanfare*):** Rangkaian arpeggio akor mayor bernada ceria.

### 3.5. Persistensi Data Lokal dengan IndexedDB
Setiap pertandingan yang selesai secara otomatis dicatat ke dalam database peramban `IndexedDB` (database: `damdaman_db`, store: `game_history`):
* Mencatat tanggal dan waktu pertandingan.
* Mode permainan (vs AI, 2 Pemain lokal, atau Online).
* Tingkat kesulitan AI jika melawan komputer.
* Pemenang dan alasan kemenangan (habis bidak / terkunci).
* Total langkah yang dimainkan.
* Durasi pertandingan.
* Seluruh notasi langkah pertandingan dari awal hingga akhir sehingga dapat ditinjau ulang di masa mendatang.

---

## BAB 4: REKAYASA ENGINE PERMAINAN (GAME ENGINE)

### 4.1. Representasi State Permainan
Engine permainan dirancang menggunakan paradigma *immutable state*:
```typescript
interface GameState {
  board: Record<string, string | null>; // Pemetaan Simpul -> ID Bidak
  pieces: Record<string, Piece>;        // Koleksi Objek Bidak
  currentPlayer: PlayerId;              // 'P1' | 'P2'
  status: 'playing' | 'game_over';
  winner: PlayerId | 'draw' | null;
  consecutivePieceId: string | null;    // Bidak yang wajib melanjutkan multi-jump
  opponentMissedCapture: boolean;       // Indikator bahwa lawan melewatkan makan (DAM!)
  damClaimedThisTurn: boolean;
  moveHistory: Move[];                  // Rekaman jejak pertandingan
}
```

### 4.2. Model Simpul Graf & Matriks Ketetanggaan
Setiap simpul pada graf memiliki:
1. `id`: Identitas unik (misal `'A'`, `'B'`, `'C'`, dst.).
2. `x, y`: Posisi ternormalisasi ($0.0$ hingga $1.0$).
3. `neighbors`: Daftar tetangga yang terhubung langsung melalui garis.
4. `jumpLines`: Pasangan simpul garis lurus untuk mekanisme melompati lawan. Jika tetangga $B$ dilewati dari simpul asal $A$, maka bidak akan mendarat di simpul tujuan $C$.

### 4.3. Algoritma Generator Langkah Legal (Move Generator)
Fungsi `getLegalMoves(state, playerId)` mengevaluasi seluruh bidak milik pemain aktif:
1. Cek apakah ada bidak yang sedang dalam status *consecutive multi-jump*. Jika ada, hanya bidak tersebut yang boleh melangkah dan hanya lompatan memakan yang diizinkan.
2. Cek seluruh kemungkinan langkah memakan (*capture moves*).
3. Jika opsi memakan tersedia, engine menandai apakah aturan memakan wajib diterapkan atau diizinkan langkah biasa dengan konsekuensi pinalti DAM.
4. Cek seluruh kemungkinan langkah bergeser biasa (*slide moves*) ke simpul tetangga yang kosong.

### 4.4. Logika Klaim Pinalti DAM (Dam Ora Mangan)
Saat pemain selesai melangkah, engine memeriksa apakah sebelum langkah tersebut dieksekusi, pemain tersebut sebenarnya memiliki kesempatan memakan bidak lawan namun memilih langkah biasa. Jika terdeteksi:
* Flag `opponentMissedCapture` diset ke `true`.
* Tombol **Klaim Pinalti DAM** menjadi aktif untuk pemain yang kini mendapat giliran.
* Jika tombol diklaim, engine mengeksekusi fungsi `claimDamPenalty()`, menghapus 3 bidak lawan dari papan, dan mencatatnya ke dalam riwayat pertandingan.

---

## BAB 5: MEMBANGUN KECERDASAN BUATAN (AI ENGINE)

### 5.1. Tingkat Mudah (Easy): Heuristik Greedy Acak
* Mengutamakan langkah memakan jika tersedia.
* Memilih langkah acak berbobot (*weighted random*) untuk langkah biasa.
* Cocok untuk pemula dan anak-anak yang baru mengenal permainan.

### 5.2. Tingkat Sedang (Medium): Minimax dengan Alpha-Beta Pruning
* Menggunakan pohon pencarian rekursif Minimax dengan kedalaman 3 hingga 4 *ply*.
* Pemangkasan Alpha-Beta (*Alpha-Beta Pruning*) untuk memangkas cabang pohon yang tidak menjanjikan, menghemat waktu komputasi secara signifikan.
* Fungsi evaluasi dasar menghitung:
  $$\text{Score} = (\text{Bidak AI} - \text{Bidak Lawan}) \times 100 + \text{Mobilitas Langkah}$$

### 5.3. Tingkat Sulit (Hard): Evaluasi Posisi Berbobot Hub Strategis
Memanfaatkan konsep etnomatematika derajat simpul:
* Memberikan nilai bonus tinggi (+35 poin) jika bidak berhasil menguasai 7 Simpul Hub Berderajat 8 (`C`, `Q`, `S`, `A1`, `W`, `U`, `K`).
* Memberikan penalti jika bidak terisolasi di sudut mati papan.
* Memperhitungkan potensi ancaman garpu (*fork attack*) dan perlindungan bidak berteman.

### 5.4. Tingkat Dewa (Master Brain): Quiescence Search & Pembelajaran Kontinu
Tingkat tertinggi (*Grandmaster AI*) dirancang dengan fitur canggih:
1. **Quiescence Search:** Mencegah efek *Horizon Effect* (kesalahan evaluasi akibat pemotongan kedalaman saat situasi sedang terjadi aksi saling makan beruntun). Pohon pencarian diperpanjang khusus untuk rantai memakan hingga posisi benar-benar tenang (*quiet*).
2. **Master Brain Knowledge (`master_brain.json`):** Memuat buku pembukaan (*opening book*) taktis yang telah dipelajari dari ribuan simulasi langkah grandmaster.
3. **Pembelajaran Adaptif (Blunder Memory):** Setiap kali pertandingan berakhir, modul `aiMemory.ts` menganalisis apakah kekalahan disebabkan oleh langkah tertentu. Nilai bobot langkah tersebut diturunkan di memori lokal agar kesalahan yang sama tidak terulang di masa mendatang.

---

## BAB 6: MULTIPLAYER ONLINE REALTIME DENGAN SUPABASE

### 6.1. Arsitektur Komunikasi Realtime Peer-to-Peer
Aplikasi memanfaatkan fitur **Supabase Broadcast Channel** (protokol WebSocket berlatensi sangat rendah). Keunggulan pendekatan ini:
* Tidak memerlukan server game backend berbasis Node.js/Socket.io yang mahal untuk dihosting secara terpisah.
* Seluruh sinkronisasi state ditangani secara terdesentralisasi (*peer-to-peer over managed websocket channel*).

### 6.2. Manajemen Room DAM-XXXX & Quick Match
* Pemain dapat membuat ruangan privat dan membagikan tautan/kode kamar 4 huruf unik (contoh: `DAM-7821`).
* Pemain lain cukup memasukkan kode tersebut atau membuka tautan dengan parameter URL `?room=DAM-7821` untuk langsung bergabung.
* Tersedia pula fitur **Quick Match** yang secara otomatis mencocokkan pemain dengan antrean lobi publik yang sedang mencari lawan.

### 6.3. Sinkronisasi State & Broadcast Reaksi Emotikon
Pesan yang disiarkan melalui channel Supabase:
1. `join`: Pengumuman kehadiran lawan dan negosiasi peran (P1 atau P2).
2. `move`: Pengiriman langkah legal yang dieksekusi, diverifikasi ulang oleh engine lokal masing-masing pemain untuk mencegah kecurangan (*anti-cheat client verification*).
3. `dam_claim`: Penegakan pinalti DAM secara tersinkronisasi.
4. `reaction`: Pengiriman emotikon interaktif instan (👋, 😂, 👏, 👑, 🔥, ☕) untuk menambah keseruan interaksi sosial saat bertanding.

---

## BAB 7: DESAIN UI/UX MODERN BERBASIS ERGONOMI CHESS.COM

### 7.1. Analisis Kebutuhan Redesign
Pada antarmuka versi awal:
* Panel pemain (Player 1 dan Player 2) diletakkan berdampingan (*grid-cols-2*) di atas papan.
* Begitu banyak tombol utilitas (bahasa, bantuan, riwayat, etnomatematika, pengaturan, suara, mode switcher, undo, reset, dan slider zoom) berdesakan di atas papan.
* Akibatnya, pada layar smartphone, papan terdorong jauh ke bawah dan pemain harus menggulir layar (*scrolling*), yang sangat mengurangi kenyamanan bermain.

### 7.2. Pola "Sandwich Layout" (Opponent Bar - Board - Player Bar - Action Bar)
Mengadaptasi tata letak aplikasi papan catur terpopuler di dunia (*Chess.com Mobile*), antarmuka disusun secara terstruktur dari atas ke bawah:
1. **Compact Top Navbar:** Menampilkan logo ringkas "D", judul, pil mode pertandingan aktif (misal: *vs AI · Sedang*), serta tombol menu minimalis.
2. **Opponent Player Bar:** Menampilkan avatar lawan (AI/P2), nama, indikator giliran, dan sisa bidak persis di atas papan.
3. **Responsive Game Board:** Papan permainan menjadi fokus utama visual (*board-centric*), memanfaatkan 70-80% tinggi viewport layar, dengan penskalaan otomatis tanpa terpotong (*zero clipping*).
4. **Player 1 Bar:** Menampilkan identitas pemain utama di bawah papan, lengkap dengan tombol terintegrasi untuk *Klaim Pinalti DAM* saat momennya tiba.
5. **Bottom Action Bar:** Bilah tombol di bagian paling bawah yang mudah dijangkau ibu jari (*thumb zone*) berisi: *Mode Baru*, *Undo*, *Langkah/Riwayat*, dan *Reset*.

### 7.3. Ergonomi Mobile-First & Zero-Scroll Viewport
* Menggunakan satuan viewport dinamis (`dvh`) dan kontainer flex adaptif dengan `min-height: 0`.
* Papan otomatis menyesuaikan lebar dan tinggi ruang yang tersedia tanpa menimbulkan *scroll* pada smartphone resolusi 360x800, 390x844, maupun 412x915.

### 7.4. Tema Estetika (Hijau Beludru, Kayu Jati, Batu Obsidian)
Menghadirkan tiga tema visual berkelas tinggi:
* **Hijau Beludru (Modern Green Velvet):** Mengadopsi palet klasik catur internasional dengan kontras tinggi dan garis emas berwibawa.
* **Kayu Jati Klasik (Heritage Teak Wood):** Nuansa ukiran kayu khas Jawa yang hangat, ramah, dan tradisional.
* **Batu Obsidian (Dark Obsidian Slate):** Nuansa modern minimalis bernuansa batu alam gelap yang futuristik dan elegan.

### 7.5. Aksesibilitas Visual & Glif Ramah Buta Warna
Bidak tidak hanya dibedakan berdasarkan warna oranye dan biru, melainkan diperkuat dengan glif ukiran geometris:
* **Bidak P1:** Motif lingkaran konsentris surya (*Solar Motif*).
* **Bidak P2:** Motif intan bintang empat lapis lapis lazuli (*Star Diamond Motif*).
* Memastikan pemain dengan defisiensi penglihatan warna tetap dapat membedakan bidak dengan sangat jelas dan nyaman.

---

## BAB 8: JURNAL & LOG PERJALANAN PENGEMBANGAN (LIVING CHANGELOG)

> *Bagian ini merupakan rekaman langsung (*living history*) dari setiap proses perancangan, implementasi, perbaikan, dan penyempurnaan yang dilakukan pada proyek Maen Dam-Daman.*

### 📅 Tahap 1 — Fondasi Awal & Engine Etnomatematika
* **Pencapaian:** 
  * Pemodelan matematis 37 simpul dan 76 garis graf papan Dam-Daman.
  * Penyusunan modul `boardData.ts` dan fungsi legal move generator `rulesEngine.ts`.
  * Implementasi aturan lompatan memakan (*jump capture*) dan multi-jump.
  * Implementasi pinalti tradisional *DAM Ora Mangan* (pengambilan 3 bidak).
  * Pembuatan komponen visual papan interaktif awal berbasis SVG.

### 📅 Tahap 2 — Kecerdasan Buatan & Memori Grandmaster
* **Pencapaian:**
  * Pembuatan AI tingkat Easy, Medium, dan Hard dengan Minimax + Alpha-Beta Pruning.
  * Penyusunan bobot strategis untuk 7 simpul berderajat 8.
  * Integrasi *Level Dewa (Master Brain)* dengan berkas `master_brain.json` dan algoritma *Quiescence Search*.
  * Penambahan modul `aiMemory.ts` untuk pencatatan blunder dan adaptasi gaya bermain.

### 📅 Tahap 3 — Multiplayer Online, Audio Sintetis, & IndexedDB
* **Pencapaian:**
  * Integrasi Supabase Realtime channel untuk fitur bermain online dengan kode kamar unik `DAM-XXXX`.
  * Penambahan fitur Quick Match dan siaran reaksi emotikon interaktif.
  * Pembuatan synthesizer suara prosedural dengan Web Audio API di `audio.ts`.
  * Pembuatan database lokal `IndexedDB` di `db.ts` untuk menyimpan rekap dan statistik pertandingan.
  * Implementasi dukungan dual bahasa (Bahasa Indonesia & Bahasa Inggris) di `i18n.tsx`.

### 📅 Tahap 4 — Master Redesign UI/UX V2 (Mobile-First & Ergonomi Chess.com) *(Selesai & Terverifikasi)*
* **Latar Belakang:**
  * Pada versi sebelumnya, kartu pemain berdampingan (*grid-cols-2*) di atas papan dan kontrol bertumpuk menyebabkan papan terdesak ke bawah serta memicu scrolling di smartphone.
* **Perubahan Arsitektur Antarmuka:**
  * **Zona 1 (Compact Top Navbar):** Header ramping (~48px) dengan logo "D", judul permainan, dan pill mode interaktif (contoh: `vs Sedang ▾` / `2 Pemain ▾` / `Online ▾`) yang dapat diklik untuk membuka modal pemilihan mode dan tingkat AI. Utilitas sekunder (Bahasa, Suara, Bantuan, Riwayat, Etnomatematika, Pengaturan) tersusun rapi tanpa memicu *horizontal overflow*.
  * **Zona 2 (Opponent Player Bar):** Kartu lawan diletakkan di atas papan dengan avatar AI/P2, nama lawan, sisa bidak, dan indikator giliran/berpikir.
  * **Zona 3 (Responsive Game Board):** Container fleksibel dengan auto-fit penuh. Papan SVG memanfaatkan ruang vertikal optimal tanpa memotong ujung sayap segitiga (*gunungan*) atas maupun bawah. Toolbar zoom manual lama dipindahkan menjadi *floating controls* di sudut papan sehingga tidak memakan ruang vertikal.
  * **Zona 4 (Player 1 Bar):** Kartu Pemain 1 diletakkan di bawah papan lengkap dengan tombol aksi khusus (*Klaim Pinalti DAM* dan *Selesai Lompat*) yang terintegrasi langsung tanpa mengubah posisi/tinggi papan (*zero Cumulative Layout Shift*).
  * **Zona 5 (Bottom Action Bar):** 4 tombol aksi ergonomis di zona ibu jari (*thumb zone*): `Mode`, `Undo`, `Langkah (N)`, dan `Reset`.
  * **Komponen Baru:** `ModalGameMode.tsx` sebagai dialog elegan untuk memilih mode (vs AI, 2 Pemain, Online) dan 4 tingkat kecerdasan AI.
* **Verifikasi Kualitas & Pengujian:**
  * **Pemeriksaan Tipe TypeScript (`npm run lint`):** Lulus 100% (0 error). Memperbaiki kompatibilitas tipe `gameMode: 'ai' | 'pvp' | 'online'` di `db.ts`, `Board.tsx`, `ModalPlayerName.tsx`, dan `ModalGameOver.tsx`, serta penanganan promise di `aiMemory.ts`.
  * **Kompilasi Produksi (`npm run build`):** Berhasil dengan Vite dalam 751ms.
  * **Pengujian Browser Aktual (Viewport HP 390x844):** 
    - Papan terlihat 100% utuh dengan **Zero Vertical Scrolling**.
    - Modal tutorial, modal mode AI, dan pemilihan bidak berfungsi sangat responsif.
    - AI merespons seketika terhadap langkah pemain dan penegakan aturan melompat/memakan terbukti akurat.

### 📅 Tahap 5 — Penyempurnaan Onboarding Pengguna & Eliminasi Jargon Teknis *(Selesai & Terverifikasi)*
* **Latar Belakang & Masukan Pengguna:**
  * Pengguna non-Indonesia memerlukan tombol pilihan bahasa langsung pada jendela awal saat pertama kali membuka aplikasi.
  * Pada layar smartphone sempit, tombol aksi di jendela cara bermain (*ModalTutorial*) mengalami *overflow* (terpotong ke luar bingkai).
  * Antarmuka masih memuat istilah teknis IT seperti *IndexedDB*, *simpul/vertex*, dan *sisi/edge* yang membingungkan bagi masyarakat umum.
* **Solusi & Perbaikan:**
  * **Pilihan Bahasa di Jendela Awal:** Menambahkan tombol toggle bahasa instan (`🇮🇩 ID` / `🇬🇧 EN`) di pojok kanan atas `ModalTutorial` dan `ModalPlayerName` sehingga pemain internasional dapat beralih bahasa seketika dari layar pertama.
  * **Navigasi Mobile-Safe:** Merombak bilah navigasi bawah `ModalTutorial` menjadi responsif: tombol *Sebelumnya* di kiri, indikator titik di tengah, dan tombol *Selanjutnya* / *Mulai Bermain* di kanan. Menghilangkan tombol berlebih sehingga **100% bebas dari overflow**.
  * **Penyucian Bahasa dari Jargon IT:** Mengganti istilah *IndexedDB* menjadi bahasa awam yang ramah (*"Pencatatan Otomatis Riwayat"*), serta menyederhanakan penjelasan geometri papan menjadi *"37 titik temu garis dan 76 garis lintasan"* tanpa jargon asing.
* **Hasil Pengujian Browser:**
  * Terverifikasi lulus pengujian visual mobile portrait (390 × 844) dengan tombol yang pas di dalam jendela dan alih bahasa instan.

---

## BAB 9: PANDUAN DEPLOYMENT & PENUTUP

### 9.1. Menjalankan Proyek Secara Lokal
Pastikan Node.js telah terpasang di komputer Anda. Buka terminal di direktori proyek:
```bash
# 1. Pasang dependensi
npm install

# 2. Jalankan server pengembangan lokal
npm run dev

# 3. Buka di peramban: http://localhost:3000
```

### 9.2. Melakukan Build & Verifikasi Kualitas
```bash
# Pemeriksaan tipe data TypeScript
npm run lint

# Kompilasi bundel produksi
npm run build

# Meninjau hasil kompilasi
npm run preview
```

### 9.3. Menghubungkan Domain Kustom
Aplikasi ini dihosting secara otomatis pada platform Cloudflare Pages / Vercel / GitHub Pages dengan domain kustom:
* Buat berkas `public/CNAME` berisi nama domain Anda: `damdaman.isparmo.com`.
* Atur DNS CNAME Record di penyedia domain Anda mengarah ke server hosting.
* Aktifkan sertifikat SSL/TLS otomatis untuk keamanan koneksi HTTPS.

---
*Dokumen ini akan terus diperbarui secara berkala pada setiap pencapaian penting dalam pengembangan Maen Dam-Daman.*
