// Database types for your Supabase tables
export type Tables = {
  businesses: {
    id: string
    name: string
    owner_id: string
    address: string
    phone: string
    email: string
    website: string
    description: string
    logo_url: string
    created_at: string
    updated_at: string
  }
  
  users: {
    id: string
    email: string
    first_name: string
    last_name: string
    business_id: string | null
    role: 'admin' | 'manager' | 'staff'
    created_at: string
    updated_at: string
  }
  
  customers: {
    id: string
    business_id: string
    first_name: string
    last_name: string
    email: string
    phone: string
    address: string
    sign_up_date: string
    total_points: number
    birthday: string | null
    notes: string | null
    created_at: string
    updated_at: string
  }
  
  loyalty_programs: {
    id: string
    business_id: string
    name: string
    type: 'points' | 'punchcard' | 'tiered'
    description: string
    rules: {
      pointsPerDollar?: number
      punchesNeeded?: number
      tiers?: Array<{
        name: string
        threshold: number
        benefits: string[]
      }>
    }
    active: boolean
    start_date: string | null
    end_date: string | null
    created_at: string
    updated_at: string
  }
  
  transactions: {
    id: string
    business_id: string
    customer_id: string
    program_id: string | null
    amount: number
    points_earned: number
    date: string
    type: 'purchase' | 'refund' | 'reward_redemption'
    staff_id: string | null
    notes: string | null
    receipt_number: string | null
    created_at: string
    updated_at: string
  }
  
  rewards: {
    id: string
    business_id: string
    program_id: string
    name: string
    description: string
    points_required: number
    active: boolean
    created_at: string
    updated_at: string
  }
  
  loyalty_cards: {
    id: string
    business_id: string
    customer_id: string
    program_id: string
    points_balance: number
    punch_count: number | null
    tier: string | null
    issue_date: string
    expiry_date: string | null
    active: boolean
    created_at: string
    updated_at: string
  }
  
  settings: {
    id: string
    business_id: string
    category: string
    settings_data: Record<string, any>
    created_at: string
    updated_at: string
  }
} 