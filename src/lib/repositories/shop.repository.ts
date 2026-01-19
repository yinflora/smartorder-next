import { createJsonRepository } from '@/lib/repositories/json-storage';
import type { Shop, CreateShopInput, UpdateShopInput } from '@/types';

export const shopRepository = createJsonRepository<Shop, CreateShopInput, UpdateShopInput>(
  'shops.json'
);
