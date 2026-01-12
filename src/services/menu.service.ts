import { menuRepository, tableRepository } from '@/lib/repositories';
import type { ShopMenu, MenuItem, Table } from '@/types';

export const menuService = {
  async getByShopId(shopId: string): Promise<ShopMenu | null> {
    return menuRepository.findByShopId(shopId);
  },

  async update(shopId: string, data: Partial<ShopMenu>): Promise<ShopMenu> {
    return menuRepository.update(shopId, data);
  },

  async publish(shopId: string): Promise<ShopMenu> {
    return menuRepository.update(shopId, { isPublished: true });
  },

  async unpublish(shopId: string): Promise<ShopMenu> {
    return menuRepository.update(shopId, { isPublished: false });
  },

  async addMenuItem(shopId: string, item: Omit<MenuItem, 'id'>): Promise<ShopMenu> {
    const menu = await menuRepository.findByShopId(shopId);
    if (!menu) {
      throw new Error('Menu not found');
    }

    const newItem: MenuItem = {
      ...item,
      id: crypto.randomUUID(),
    };

    return menuRepository.update(shopId, {
      items: [...menu.items, newItem],
    });
  },

  async removeMenuItem(shopId: string, itemId: string): Promise<ShopMenu> {
    const menu = await menuRepository.findByShopId(shopId);
    if (!menu) {
      throw new Error('Menu not found');
    }

    return menuRepository.update(shopId, {
      items: menu.items.filter((item) => item.id !== itemId),
    });
  },

  async getTablesByShopId(shopId: string): Promise<Table[]> {
    return tableRepository.findByShopId(shopId);
  },

  async updateTables(shopId: string, tables: string[]): Promise<Table[]> {
    return tableRepository.updateByShopId(shopId, tables);
  },
};
