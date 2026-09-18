import { supabase } from '../lib/supabaseClient'
import { mapFriendship } from './mappers'
import type { Friendship } from '../types'

export async function listFriendshipsForUser(userId: string): Promise<Friendship[]> {
  const { data, error } = await supabase
    .from('friendships')
    .select('*')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapFriendship)
}

export async function sendFriendRequest(requesterId: string, addresseeId: string): Promise<void> {
  const { error } = await supabase.from('friendships').insert({ requester_id: requesterId, addressee_id: addresseeId })
  if (error) {
    if (error.code === '23505') throw new Error('A friend request already exists.')
    throw new Error(error.message)
  }
}

export async function respondToFriendRequest(friendshipId: string, accept: boolean): Promise<void> {
  const { error } = await supabase
    .from('friendships')
    .update({ status: accept ? 'accepted' : 'declined' })
    .eq('id', friendshipId)
  if (error) throw new Error(error.message)
}

export async function removeFriendship(friendshipId: string): Promise<void> {
  const { error } = await supabase.from('friendships').delete().eq('id', friendshipId)
  if (error) throw new Error(error.message)
}
