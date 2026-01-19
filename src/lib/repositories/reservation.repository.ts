import { createJsonRepository } from '@/lib/repositories/json-storage';
import type { Reservation, CreateReservationInput, UpdateReservationInput } from '@/types';

const baseRepository = createJsonRepository<
  Reservation,
  CreateReservationInput,
  UpdateReservationInput
>('reservations.json');

export const reservationRepository = {
  ...baseRepository,

  async findByShopId(shopId: string): Promise<Reservation[]> {
    return baseRepository.findByField('shopId', shopId);
  },

  async findByStatus(status: Reservation['status']): Promise<Reservation[]> {
    return baseRepository.findByField('status', status);
  },
};
