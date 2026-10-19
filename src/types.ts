export type CategoryId = 'all' | 'mains' | 'drinks' | 'desserts';

export interface Category {
  id: CategoryId;
  name: string;
  nameEn: string;
  icon: string;
}

export interface MenuItem {
  id: string;
  category: 'mains' | 'drinks' | 'desserts';
  categoryName: string;
  name: string;
  nameEn: string;
  price: number;
  calories: string;
  spiceLevel: number; // 0 = ไม่เผ็ด, 1 = เผ็ดน้อย, 2 = เผ็ดปานกลาง, 3 = รสจัดจ้าน
  isChefRecommended: boolean;
  isBestSeller: boolean;
  isAvailable?: boolean; // เปิด/ปิดการขายเมื่ออาหารหมด
  tags: string[];
  description: string;
  image: string;
  ingredients?: string[];
  servingSize?: string;
  sweetnessOptions?: string[];
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  spice?: string;
  sweetness?: string;
  note?: string;
}

export type DiningType = 'dine-in' | 'takeaway';

export interface ReservationData {
  name: string;
  phone: string;
  guests: number;
  date: string;
  time: string;
  zone: string;
  specialRequest?: string;
}

export type SubFilterType = 'all' | 'chef' | 'bestseller' | 'mild';

// --- Table & Authentication System Types ---

export interface TableSession {
  id: string;
  table_number: string;
  pin: string;
  status: 'active' | 'closed';
  opened_at: string;
  closed_at?: string;
}

export type OrderStatus = 'pending' | 'cooking' | 'ready' | 'served' | 'cancelled';
export type CallStaffType = 'calling' | 'bill' | null;

export interface OrderItemRecord {
  id: string;
  order_id: string;
  menu_item_id?: string;
  item_name: string;
  price: number;
  quantity: number;
  spice?: string;
  sweetness?: string;
  note?: string;
  created_at?: string;
}

export interface OrderRecord {
  id: string;
  session_id?: string;
  table_number: string;
  dining_type: DiningType;
  subtotal: number;
  vat: number;
  total_price: number;
  status: OrderStatus;
  call_staff_status?: CallStaffType;
  created_at: string;
  order_items?: OrderItemRecord[];
}
