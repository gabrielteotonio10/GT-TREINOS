import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nyzluqfoovsvbuedwswr.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55emx1cWZvb3ZzdmJ1ZWR3c3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzODk4NjEsImV4cCI6MjA4Nzk2NTg2MX0.7fYCfKceDU62D1pYSKpSHijYX7TFzLoa_RTaIr23buU";

export const supabase = createClient(supabaseUrl, supabaseKey);
