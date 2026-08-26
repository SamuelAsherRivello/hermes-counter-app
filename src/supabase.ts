import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://eaqenwlzvdppcurrxvhq.supabase.co'
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_jBbaT_4K1r9yBPmKYZe0jQ_KzHMWD8P'

export const supabase = createClient(supabaseUrl, supabasePublishableKey)
