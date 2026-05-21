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
  secondary_weapon: string | null
  secondary_category: string | null
  secondary_attachments: Record<string, string> | null
  tactical: string | null
  lethal: string | null
  perk1: string | null
  perk2: string | null
  perk3: string | null
  melee: string | null
  cod_share_code: string
  notes: string
  is_public: boolean
  share_slug: string
  created_at: string
  updated_at: string
  username?: string
}

export interface Equipment {
  id: number
  name: string
  category: 'tactical' | 'lethal' | 'melee'
  tier: string
  description: string
  image_url: string | null
}

export interface WeaponMeta {
  weapon_name: string
  tier: 'S' | 'A' | 'B' | 'C'
  category: string
  pick_rate: number
  updated_at: string
}
