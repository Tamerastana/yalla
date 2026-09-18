import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as registrationsApi from '../api/registrations'

export function useAllRegistrations() {
  return useQuery({ queryKey: ['registrations', 'all'], queryFn: registrationsApi.listAllRegistrations })
}

export function useEventRegistrations(eventId: string | undefined) {
  return useQuery({
    queryKey: ['registrations', 'event', eventId],
    queryFn: () => registrationsApi.listRegistrationsForEvent(eventId as string),
    enabled: !!eventId,
  })
}

export function useUserRegistrations(userId: string | undefined) {
  return useQuery({
    queryKey: ['registrations', 'user', userId],
    queryFn: () => registrationsApi.listRegistrationsForUser(userId as string),
    enabled: !!userId,
  })
}

export function useMyRegistration(userId: string | undefined, eventId: string | undefined) {
  return useQuery({
    queryKey: ['registrations', 'mine', userId, eventId],
    queryFn: () => registrationsApi.getMyRegistration(userId as string, eventId as string),
    enabled: !!userId && !!eventId,
  })
}

export function useRegisterForEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, eventId }: { userId: string; eventId: string }) =>
      registrationsApi.registerForEvent(userId, eventId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['registrations'] }),
  })
}

export function useCancelRegistration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (registrationId: string) => registrationsApi.cancelRegistration(registrationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['registrations'] }),
  })
}

export function useMarkAttended() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ registrationId }: { registrationId: string; userId: string }) =>
      registrationsApi.markAttended(registrationId),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      queryClient.invalidateQueries({ queryKey: ['points', userId] })
    },
  })
}
