// Menu types

// Category (分類實體)
export interface Category {
  id: string;
  name: string;
  sortOrder?: number;
  isActive: boolean;
}

// Stock Management
export interface Stock {
  quantity: number;
  isAvailable: boolean;
  lowStockThreshold?: number;
}

// Time Slot
export interface TimeSlot {
  startTime: string;  // Format: "HH:mm"
  endTime: string;
  days?: number[];    // 0=Sunday, 6=Saturday
}

// Availability
export interface Availability {
  timeSlots?: TimeSlot[];
  isAlwaysAvailable?: boolean;
}

// SKU (子項目/規格)
export interface Sku {
  id: string;
  name: string;
  price?: number;
  image?: string;
  stock?: Stock;
  availability?: Availability;
}

// MenuItem (支援多分類、庫存、時段、SKU)
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  categoryIds: string[];
  image?: string;
  stock?: Stock;
  availability?: Availability;
  skus?: Sku[];
}

// ShopMenu (菜單主體)
export interface ShopMenu {
  id: string;
  shopId: string;
  brandName: string;
  categories: Category[];
  items: MenuItem[];
  isPublished: boolean;
}

// Shop types
export interface Shop {
  id: string;
  name: string;
  createdAt: number;
  ownerId: string;
}

export type CreateShopInput = Omit<Shop, 'id' | 'createdAt'>;
export type UpdateShopInput = Partial<Omit<Shop, 'id'>>;

// Reservation types
export type ReservationSource = '預訂' | '現場';
export type ReservationStatus = '待入座' | '已入座' | '已取消';

export interface Reservation {
  id: string;
  shopId: string;
  time: string;
  tableNo: string;
  phone: string;
  source: ReservationSource;
  status: ReservationStatus;
  checkInTime?: number;
}

export type CreateReservationInput = Omit<Reservation, 'id' | 'checkInTime'>;
export type UpdateReservationInput = Partial<Omit<Reservation, 'id' | 'shopId'>>;

// Table types
export interface Table {
  id: string;
  shopId: string;
  tableNo: string;
}

// Order types
export interface OrderItem {
  menuItemId: string;
  skuId?: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderAdjustment {
  id: string;
  name: string;
  type: 'discount' | 'surcharge';
  valueType: 'fixed' | 'percentage';
  value: number;
  amount: number;
}

export type OrderStatus = 'new' | 'served' | 'paid';

export interface Order {
  id: string;
  shopId: string;
  tableNo: string;
  items: OrderItem[];
  adjustments?: OrderAdjustment[];
  subtotal: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: number;
}

export type CreateOrderInput = Omit<Order, 'id' | 'createdAt' | 'status'>;
export type UpdateOrderInput = Partial<Pick<Order, 'status' | 'adjustments' | 'totalPrice'>>;

// Menu parsing types (for AI)
export interface ParsedMenuResult {
  brandName: string;
  categories: string[];
  items: Array<{
    name: string;
    price: number;
    category: string;
  }>;
}
