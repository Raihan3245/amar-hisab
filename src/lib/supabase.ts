import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hkaxwspqnerrjpuykgbl.supabase.co";

const supabasePublishableKey =
  "sb_publishable_vhV6mGvJ_lOIsFF6zdU7tQ_nXLzN7CS";

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);