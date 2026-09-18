import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as pointsApi from '../api/points'

export function usePointsHistory(userId: string | undefined) {
  return useQuery({
    queryKey: ['points', userId],
    queryFn: () => pointsApi.listPointsForUser(userId as string),
    enabled: !!userId,
  })
}

export function useRedemptions(userId: string | undefined) {
  return useQuery({
    queryKey: ['redemptions', userId],
    queryFn: () => pointsApi.listRedemptionsForUser(userId as string),
    enabled: !!userId,
  })
}

export function useRedeemReward(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (rewardId: string) => pointsApi.redeemReward(rewardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points', userId] })
      queryClient.invalidateQueries({ queryKey: ['redemptions', userId] })
      queryClient.invalidateQueries({ queryKey: ['rewards'] })
    },
  })
}
