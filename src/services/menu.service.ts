import { menuRepository, tableRepository } from '@/lib/repositories';
import type { ShopMenu, MenuItem, Table, Category, Sku, Stock, Availability } from '@/types';

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

  // Category Management (分類管理)
  async addCategory(shopId: string, category: Omit<Category, 'id'>): Promise<ShopMenu> {
    const menu = await menuRepository.findByShopId(shopId);
    if (!menu) {
      throw new Error('Menu not found');
    }

    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
    };

    return menuRepository.update(shopId, {
      categories: [...menu.categories, newCategory],
    });
  },

  async updateCategory(shopId: string, categoryId: string, updates: Partial<Category>): Promise<ShopMenu> {
    const menu = await menuRepository.findByShopId(shopId);
    if (!menu) {
      throw new Error('Menu not found');
    }

    const updatedCategories = menu.categories.map((cat) =>
      cat.id === categoryId ? { ...cat, ...updates } : cat
    );

    return menuRepository.update(shopId, {
      categories: updatedCategories,
    });
  },

  async removeCategory(shopId: string, categoryId: string): Promise<ShopMenu> {
    const menu = await menuRepository.findByShopId(shopId);
    if (!menu) {
      throw new Error('Menu not found');
    }

    // 移除分類並清理 MenuItem 中的關聯
    const updatedCategories = menu.categories.filter((cat) => cat.id !== categoryId);
    const updatedItems = menu.items.map((item) => ({
      ...item,
      categoryIds: item.categoryIds.filter((id) => id !== categoryId),
    }));

    return menuRepository.update(shopId, {
      categories: updatedCategories,
      items: updatedItems,
    });
  },

  async reorderCategories(shopId: string, categoryIds: string[]): Promise<ShopMenu> {
    const menu = await menuRepository.findByShopId(shopId);
    if (!menu) {
      throw new Error('Menu not found');
    }

    const categoryMap = new Map(menu.categories.map((cat) => [cat.id, cat]));
    const reorderedCategories = categoryIds
      .map((id, index) => {
        const cat = categoryMap.get(id);
        return cat ? { ...cat, sortOrder: index + 1 } : null;
      })
      .filter((cat): cat is Category => cat !== null);

    return menuRepository.update(shopId, {
      categories: reorderedCategories,
    });
  },

  // SKU Management (子項目管理)
  async addSku(shopId: string, menuItemId: string, sku: Omit<Sku, 'id'>): Promise<ShopMenu> {
    const menu = await menuRepository.findByShopId(shopId);
    if (!menu) {
      throw new Error('Menu not found');
    }

    const newSku: Sku = {
      ...sku,
      id: crypto.randomUUID(),
    };

    const updatedItems = menu.items.map((item) => {
      if (item.id === menuItemId) {
        return {
          ...item,
          skus: [...(item.skus || []), newSku],
        };
      }
      return item;
    });

    return menuRepository.update(shopId, { items: updatedItems });
  },

  async updateSku(shopId: string, menuItemId: string, skuId: string, updates: Partial<Sku>): Promise<ShopMenu> {
    const menu = await menuRepository.findByShopId(shopId);
    if (!menu) {
      throw new Error('Menu not found');
    }

    const updatedItems = menu.items.map((item) => {
      if (item.id === menuItemId) {
        return {
          ...item,
          skus: (item.skus || []).map((sku) =>
            sku.id === skuId ? { ...sku, ...updates } : sku
          ),
        };
      }
      return item;
    });

    return menuRepository.update(shopId, { items: updatedItems });
  },

  async removeSku(shopId: string, menuItemId: string, skuId: string): Promise<ShopMenu> {
    const menu = await menuRepository.findByShopId(shopId);
    if (!menu) {
      throw new Error('Menu not found');
    }

    const updatedItems = menu.items.map((item) => {
      if (item.id === menuItemId) {
        return {
          ...item,
          skus: (item.skus || []).filter((sku) => sku.id !== skuId),
        };
      }
      return item;
    });

    return menuRepository.update(shopId, { items: updatedItems });
  },

  // Stock Management (庫存管理)
  async updateMenuItemStock(shopId: string, menuItemId: string, stock: Stock): Promise<ShopMenu> {
    const menu = await menuRepository.findByShopId(shopId);
    if (!menu) {
      throw new Error('Menu not found');
    }

    const updatedItems = menu.items.map((item) =>
      item.id === menuItemId ? { ...item, stock } : item
    );

    return menuRepository.update(shopId, { items: updatedItems });
  },

  async updateSkuStock(shopId: string, menuItemId: string, skuId: string, stock: Stock): Promise<ShopMenu> {
    const menu = await menuRepository.findByShopId(shopId);
    if (!menu) {
      throw new Error('Menu not found');
    }

    const updatedItems = menu.items.map((item) => {
      if (item.id === menuItemId) {
        return {
          ...item,
          skus: (item.skus || []).map((sku) =>
            sku.id === skuId ? { ...sku, stock } : sku
          ),
        };
      }
      return item;
    });

    return menuRepository.update(shopId, { items: updatedItems });
  },

  // Availability Management (時段管理)
  async updateMenuItemAvailability(shopId: string, menuItemId: string, availability: Availability): Promise<ShopMenu> {
    const menu = await menuRepository.findByShopId(shopId);
    if (!menu) {
      throw new Error('Menu not found');
    }

    const updatedItems = menu.items.map((item) =>
      item.id === menuItemId ? { ...item, availability } : item
    );

    return menuRepository.update(shopId, { items: updatedItems });
  },

  async updateSkuAvailability(shopId: string, menuItemId: string, skuId: string, availability: Availability): Promise<ShopMenu> {
    const menu = await menuRepository.findByShopId(shopId);
    if (!menu) {
      throw new Error('Menu not found');
    }

    const updatedItems = menu.items.map((item) => {
      if (item.id === menuItemId) {
        return {
          ...item,
          skus: (item.skus || []).map((sku) =>
            sku.id === skuId ? { ...sku, availability } : sku
          ),
        };
      }
      return item;
    });

    return menuRepository.update(shopId, { items: updatedItems });
  },
};
