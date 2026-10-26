/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Supabase client configuration for Maen Dam-Daman Global Collective Brain.
 */

import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://woyxofrscgxijcknuwqo.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndveXhvZnJzY2d4aWpja251d3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5OTkwNzgsImV4cCI6MjEwODU3NTA3OH0.eR_c6YR4YVDfAd1SeO3prqDjs-LtPeBKakmTjynacaY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
