/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Ethnomathematics & Cultural Heritage Modal for Dam-Daman.
 * Highlights the academic research paper by Salsabila & Marhayati (2024):
 * "Studi Etnomatematika: Konsep Graf pada Permainan Dam-daman Kabupaten Pasuruan".
 */

import React from 'react';
import { X, Network, GraduationCap, CheckCircle2 } from 'lucide-react';

interface ModalEtnomatematikaProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalEtnomatematika: React.FC<ModalEtnomatematikaProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-stone-900 border border-amber-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-amber-950/40">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="font-bold text-stone-100 text-base">Etnomatematika & Teori Graf</h3>
              <p className="text-[11px] text-amber-300/80">Kajian Ilmiah Papan Dam-Daman Pasuruan & Jabar</p>
            </div>
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
        <div className="p-5 overflow-y-auto space-y-4 text-stone-300 text-xs sm:text-sm leading-relaxed">
          <div className="p-3.5 bg-stone-950/70 border border-stone-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
              <Network size={16} />
              <span>Sumber Penelitian Akademik:</span>
            </div>
            <p className="text-stone-300 italic text-xs">
              "Studi Etnomatematika: Konsep Graf pada Permainan Dam-daman Kabupaten Pasuruan" (Salsabila & Marhayati, 2024. Math Didactic: Jurnal Pendidikan Matematika).
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-stone-100 text-sm flex items-center gap-1.5">
              <span>Karakteristik Graf Papan Dam-Daman</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-stone-950/50 p-2.5 rounded-lg border border-stone-800/80">
                <span className="text-stone-400 block text-[11px]">Orde Graf (Titik)</span>
                <span className="text-amber-400 font-mono text-base font-bold">37 Simpul</span>
              </div>
              <div className="bg-stone-950/50 p-2.5 rounded-lg border border-stone-800/80">
                <span className="text-stone-400 block text-[11px]">Ukuran Graf (Garis)</span>
                <span className="text-emerald-400 font-mono text-base font-bold">76 Sisi</span>
              </div>
              <div className="bg-stone-950/50 p-2.5 rounded-lg border border-stone-800/80">
                <span className="text-stone-400 block text-[11px]">Derajat Titik (Degree)</span>
                <span className="text-sky-400 font-mono text-base font-bold">2, 3, 4, 5, 8</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-stone-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <p>
                <strong>Graf Terhubung & Sederhana:</strong> Setiap simpul saling terhubung oleh tepat satu sisi tanpa sisi ganda dan tanpa gelang (loop).
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <p>
                <strong>Graf Semi-Hamilton:</strong> Terdapat lintasan yang melewati semua 37 simpul tepat satu kali dari ujung ke ujung.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <p>
                <strong>Graf Berkromatik-3:</strong> Seluruh 37 simpul dapat diwarnai hanya dengan 3 warna berbeda sedemikian rupa sehingga simpul bersebelahan selalu memiliki warna berbeda.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <p>
                <strong>Simpul Strategis Berderajat 8:</strong> Titik C, Q, S, A1, W, U, K memiliki 8 sisi (maksimal) yang menjadi simpul perebutan paling krusial dalam adu strategi.
              </p>
            </div>
          </div>

          <div className="bg-amber-950/20 border border-amber-900/40 p-3 rounded-xl text-stone-300 text-xs">
            <p className="font-semibold text-amber-300 mb-1">Filosofi Permainan Tradisional:</p>
            <p className="text-stone-400">
              Permainan ini mengajarkan kalkulasi langkah ke depan, kesabaran dalam menunggu giliran, kecermatan membaca jebakan musuh, serta jiwa sportif dan berlapang dada saat menghadapi kekalahan.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-5 py-3 border-t border-stone-800 bg-stone-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
