import { supabase } from './supabaseClient'

export interface EmailSubscriptionData {
  email: string
  source: string
  ip_address?: string
  user_agent?: string
}

export async function subscribeEmail(data: EmailSubscriptionData) {
  try {
    const { error } = await supabase
      .from('email_subscriptions')
      .insert([{
        email: data.email.toLowerCase().trim(),
        source: data.source,
        ip_address: data.ip_address,
        user_agent: data.user_agent
      }])

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return { success: true, message: 'You\'re already subscribed!' }
      }
      throw error
    }

    return { success: true, message: 'Thanks for subscribing!' }
  } catch (error) {
    console.error('Error subscribing email:', error)
    return { 
      success: false, 
      message: 'Something went wrong. Please try again.' 
    }
  }
}
