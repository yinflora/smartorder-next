import { createJsonRepository } from './json-storage';
import type { Shop, CreateShopInput, UpdateShopInput } from '@/types';

export const shopRepository = createJsonRepository<Shop, CreateShopInput, UpdateShopInput>(
  'shops.json'
);
