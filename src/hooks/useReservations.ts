import useSWR from 'swr';
import { apiClient } from '@/lib/api/client';
import type {
  Reservation,
  CreateReservationInput,
  UpdateReservationInput,
  ReservationStatus,
} from '@/types';

const RESERVATIONS_KEY = '/api/reservations';

/**
 * Hook for managing reservations with optimistic updates
 * @remarks Reserved for future client-side reservation management (e.g., ReservationList refactor)
 */
export function useReservations(shopId: string | null) {
  const key = shopId ? `${RESERVATIONS_KEY}?shopId=${shopId}` : null;

  const { data, error, isLoading, mutate } = useSWR<Reservation[]>(
    key,
    () => apiClient.get<Reservation[]>(RESERVATIONS_KEY, { params: { shopId: shopId! } }),
    {
      // Enable auto-refresh every 5 seconds for reservation list
      refreshInterval: 5000,
      revalidateOnMount: true,
    }
  );

  const createReservation = async (input: CreateReservationInput) => {
    const newReservation = await apiClient.post<Reservation>(RESERVATIONS_KEY, input);
    mutate();
    return newReservation;
  };

  // Optimistic update for status changes
  const updateReservationStatus = async (reservationId: string, status: ReservationStatus) => {
    const optimisticData = data?.map((reservation) =>
      reservation.id === reservationId
        ? {
            ...reservation,
            status,
            checkInTime: status === '已入座' ? Date.now() : reservation.checkInTime,
          }
        : reservation
    );

    await mutate(
      async () => {
        await apiClient.patch<Reservation>(`${RESERVATIONS_KEY}/${reservationId}`, { status });
        return optimisticData;
      },
      {
        optimisticData,
        rollbackOnError: true,
        revalidate: false,
      }
    );
  };

  const updateReservation = async (reservationId: string, input: UpdateReservationInput) => {
    if (input.status && Object.keys(input).length === 1) {
      return updateReservationStatus(reservationId, input.status);
    }
    const updated = await apiClient.patch<Reservation>(
      `${RESERVATIONS_KEY}/${reservationId}`,
      input
    );
    mutate();
    return updated;
  };

  // Optimistic delete
  const deleteReservation = async (reservationId: string) => {
    const optimisticData = data?.filter((r) => r.id !== reservationId);

    await mutate(
      async () => {
        await apiClient.delete(`${RESERVATIONS_KEY}/${reservationId}`);
        return optimisticData;
      },
      {
        optimisticData,
        rollbackOnError: true,
        revalidate: false,
      }
    );
  };

  return {
    reservations: data ?? [],
    isLoading,
    error,
    mutate,
    createReservation,
    updateReservation,
    updateReservationStatus,
    deleteReservation,
  };
}
