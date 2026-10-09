import 'server-only';

// Privileged reads must be unreachable from Client Components. The shared
// client remains available for browser Auth and ownership-protected data.
export { supabaseAdmin } from './supabase';
