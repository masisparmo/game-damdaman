/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Hero Avatars Definition & Metadata for Maen Dam-Daman.
 * Authentic Indonesian cultural characters.
 */

export interface Hero {
  id: string;
  nameId: string;
  nameEn: string;
  image: string;
}

export const HEROES_LIST: Hero[] = [
  { id: 'pria-batik', nameId: 'Pria Batik', nameEn: 'Gentleman Batik', image: '/heroes/pria-batik.png' },
  { id: 'wanita-kebaya', nameId: 'Wanita Kebaya', nameEn: 'Lady Kebaya', image: '/heroes/wanita-kebaya.png' },
  { id: 'pak-haji', nameId: 'Pak Haji', nameEn: 'Pak Haji', image: '/heroes/pak-haji.png' },
  { id: 'bu-haji', nameId: 'Bu Haji', nameEn: 'Bu Haji', image: '/heroes/bu-haji.png' },
  { id: 'petani-pria', nameId: 'Pak Tani', nameEn: 'Farmer', image: '/heroes/petani-pria.png' },
  { id: 'petani-wanita', nameId: 'Bu Tani', nameEn: 'Farm Woman', image: '/heroes/petani-wanita.png' },
  { id: 'petani-pria-muda', nameId: 'Petani Muda', nameEn: 'Young Farmer', image: '/heroes/petani-pria-muda.png' },
  { id: 'petani-wanita-muda', nameId: 'Petani Putri Muda', nameEn: 'Young Farm Lady', image: '/heroes/petani-wanita-muda.png' },
  { id: 'preman-pria-marah', nameId: 'Pendekar Pria', nameEn: 'Fierce Warrior', image: '/heroes/preman-pria-marah.png' },
  { id: 'preman-wanita-marah', nameId: 'Pendekar Wanita', nameEn: 'Fierce Lady', image: '/heroes/preman-wanita-marah.png' },
  { id: 'anak-laki-laki', nameId: 'Anak Laki-Laki', nameEn: 'Boy', image: '/heroes/anak-laki-laki.png' },
  { id: 'anak-perempuan', nameId: 'Anak Perempuan', nameEn: 'Girl', image: '/heroes/anak-perempuan.png' },
  { id: 'anak-pria', nameId: 'Bocah Laki', nameEn: 'Little Boy', image: '/heroes/anak-pria.png' },
  { id: 'anak-wanita', nameId: 'Bocah Perempuan', nameEn: 'Little Girl', image: '/heroes/anak-wanita.png' },
  { id: 'pria-dewasa', nameId: 'Pria Dewasa', nameEn: 'Adult Man', image: '/heroes/pria-dewasa.png' },
  { id: 'wanita-dewasa', nameId: 'Wanita Dewasa', nameEn: 'Adult Woman', image: '/heroes/wanita-dewasa.png' },
];

export const DEFAULT_HERO_ID = 'pria-batik';
export const DEFAULT_P2_HERO_ID = 'wanita-kebaya';

export function getHeroById(id?: string | null): Hero {
  if (!id) return HEROES_LIST[0];
  const found = HEROES_LIST.find((h) => h.id === id);
  return found || HEROES_LIST[0];
}
