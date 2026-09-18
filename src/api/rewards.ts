import { supabase } from '../lib/supabaseClient'
import { mapReward } from './mappers'
import type { Reward } from '../types'

export async function listActiveRewards(): Promise<Reward[]> {
  const { data, error } = await supabase.from('rewards').select('*').eq('active', true).gt('stock', 0)
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapReward)
}

export async function listRewardsByCompany(companyId: string): Promise<Reward[]> {
  const { data, error } = await supabase.from('rewards').select('*').eq('company_id', companyId)
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapReward)
}

export async function createReward(input: Omit<Reward, 'id'>): Promise<Reward> {
  const { data, error } = await supabase
    .from('rewards')
    .insert({
      company_id: input.companyId,
      title: input.title,
      description: input.description,
      cost_points: input.costPoints,
      image_url: input.imageUrl,
      stock: input.stock,
      active: input.active,
    })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return mapReward(data)
}
