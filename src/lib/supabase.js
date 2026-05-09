import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tfvnjxuanrodvkwrrpvi.supabase.co'
const supabaseAnonKey = 'sb_publishable_W7X-HVlq44UYPqx_TrNWAA_mDyxFFHk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
