import { reservationRepository } from '@/lib/repositories';
import type { Reservation, CreateReservationInput, ReservationStatus } from '@/types';

export const reservationService = {
  async getAll(): Promise<Reservation[]> {
    return reservationRepository.findAll();
  },

  async getById(id: string): Promise<Reservation | null> {
    return reservationRepository.findById(id);
  },

  async getByShopId(shopId: string): Promise<Reservation[]> {
    return reservationRepository.findByShopId(shopId);
  },

  async create(input: CreateReservationInput): Promise<Reservation> {
    const reservation: Reservation = {
      id: crypto.randomUUID(),
      ...input,
    };
    return reservationRepository.create(
      reservation as CreateReservationInput & { id: string }
    );
  },

  async updateStatus(id: string, status: ReservationStatus): Promise<Reservation> {
    const updateData: Partial<Reservation> = { status };

    // Add check-in time when status changes to 已入座
    if (status === '已入座') {
      updateData.checkInTime = Date.now();
    }

    return reservationRepository.update(id, updateData);
  },

  async checkIn(id: string): Promise<Reservation> {
    return this.updateStatus(id, '已入座');
  },

  async cancel(id: string): Promise<Reservation> {
    return this.updateStatus(id, '已取消');
  },
};
