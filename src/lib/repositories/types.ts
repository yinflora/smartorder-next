/**
 * Generic Repository Interface
 * Abstracts data access layer for easy database switching
 */
export interface Repository<T, CreateInput, UpdateInput> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  findByField<K extends keyof T>(field: K, value: T[K]): Promise<T[]>;
  create(data: CreateInput): Promise<T>;
  update(id: string, data: UpdateInput): Promise<T>;
  delete(id: string): Promise<void>;
}
