import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side only — uses the service role key (never expose to client)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const SCREENSHOTS_BUCKET = "screenshots";

export function getScreenshotUrl(path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${SCREENSHOTS_BUCKET}/${path}`;
}
