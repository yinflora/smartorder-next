import { shopRepository, menuRepository, tableRepository } from '@/lib/repositories';
import type { Shop, CreateShopInput, UpdateShopInput } from '@/types';

export const shopService = {
  async getAll(): Promise<Shop[]> {
    return shopRepository.findAll();
  },

  async getById(id: string): Promise<Shop | null> {
    return shopRepository.findById(id);
  },

  async create(input: CreateShopInput): Promise<Shop> {
    const shop: Shop = {
      id: crypto.randomUUID(),
      name: input.name,
      ownerId: input.ownerId,
      createdAt: Date.now(),
    };
    return shopRepository.create(shop as CreateShopInput & { id: string });
  },

  async update(id: string, input: UpdateShopInput): Promise<Shop> {
    return shopRepository.update(id, input);
  },

  async delete(id: string): Promise<void> {
    // Delete related data
    await menuRepository.delete(id);
    await tableRepository.deleteByShopId(id);
    await shopRepository.delete(id);
  },
};
