import { createClient } from '@supabase/supabase-js'
import type { SplitInput } from './splitLogic'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Add debug logging for environment variables
console.log('Supabase URL exists:', !!supabaseUrl)
console.log('Supabase Anon Key exists:', !!supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    envKeys: Object.keys(import.meta.env),
  })
  throw new Error('Missing Supabase environment variables')
}

// Initialize the Supabase client with improved options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: (...args) => {
      console.log('Supabase API Call:', args[0])
      return fetch(...args)
    }
  }
})

export interface AnonymousSplit {
  id: string
  people: { name: string }[]
  items: {
    name: string
    price: number
    assigned: string[]
  }[]
  tax_amount: number
  service_amount: number
  discount: number
  discount_type: 'percent' | 'amount'
  currency: string
  password?: string
  vendor_name?: string
  bill_date?: string
  created_at: string
}

/**
 * Save an anonymous split to Supabase
 */
export const saveAnonymousSplit = async (split: SplitInput & { password?: string }): Promise<string> => {
  const { data, error } = await supabase
    .from('anonymous_splits')
    .insert([
      {
        people: split.people,
        items: split.items,
        tax_amount: split.taxAmount,
        service_amount: split.serviceAmount,
        discount: split.discount,
        discount_type: split.discountType,
        currency: split.currency,
        vendor_name: split.vendorName || null,
        bill_date: split.billDate ? split.billDate : null,
      },
    ])
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to save split: ${error.message}`)
  }

  return data.id
}

/**
 * Update an existing anonymous split in Supabase
 */
export const updateAnonymousSplit = async (id: string, split: SplitInput & { password?: string }): Promise<void> => {
  const { error } = await supabase
    .from('anonymous_splits')
    .update({
      people: split.people,
      items: split.items,
      tax_amount: split.taxAmount,
      service_amount: split.serviceAmount,
      discount: split.discount,
      discount_type: split.discountType,
      currency: split.currency,
      vendor_name: split.vendorName || null,
      bill_date: split.billDate || null,
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update split: ${error.message}`);
  }
}

/**
 * Get an anonymous split by ID
 */
export const getAnonymousSplit = async (id: string): Promise<AnonymousSplit> => {
  const { data, error } = await supabase
    .from('anonymous_splits')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to get split: ${error.message}`)
  }

  return data
}

// Enhanced health check function
export const checkSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...')
    const start = performance.now()
    
    const { data, error } = await supabase
      .from('anonymous_splits')
      .select('id')
      .limit(1)
    
    const duration = performance.now() - start
    
    if (error) {
      console.error('Supabase connection test failed:', {
        error,
        duration: `${duration.toFixed(2)}ms`,
        url: supabaseUrl
      })
      return false
    }
    
    console.log('Supabase connection test succeeded:', {
      duration: `${duration.toFixed(2)}ms`,
      hasData: !!data,
      url: supabaseUrl
    })
    return true
  } catch (err) {
    console.error('Failed to connect to Supabase:', {
      error: err,
      url: supabaseUrl,
      stack: err instanceof Error ? err.stack : undefined
    })
    return false
  }
}