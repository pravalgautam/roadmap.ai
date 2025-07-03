// supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = "https://xlsolmchsrszjuzivibs.supabase.co";

// const supabaseAnonKey =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsc29sbWNoc3Jzemp1eml2aWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MTAwNzksImV4cCI6MjA2NzA4NjA3OX0.qQ60k1-QFI3fuFJj-Ex39x9JfXI1JrRXWxEL465JAwo";



export const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);
