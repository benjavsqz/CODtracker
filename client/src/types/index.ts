export interface User {
  id: number
  username: string
  email: string
}

export interface Loadout {
  id: number
  user_id: number
  name: string
  weapon_name: string
  category: string
  attachments: Record<string, string>
  cod_share_code: string
  notes: string
  is_public: boolean
  share_slug: string
  created_at: string
  updated_at: string
  username?: string
}

export interface WeaponMeta {
  weapon_name: string
  tier: 'S' | 'A' | 'B' | 'C'
  category: string
  pick_rate: number
  updated_at: string
}
