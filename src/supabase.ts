import { createClient } from "@supabase/supabase-js"

// Publishable key: safe to ship in the browser. Access is enforced by the
// row-level security policies in supabase/setup.sql.
const SUPABASE_URL = "https://ykmdhdboduzorztycvtr.supabase.co"
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_JoEwzNbCZAMBEihHDvnZcQ_DeTebzNr"

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

export const PHOTO_BUCKET = "listing-photos"
