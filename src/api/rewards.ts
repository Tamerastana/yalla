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

export type UpdateRewardInput = Partial<Omit<Reward, 'id' | 'companyId'>>

/** RLS allows this for the reward's own company or a super_admin. */
export async function updateReward(rewardId: string, input: UpdateRewardInput): Promise<Reward> {
  const row: Record<string, unknown> = {}
  if (input.title !== undefined) row.title = input.title
  if (input.description !== undefined) row.description = input.description
  if (input.costPoints !== undefined) row.cost_points = input.costPoints
  if (input.imageUrl !== undefined) row.image_url = input.imageUrl
  if (input.stock !== undefined) row.stock = input.stock
  if (input.active !== undefined) row.active = input.active

  const { data, error } = await supabase.from('rewards').update(row).eq('id', rewardId).select('*').maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error("You don't have permission to edit this reward.")
  return mapReward(data)
}

export async function deleteReward(rewardId: string): Promise<void> {
  const { data, error } = await supabase.from('rewards').delete().eq('id', rewardId).select('id').maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error("You don't have permission to delete this reward.")
}
