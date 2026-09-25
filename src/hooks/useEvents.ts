import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as eventsApi from '../api/events'

export function useEvents() {
  return useQuery({ queryKey: ['events'], queryFn: eventsApi.listEvents })
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => eventsApi.getEvent(id as string),
    enabled: !!id,
  })
}

export function useEventsByIds(ids: string[]) {
  const key = [...ids].sort().join(',')
  return useQuery({
    queryKey: ['events', 'byIds', key],
    queryFn: () => eventsApi.listEventsByIds(ids),
    enabled: ids.length > 0,
  })
}

export function useEventsByHost(hostId: string | undefined) {
  return useQuery({
    queryKey: ['events', 'byHost', hostId],
    queryFn: () => eventsApi.listEventsByHost(hostId as string),
    enabled: !!hostId,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: eventsApi.createEvent,
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', 'byHost', event.hostId] })
    },
  })
}

export function useUpdateEvent(eventId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: eventsApi.UpdateEventInput) => eventsApi.updateEvent(eventId, input),
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', eventId] })
      queryClient.invalidateQueries({ queryKey: ['events', 'byHost', event.hostId] })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) => eventsApi.deleteEvent(eventId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function usePromoteEvent(eventId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ tier, days }: { tier: 1 | 2 | 3; days?: number }) => eventsApi.promoteEvent(eventId, tier, days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', eventId] })
    },
  })
}
