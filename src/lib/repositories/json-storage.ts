import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Ensure data directory exists
 */
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * Read JSON file, return empty array if not exists
 */
export async function readJsonFile<T>(filename: string): Promise<T[]> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

/**
 * Write data to JSON file
 */
export async function writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Create a generic JSON repository
 */
export function createJsonRepository<T extends { id: string }, CreateInput, UpdateInput>(
  filename: string
) {
  return {
    async findAll(): Promise<T[]> {
      return readJsonFile<T>(filename);
    },

    async findById(id: string): Promise<T | null> {
      const items = await readJsonFile<T>(filename);
      return items.find((item) => item.id === id) || null;
    },

    async findByField<K extends keyof T>(field: K, value: T[K]): Promise<T[]> {
      const items = await readJsonFile<T>(filename);
      return items.filter((item) => item[field] === value);
    },

    async create(data: CreateInput & { id: string }): Promise<T> {
      const items = await readJsonFile<T>(filename);
      const newItem = data as unknown as T;
      items.push(newItem);
      await writeJsonFile(filename, items);
      return newItem;
    },

    async update(id: string, data: UpdateInput): Promise<T> {
      const items = await readJsonFile<T>(filename);
      const index = items.findIndex((item) => item.id === id);

      if (index === -1) {
        throw new Error(`Item with id ${id} not found`);
      }

      items[index] = { ...items[index], ...data };
      await writeJsonFile(filename, items);
      return items[index];
    },

    async delete(id: string): Promise<void> {
      const items = await readJsonFile<T>(filename);
      const filtered = items.filter((item) => item.id !== id);
      await writeJsonFile(filename, filtered);
    },
  };
}
