import { createClient } from '@supabase/supabase-js'
import type { SplitInput } from './splitLogic'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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