/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Interactive Tutorial & Rules Guide for Maen Dam-Daman.
 * Grounded in West Java Traditional Games Catalog & Pasuruan Ethnomathematics study.
 */

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, BookOpen, ShieldAlert, Trophy, Compass, Flame } from 'lucide-react';

interface ModalTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalTutorial: React.FC<ModalTutorialProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: '1. Asal Usul & Papan Dam-Daman',
      icon: <Compass className="w-5 h-5 text-amber-400" />,
      content: (
        <div className="space-y-3 text-stone-300 text-sm leading-relaxed">
          <p>
            <strong className="text-amber-300">Dam-Daman</strong> (atau dikenal juga sebagai{' '}
            <em>Damdas</em>, <em>Bas-Basan</em>, atau <em>Catur Jawa</em>) adalah permainan papan strategi
            tradisional asli Indonesia yang populer sejak abad ke-20 untuk melatih ketangkasan berpikir,
            kecermatan kalkulasi, dan kesabaran.
          </p>
          <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800">
            <h4 className="font-semibold text-stone-200 mb-1 flex items-center gap-1.5">
              <span>Struktur Graf Papan Autentik</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-stone-400 text-xs">
              <li>Terdiri dari <strong>37 titik temu garis (simpul/vertex)</strong> dan <strong>76 garis penghubung (sisi/edge)</strong>.</li>
              <li>Papan tengah berbentuk bujur sangkar 5x5 dengan garis diagonal di setiap kuadran.</li>
              <li>Kedua ujung memiliki sayap segitiga (dikenal sebagai <em>Dapur</em>, <em>Gunungan</em>, atau <em>Ekor</em>).</li>
              <li>Masing-masing pemain dibekali <strong>16 bidak</strong>. Kolom tengah (5 titik) dikosongkan saat mulai.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: '2. Cara Melangkah & Menggerakkan Bidak',
      icon: <BookOpen className="w-5 h-5 text-emerald-400" />,
      content: (
        <div className="space-y-3 text-stone-300 text-sm leading-relaxed">
          <p>
            Pemain bergantian melangkahkan <strong>satu bidak</strong> ke titik tetangga yang langsung
            terhubung oleh garis pada papan permainan.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800">
              <span className="font-semibold text-emerald-400 block mb-1">✓ Gerakan Sah:</span>
              <p className="text-stone-400">
                Bidak hanya boleh berpindah ke titik kosong yang dihubungkan langsung oleh garis lurus (horizontal, vertikal, atau diagonal yang sah).
              </p>
            </div>
            <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800">
              <span className="font-semibold text-rose-400 block mb-1">✗ Tidak Diizinkan:</span>
              <p className="text-stone-400">
                Tidak boleh melompati titik tanpa garis, tidak boleh menggeser bidak ke titik yang sudah ada bidak teman atau lawan.
              </p>
            </div>
          </div>
          <p className="text-xs text-stone-400 italic">
            Tip: Klik bidak Anda untuk melihat lingkaran hijau sebagai penanda arah langkah yang sah.
          </p>
        </div>
      ),
    },
    {
      title: '3. Cara Melompat & Memakan Lawan',
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      content: (
        <div className="space-y-3 text-stone-300 text-sm leading-relaxed">
          <p>
            Pemakanan dilakukan dengan cara <strong>melompati bidak lawan</strong> yang berada tepat di
            titik sebelahnya, menuju ke titik kosong tepat di belakangnya sepanjang satu jalur garis lurus.
          </p>
          <div className="bg-amber-950/30 border border-amber-800/50 p-3 rounded-xl text-xs space-y-1.5">
            <p className="font-semibold text-amber-300">Syarat Lompatan Makan:</p>
            <ol className="list-decimal list-inside space-y-1 text-stone-300">
              <li>Bidak Anda dan bidak lawan harus berada di garis lurus yang terhubung pada papan.</li>
              <li>Titik persis setelah bidak lawan harus kosong (tidak terhalang bidak lain).</li>
              <li>Bidak lawan yang dilompati dikeluarkan dari papan permainan.</li>
            </ol>
          </div>
          <div className="p-2.5 bg-stone-900/70 rounded-lg text-xs text-stone-300">
            <strong className="text-amber-400">Pemakanan Beruntun (Multi-Jump):</strong> Jika setelah melompat masih tersedia sasaran makan berikutnya dengan bidak yang sama, Anda dapat langsung melompat lagi!
          </div>
        </div>
      ),
    },
    {
      title: '4. Aturan Pinalti "DAM" (Dam Ora Mangan)',
      icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
      content: (
        <div className="space-y-3 text-stone-300 text-sm leading-relaxed">
          <p>
            Inilah keunikan khas nama <strong>"Dam-Daman"</strong>! Dalam tradisi Jawa Barat dan Jawa Timur,
            terdapat pepatah <em>"Dam ora mangan"</em> (karena lupa atau tidak memakan bidak lawan yang terbuka).
          </p>
          <div className="bg-rose-950/30 border border-rose-800/50 p-3 rounded-xl text-xs space-y-2">
            <h5 className="font-bold text-rose-300">Konsekuensi Melalaikan Makan:</h5>
            <p className="text-stone-300">
              Jika seorang pemain memiliki kesempatan sah untuk memakan bidak lawan tetapi justru melangkahkan bidak lain atau tidak memakannya, pemain lawan berhak berseru <strong>"DAM!"</strong> dan <strong>mengambil 3 bidak lawan</strong> secara cuma-cuma sebagai penalti!
            </p>
          </div>
          <p className="text-xs text-stone-400">
            Di dalam game ini, saat lawan melewatkan kesempatan makan, tombol <strong>"Klaim Pinalti DAM!"</strong> akan menyala untuk Anda klaim.
          </p>
        </div>
      ),
    },
    {
      title: '5. Bidak Raja & Syarat Menang',
      icon: <Trophy className="w-5 h-5 text-yellow-400" />,
      content: (
        <div className="space-y-3 text-stone-300 text-sm leading-relaxed">
          <div className="space-y-1.5">
            <h4 className="font-semibold text-yellow-300 text-xs">Variasi Bidak Raja:</h4>
            <p className="text-xs text-stone-300">
              Jika variasi Raja diaktifkan di Pengaturan, bidak biasa yang berhasil menembus ke puncak segitiga paling belakang wilayah lawan akan dipromosikan menjadi <strong>Raja</strong> bermahkota emas dengan keistimewaan langkah.
            </p>
          </div>

          <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800 space-y-1.5 text-xs">
            <h4 className="font-semibold text-stone-200">Kondisi Kemenangan & Seri:</h4>
            <ul className="list-disc list-inside space-y-1 text-stone-400">
              <li><strong className="text-stone-200">Menang Mutlak:</strong> Berhasil menghabiskan seluruh 16 bidak lawan.</li>
              <li><strong className="text-stone-200">Menang Kebuntuan (Stalemate):</strong> Lawan terkunci dan tidak memiliki satu pun gerakan legal saat gilirannya tiba.</li>
              <li><strong className="text-stone-200">Hasil Seri:</strong> Tidak ada pemakanan selama 40 giliran, atau pengulangan posisi yang sama sebanyak 3 kali berturut-turut.</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2">
            {slides[activeTab].icon}
            <h3 className="font-bold text-stone-100 text-base">Panduan Cara Bermain</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <h4 className="text-base font-bold text-amber-400">
            {slides[activeTab].title}
          </h4>
          {slides[activeTab].content}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`h-2 rounded-full transition-all ${
                  activeTab === i ? 'w-6 bg-amber-500' : 'w-2 bg-stone-700 hover:bg-stone-600'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
              disabled={activeTab === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition text-stone-200"
            >
              <ChevronLeft size={14} />
              Sebelumnya
            </button>
            {activeTab < slides.length - 1 ? (
              <button
                onClick={() => setActiveTab(activeTab + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 transition text-white"
              >
                Selanjutnya
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 transition text-white"
              >
                Mulai Main!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
