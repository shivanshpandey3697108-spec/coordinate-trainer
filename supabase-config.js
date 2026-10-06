// Coordinate Trainer Supabase configuration
// Replace the two placeholder values with your Supabase Project URL and
// Publishable/anon client key. Never put a service_role/secret key here.
export const SUPABASE_URL = "https://bzkvcuyumderwjohqtss.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_wFOfHI2tH7fcd6Pa5fkaKg_-8Nhllp0";

export const SUPABASE_CONFIGURED =
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("YOUR_") &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_ANON_KEY.includes("YOUR_");
