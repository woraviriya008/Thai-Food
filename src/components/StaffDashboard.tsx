import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, LogOut, LayoutDashboard, UtensilsCrossed, ChefHat, 
  Bell, RefreshCw, Plus, KeyRound, 
  Edit3, Eye, EyeOff
} from 'lucide-react';
import { supabase } from '../api';
import { MenuItem, TableSession, OrderRecord, OrderStatus } from '../types';

interface StaffDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  staffEmail: string;
  onLogout: () => void;
  onMenuUpdated: () => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  isOpen,
  onClose,
  staffEmail,
  onLogout,
  onMenuUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'tables' | 'menu'>('orders');
  
  // States for Orders
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // States for Tables
  const [tableSessions, setTableSessions] = useState<TableSession[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);

  // States for Menu
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);

  // Quick state for editing dish price
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);

  // 1. Fetch Orders from all tables
  const fetchOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      setOrders((data as OrderRecord[]) || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // 2. Fetch Active Table Sessions
  const fetchTableSessions = useCallback(async () => {
    try {
      setTablesLoading(true);
      const { data, error } = await supabase
        .from('table_sessions')
        .select('*')
        .eq('status', 'active')
        .order('table_number', { ascending: true });

      if (error) throw error;
      setTableSessions((data as TableSession[]) || []);
    } catch (err) {
      console.error('Error fetching table sessions:', err);
    } finally {
      setTablesLoading(false);
    }
  }, []);

  // 3. Fetch Menu Items
  const fetchMenuItems = useCallback(async () => {
    try {
      setMenuLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      if (data) {
        setMenuItems(data.map(item => ({
          id: item.id,
          category: item.category_id,
          categoryName: item.category_name,
          name: item.name,
          nameEn: item.name_en,
          price: Number(item.price),
          calories: item.calories || '',
          spiceLevel: item.spice_level ?? 0,
          isChefRecommended: Boolean(item.is_chef_recommended),
          isBestSeller: Boolean(item.is_best_seller),
          isAvailable: item.is_available ?? true,
          tags: item.tags || [],
          description: item.description || '',
          image: item.image || '',
        })));
      }
    } catch (err) {
      console.error('Error fetching menu items:', err);
    } finally {
      setMenuLoading(false);
    }
  }, []);

  // Load data when opened or tab changed
  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'tables') fetchTableSessions();
      if (activeTab === 'menu') fetchMenuItems();

      // Polling for live kitchen orders every 6 seconds
      const timer = setInterval(() => {
        if (activeTab === 'orders') fetchOrders();
        if (activeTab === 'tables') fetchTableSessions();
      }, 6000);

      return () => clearInterval(timer);
    }
  }, [isOpen, activeTab, fetchOrders, fetchTableSessions, fetchMenuItems]);

  if (!isOpen) return null;

  // --- Handlers for Kitchen Orders ---
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDismissCallStaff = async (orderId: string) => {
    try {
      await supabase
        .from('orders')
        .update({ call_staff_status: null })
        .eq('id', orderId);

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, call_staff_status: null } : o));
    } catch (err) {
      console.error('Failed to dismiss call:', err);
    }
  };

  // --- Handlers for Table Sessions ---
  const handleOpenTable = async (tableNum: string) => {
    // Generate random 4-digit PIN
    const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();

    try {
      const { data, error } = await supabase
        .from('table_sessions')
        .insert({
          table_number: tableNum,
          pin: generatedPin,
          status: 'active',
          opened_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setTableSessions(prev => [...prev, data as TableSession]);
      }
    } catch (err) {
      console.error('Failed to open table:', err);
      alert('ไม่สามารถเปิดโต๊ะได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleCloseTable = async (sessionId: string) => {
    if (!window.confirm('ยืนยันการเช็กบิลและปิดรอบโต๊ะนี้ใช่หรือไม่? (PIN จะหมดอายุทันที)')) return;

    try {
      await supabase
        .from('table_sessions')
        .update({ status: 'closed', closed_at: new Date().toISOString() })
        .eq('id', sessionId);

      setTableSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err) {
      console.error('Failed to close table:', err);
    }
  };

  // --- Handlers for Menu Management ---
  const handleToggleDishAvailability = async (item: MenuItem) => {
    const newStatus = !item.isAvailable;
    try {
      await supabase
        .from('menu_items')
        .update({ is_available: newStatus })
        .eq('id', item.id);

      setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, isAvailable: newStatus } : m));
      onMenuUpdated();
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const handleSavePrice = async (itemId: string) => {
    try {
      await supabase
        .from('menu_items')
        .update({ price: editingPrice })
        .eq('id', itemId);

      setMenuItems(prev => prev.map(m => m.id === itemId ? { ...m, price: editingPrice } : m));
      setEditingDishId(null);
      onMenuUpdated();
    } catch (err) {
      console.error('Failed to update price:', err);
    }
  };

  const allTableNumbers = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="w-full max-w-4xl bg-[#FAF8F5] h-full shadow-2xl flex flex-col border-l border-stone-200 animate-slide-drawer">
        
        {/* Top Staff Navigation Header */}
        <div className="p-4 sm:p-5 bg-[#1E1B18] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#BC4720] text-white flex items-center justify-center font-bold">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-thai text-lg font-bold">แดชบอร์ดพนักงาน</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Staff Verified
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-light">{staffEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-800 hover:bg-red-900/40 text-stone-300 hover:text-red-300 text-xs transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 bg-white border-b border-stone-200 flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'orders' ? 'border-[#BC4720] text-[#BC4720]' : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>ออเดอร์ในครัว ({orders.filter(o => o.status !== 'served').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tables')}
            className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'tables' ? 'border-[#BC4720] text-[#BC4720]' : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>เปิดโต๊ะ & จัดการ PIN ({tableSessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'menu' ? 'border-[#BC4720] text-[#BC4720]' : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>จัดการเมนู & สต็อกอาหาร</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ================= TAB 1: KITCHEN ORDERS ================= */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#1E1B18] font-serif-thai">
                  รายการออเดอร์สดทั้งหมดจากทุกโต๊ะ
                </h4>
                <button
                  onClick={fetchOrders}
                  disabled={ordersLoading}
                  className="p-1.5 text-stone-500 hover:text-stone-800 rounded-full hover:bg-stone-200"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Call Staff Emergency Alerts */}
              {orders.filter(o => o.call_staff_status).map(o => (
                <div key={`alert-${o.id}`} className="p-3.5 bg-red-50 border border-red-300 rounded-2xl flex items-center justify-between gap-3 animate-pulse">
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-5 h-5 text-red-600 animate-bounce" />
                    <div>
                      <span className="font-bold text-red-900 text-xs">
                        {o.call_staff_status === 'bill' ? '⚠️ ลูกค้าขอเช็กบิล' : '🔔 ลูกค้าเรียกพนักงาน'}
                      </span>
                      <span className="text-xs text-red-700 ml-2">โต๊ะ {o.table_number}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismissCallStaff(o.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold rounded-full cursor-pointer"
                  >
                    รับเรื่องแล้ว
                  </button>
                </div>
              ))}

              {orders.length === 0 ? (
                <div className="py-20 text-center text-stone-400 text-xs">
                  ยังไม่มีออเดอร์ใหม่เข้ามาในระบบ
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orders.map((ord) => (
                    <div key={ord.id} className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-stone-900 text-white font-bold text-xs">
                            โต๊ะ {ord.table_number}
                          </span>
                          <span className="text-[11px] text-stone-400">
                            {new Date(ord.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#BC4720]">฿{Number(ord.total_price).toLocaleString()}</span>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5">
                        {ord.order_items?.map((it) => (
                          <div key={it.id} className="text-xs flex justify-between items-start">
                            <div>
                              <span className="font-semibold text-stone-800">{it.item_name}</span>
                              <span className="text-stone-500 font-mono ml-1.5 font-bold">x{it.quantity}</span>
                              <div className="text-[10px] text-stone-400">
                                {it.spice && <span className="text-red-600 mr-1">[{it.spice}]</span>}
                                {it.sweetness && <span className="text-emerald-700 mr-1">[{it.sweetness}]</span>}
                                {it.note && <span className="italic">"{it.note}"</span>}
                              </div>
                            </div>
                            <span className="text-stone-700 font-mono text-[11px]">฿{Number(it.price) * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Status Change Action Buttons */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1">
                        <span className="text-[10px] text-stone-400 font-medium">ปรับสถานะ:</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'pending')}
                            className={`px-2 py-1 rounded-md text-[10px] font-semibold cursor-pointer ${
                              ord.status === 'pending' ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                          >
                            รับแล้ว
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'cooking')}
                            className={`px-2 py-1 rounded-md text-[10px] font-semibold cursor-pointer ${
                              ord.status === 'cooking' ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                          >
                            กำลังปรุง
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'ready')}
                            className={`px-2 py-1 rounded-md text-[10px] font-semibold cursor-pointer ${
                              ord.status === 'ready' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                          >
                            พร้อมเสิร์ฟ
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'served')}
                            className={`px-2 py-1 rounded-md text-[10px] font-semibold cursor-pointer ${
                              ord.status === 'served' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                          >
                            เสิร์ฟแล้ว
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: TABLE SESSIONS & PIN ================= */}
          {activeTab === 'tables' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#1E1B18] font-serif-thai">
                    สถานะโต๊ะและรหัส PIN ประจำโต๊ะ
                  </h4>
                  <p className="text-xs text-stone-500 font-light">
                    เมื่อลูกค้ามาถึงร้าน ให้กด "เปิดโต๊ะ" เพื่อสุ่มรหัส PIN 4 หลัก แล้วส่งให้ลูกค้ากรอกในมือถือ
                  </p>
                </div>
                <button
                  onClick={fetchTableSessions}
                  disabled={tablesLoading}
                  className="p-1.5 text-stone-500 hover:text-stone-800 rounded-full hover:bg-stone-200"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${tablesLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Tables Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {allTableNumbers.map((tNum) => {
                  const activeSession = tableSessions.find(s => s.table_number === tNum);
                  const isOpenTable = Boolean(activeSession);

                  return (
                    <div
                      key={tNum}
                      className={`p-4 rounded-2xl border transition-all ${
                        isOpenTable
                          ? 'bg-white border-emerald-300 shadow-sm'
                          : 'bg-stone-50 border-stone-200/80 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                        <span className="font-bold text-sm text-stone-900">โต๊ะ {tNum}</span>
                        <span className={`w-2 h-2 rounded-full ${isOpenTable ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`}></span>
                      </div>

                      {isOpenTable && activeSession ? (
                        <div className="py-2.5 text-center space-y-1">
                          <span className="text-[10px] text-stone-400 block uppercase">รหัส PIN โต๊ะ</span>
                          <span className="text-2xl font-mono font-bold tracking-widest text-[#BC4720]">
                            {activeSession.pin}
                          </span>
                          <span className="text-[10px] text-stone-400 block">
                            เปิดเมื่อ {new Date(activeSession.opened_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                          </span>
                          <button
                            onClick={() => handleCloseTable(activeSession.id)}
                            className="w-full mt-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                          >
                            เช็กบิล & ปิดโต๊ะ
                          </button>
                        </div>
                      ) : (
                        <div className="py-5 text-center space-y-2">
                          <span className="text-xs text-stone-400 block font-light">โต๊ะว่าง</span>
                          <button
                            onClick={() => handleOpenTable(tNum)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1E1B18] hover:bg-[#BC4720] text-white text-xs font-medium rounded-xl transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>เปิดโต๊ะ & สุ่ม PIN</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 3: MENU & STOCK MANAGEMENT ================= */}
          {activeTab === 'menu' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#1E1B18] font-serif-thai">
                    จัดการรายการอาหาร & สวิตช์ปิดการขาย (อาหารหมด)
                  </h4>
                  <p className="text-xs text-stone-500 font-light">
                    หากวัตถุดิบหมด สามารถสลับสวิตช์เพื่อปิดการขายชั่วคราวได้ทันที
                  </p>
                </div>
                <button
                  onClick={fetchMenuItems}
                  disabled={menuLoading}
                  className="p-1.5 text-stone-500 hover:text-stone-800 rounded-full hover:bg-stone-200"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${menuLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="space-y-2.5">
                {menuItems.map((dish) => (
                  <div
                    key={dish.id}
                    className={`p-3.5 bg-white rounded-2xl border flex items-center justify-between gap-3 shadow-2xs transition-all ${
                      dish.isAvailable ? 'border-stone-200' : 'border-red-200 bg-red-50/20 opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 bg-stone-100"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                            {dish.name}
                          </h5>
                          {!dish.isAvailable && (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-semibold shrink-0">
                              ของหมด
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-500">{dish.categoryName} • รหัส: {dish.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Price Editor */}
                      {editingDishId === dish.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editingPrice}
                            onChange={(e) => setEditingPrice(Number(e.target.value))}
                            className="w-20 px-2 py-1 text-xs border rounded-lg"
                          />
                          <button
                            onClick={() => handleSavePrice(dish.id)}
                            className="px-2 py-1 bg-emerald-600 text-white text-xs rounded-lg font-semibold"
                          >
                            บันทึก
                          </button>
                          <button
                            onClick={() => setEditingDishId(null)}
                            className="px-1.5 py-1 text-stone-400 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[#BC4720]">฿{dish.price}</span>
                          <button
                            onClick={() => {
                              setEditingDishId(dish.id);
                              setEditingPrice(dish.price);
                            }}
                            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
                            title="แก้ไขราคา"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Stock Switcher */}
                      <button
                        onClick={() => handleToggleDishAvailability(dish)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          dish.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        {dish.isAvailable ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>เปิดขาย</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>ปิดการขาย</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
