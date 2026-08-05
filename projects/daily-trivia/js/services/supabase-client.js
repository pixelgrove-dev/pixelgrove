/**
 * Creates the shared Supabase browser client.
 *
 * The publishable key is designed for frontend use when database
 * access is protected by Row Level Security.
 */

const SUPABASE_URL =
    "https://iotaaicmtejiapogkxuu.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_AL9Bhf5f41iEm8hCmdeq8g_TxBm3HiK";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );