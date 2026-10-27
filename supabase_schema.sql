-- ====================================================================
-- MAEN DAM-DAMAN: Skema Database Supabase untuk Papan Peringkat Global
-- ====================================================================
-- Salin dan jalankan skrip SQL ini di menu "SQL Editor" pada Supabase Dashboard Anda.

-- 1. Buat Tabel player_rankings
CREATE TABLE IF NOT EXISTS public.player_rankings (
    player_id TEXT PRIMARY KEY,
    player_name TEXT NOT NULL,
    player_avatar TEXT NOT NULL DEFAULT 'pria-batik',
    total_points INTEGER NOT NULL DEFAULT 0,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    draws INTEGER NOT NULL DEFAULT 0,
    total_matches INTEGER NOT NULL DEFAULT 0,
    win_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    ai_easy_wins INTEGER NOT NULL DEFAULT 0,
    ai_medium_wins INTEGER NOT NULL DEFAULT 0,
    ai_hard_wins INTEGER NOT NULL DEFAULT 0,
    ai_master_wins INTEGER NOT NULL DEFAULT 0,
    pvp_wins INTEGER NOT NULL DEFAULT 0,
    online_wins INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Index untuk Performa Tinggi Pengurutan Peringkat Global
CREATE INDEX IF NOT EXISTS idx_player_rankings_points 
ON public.player_rankings (total_points DESC, wins DESC);

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE public.player_rankings ENABLE ROW LEVEL SECURITY;

-- 4. Kebijakan Keamanan (RLS Policies)
-- Izinkan semua pengguna melihat papan peringkat publik
DROP POLICY IF EXISTS "Public Read Leaderboard" ON public.player_rankings;
CREATE POLICY "Public Read Leaderboard" 
ON public.player_rankings 
FOR SELECT 
USING (true);

-- Izinkan pemain menambahkan dan memperbarui statistik profil mereka
DROP POLICY IF EXISTS "Public Upsert Leaderboard" ON public.player_rankings;
CREATE POLICY "Public Upsert Leaderboard" 
ON public.player_rankings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. Data Awal Juara Tradisional (Opsional untuk baseline awal)
INSERT INTO public.player_rankings (
    player_id, player_name, player_avatar, total_points, wins, losses, draws, total_matches, win_rate, ai_master_wins, pvp_wins
) VALUES 
('dam_master_001', 'Ki Ageng Dam', 'pak-haji', 45, 12, 1, 0, 13, 92.31, 7, 5),
('dam_master_002', 'Siti Kebaya', 'wanita-kebaya', 32, 9, 2, 1, 12, 75.00, 4, 6),
('dam_master_003', 'Pendekar Pasuruan', 'preman-pria-marah', 26, 8, 3, 0, 11, 72.73, 3, 5),
('dam_master_004', 'Budi Santoso', 'pria-batik', 18, 6, 2, 2, 10, 60.00, 2, 4),
('dam_master_005', 'Bu Haji Damdaman', 'bu-haji', 15, 5, 1, 0, 6, 83.33, 2, 3)
ON CONFLICT (player_id) DO NOTHING;
