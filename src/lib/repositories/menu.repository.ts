import { readJsonFile, writeJsonFile } from './json-storage';
import type { ShopMenu } from '@/types';

const FILENAME = 'menus.json';

export const menuRepository = {
  async findAll(): Promise<ShopMenu[]> {
    return readJsonFile<ShopMenu>(FILENAME);
  },

  async findById(id: string): Promise<ShopMenu | null> {
    const items = await readJsonFile<ShopMenu>(FILENAME);
    return items.find((item) => item.id === id) || null;
  },

  async findByShopId(shopId: string): Promise<ShopMenu | null> {
    const items = await readJsonFile<ShopMenu>(FILENAME);
    return items.find((item) => item.shopId === shopId) || null;
  },

  async create(data: ShopMenu): Promise<ShopMenu> {
    const items = await readJsonFile<ShopMenu>(FILENAME);
    items.push(data);
    await writeJsonFile(FILENAME, items);
    return data;
  },

  async update(shopId: string, data: Partial<ShopMenu>): Promise<ShopMenu> {
    const items = await readJsonFile<ShopMenu>(FILENAME);
    const index = items.findIndex((item) => item.shopId === shopId);

    if (index === -1) {
      // Create new menu if not exists
      const newMenu: ShopMenu = {
        id: crypto.randomUUID(),
        shopId,
        brandName: data.brandName || '',
        categories: data.categories || [],
        items: data.items || [],
        isPublished: data.isPublished || false,
      };
      items.push(newMenu);
      await writeJsonFile(FILENAME, items);
      return newMenu;
    }

    items[index] = { ...items[index], ...data };
    await writeJsonFile(FILENAME, items);
    return items[index];
  },

  async delete(shopId: string): Promise<void> {
    const items = await readJsonFile<ShopMenu>(FILENAME);
    const filtered = items.filter((item) => item.shopId !== shopId);
    await writeJsonFile(FILENAME, filtered);
  },
};
