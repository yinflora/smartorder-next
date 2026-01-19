import { readJsonFile, writeJsonFile } from '@/lib/repositories/json-storage';
import type { Table } from '@/types';

const FILENAME = 'tables.json';

export const tableRepository = {
  async findAll(): Promise<Table[]> {
    return readJsonFile<Table>(FILENAME);
  },

  async findByShopId(shopId: string): Promise<Table[]> {
    const items = await readJsonFile<Table>(FILENAME);
    return items.filter((item) => item.shopId === shopId);
  },

  async updateByShopId(shopId: string, tables: string[]): Promise<Table[]> {
    const allTables = await readJsonFile<Table>(FILENAME);

    // Remove existing tables for this shop
    const otherTables = allTables.filter((t) => t.shopId !== shopId);

    // Create new tables
    const newTables: Table[] = tables.map((tableNo) => ({
      id: crypto.randomUUID(),
      shopId,
      tableNo,
    }));

    const updated = [...otherTables, ...newTables];
    await writeJsonFile(FILENAME, updated);

    return newTables;
  },

  async deleteByShopId(shopId: string): Promise<void> {
    const allTables = await readJsonFile<Table>(FILENAME);
    const filtered = allTables.filter((t) => t.shopId !== shopId);
    await writeJsonFile(FILENAME, filtered);
  },
};
