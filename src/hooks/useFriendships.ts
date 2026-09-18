import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as friendshipsApi from '../api/friendships'

export function useFriendships(userId: string | undefined) {
  return useQuery({
    queryKey: ['friendships', userId],
    queryFn: () => friendshipsApi.listFriendshipsForUser(userId as string),
    enabled: !!userId,
  })
}

export function useSendFriendRequest(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (addresseeId: string) => friendshipsApi.sendFriendRequest(userId as string, addresseeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friendships', userId] }),
  })
}

export function useRespondToFriendRequest(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ friendshipId, accept }: { friendshipId: string; accept: boolean }) =>
      friendshipsApi.respondToFriendRequest(friendshipId, accept),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friendships', userId] }),
  })
}

export function useRemoveFriendship(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (friendshipId: string) => friendshipsApi.removeFriendship(friendshipId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friendships', userId] }),
  })
}
