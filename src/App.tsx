import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryTabs } from './components/CategoryTabs';
import { MenuGrid } from './components/MenuGrid';
import { FoodDetailModal } from './components/FoodDetailModal';
import { OrderDrawer } from './components/OrderDrawer';
import { ReservationModal } from './components/ReservationModal';
import { TablePinModal } from './components/TablePinModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { StaffLoginModal } from './components/StaffLoginModal';
import { StaffDashboard } from './components/StaffDashboard';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { Chatbot } from './components/Chatbot';

import { supabase } from './api';
import { 
  CategoryId, SubFilterType, MenuItem, CartItem, 
  ReservationData, TableSession, DiningType 
} from './types';
import { Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  // Menu data from Supabase
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter states
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SubFilterType>('all');

  // Customer Table Session States
  const [tableSession, setTableSession] = useState<TableSession | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);

  // Staff Authentication States
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState(false);
  const [staffEmail, setStaffEmail] = useState('');
  const [isStaffLoginModalOpen, setIsStaffLoginModalOpen] = useState(false);
  const [isStaffDashboardOpen, setIsStaffDashboardOpen] = useState(false);

  // Modal & Drawer states
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);

  // Cart & Toast states
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // 1. ตรวจสอบ Customer Table Session จาก localStorage เมื่อเปิดเว็บ
  useEffect(() => {
    const savedSession = localStorage.getItem('lamunros_table_session');
    if (savedSession) {
      try {
        setTableSession(JSON.parse(savedSession));
      } catch (e) {
        console.error('Session parse error:', e);
      }
    }
  }, []);

  // 2. ตรวจสอบสถานะ Staff Authentication จาก Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsStaffLoggedIn(true);
        setStaffEmail(session.user.email || 'Staff');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsStaffLoggedIn(true);
        setStaffEmail(session.user.email || 'Staff');
      } else {
        setIsStaffLoggedIn(false);
        setStaffEmail('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. ดึงข้อมูลเมนูสดจาก Supabase (รวมคอลัมน์ is_available)
  const fetchMenu = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.warn('Supabase fetch notice:', error.message);
        setMenuItems([]);
      } else if (data && data.length > 0) {
        const formatted: MenuItem[] = data.map((item) => ({
          id: item.id,
          category: item.category_id as 'mains' | 'drinks' | 'desserts',
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
          ingredients: item.ingredients || [],
          servingSize: item.serving_size || '',
          sweetnessOptions: item.sweetness_options || [],
        }));
        setMenuItems(formatted);
      } else {
        setMenuItems([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setMenuItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // 4. คำนวณเมนูที่ผ่านตัวกรองและการค้นหา
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchNameEn = item.nameEn.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchCat = item.categoryName.toLowerCase().includes(q);
        const matchIngredients = item.ingredients?.some((ing) => ing.toLowerCase().includes(q));

        if (!matchName && !matchNameEn && !matchDesc && !matchCat && !matchIngredients) {
          return false;
        }
      }

      if (activeFilter === 'chef' && !item.isChefRecommended) return false;
      if (activeFilter === 'bestseller' && !item.isBestSeller) return false;
      if (activeFilter === 'mild' && item.spiceLevel > 1) return false;

      return true;
    });
  }, [menuItems, activeCategory, searchQuery, activeFilter]);

  // 5. จัดการระบบสำรับอาหาร (Cart Operations)
  const handleAddToCart = (newItem: CartItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (ci) =>
          ci.item.id === newItem.item.id &&
          ci.spice === newItem.spice &&
          ci.sweetness === newItem.sweetness &&
          ci.note === newItem.note
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      } else {
        return [...prev, newItem];
      }
    });

    showToast(`เพิ่ม "${newItem.item.name}" (${newItem.quantity} ที่) ลงสำรับแล้ว`);
  };

  const handleQuickAdd = (item: MenuItem) => {
    if (item.isAvailable === false) {
      showToast(`ขออภัยค่ะ เมนู "${item.name}" หมดชั่วคราว`);
      return;
    }

    handleAddToCart({
      item,
      quantity: 1,
      spice: item.category === 'mains' ? (item.spiceLevel === 1 ? 'เผ็ดน้อย' : item.spiceLevel === 2 ? 'เผ็ดปานกลาง' : item.spiceLevel === 3 ? 'รสจัดจ้าน' : 'ไม่เผ็ด') : undefined,
      sweetness: (item.category === 'drinks' || item.category === 'desserts') ? 'หวานพอดี' : undefined,
    });
  };

  const handleUpdateQty = (index: number, delta: number) => {
    setCartItems((prev) => {
      const updated = [...prev];
      updated[index].quantity += delta;
      if (updated[index].quantity <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
    showToast('ล้างรายการทั้งหมดในสำรับแล้ว');
  };

  // 6. บันทึกคำสั่งซื้อลง Supabase ผูกกับ TableSession และเลขโต๊ะ
  const handleOrderSuccess = async (diningType: DiningType) => {
    try {
      const subtotal = cartItems.reduce((acc, ci) => acc + ci.item.price * ci.quantity, 0);
      const vat = Math.round(subtotal * 0.07);
      const total = subtotal + vat;

      const currentTable = diningType === 'dine-in' ? (tableSession?.table_number || '08') : 'Takeaway';
      const sessionId = diningType === 'dine-in' ? (tableSession?.id || null) : null;

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_number: currentTable,
          session_id: sessionId,
          dining_type: diningType,
          subtotal,
          vat,
          total_price: total,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      if (orderData && cartItems.length > 0) {
        const orderItemsPayload = cartItems.map((ci) => ({
          order_id: orderData.id,
          menu_item_id: ci.item.id,
          item_name: ci.item.name,
          price: ci.item.price,
          quantity: ci.quantity,
          spice: ci.spice || null,
          sweetness: ci.sweetness || null,
          note: ci.note || null,
        }));

        await supabase.from('order_items').insert(orderItemsPayload);
      }
    } catch (err) {
      console.warn('Supabase order insert note:', err);
    } finally {
      setCartItems([]);
      showToast('สำรับอาหารถูกส่งเข้าครัวเรียบร้อยแล้วค่ะ');
    }
  };

  // 7. บันทึกการจองโต๊ะ
  const handleReservationSuccess = async (resData: ReservationData) => {
    try {
      await supabase.from('reservations').insert({
        name: resData.name,
        phone: resData.phone,
        guests: resData.guests,
        date: resData.date,
        time: resData.time,
        zone: resData.zone,
        special_request: resData.specialRequest || null,
        status: 'confirmed',
      });
    } catch (err) {
      console.warn('Supabase reservation insert note:', err);
    } finally {
      showToast(`สำรองโต๊ะสำหรับ ${resData.guests} ท่าน ในชื่อคุณ ${resData.name} เรียบร้อยแล้วค่ะ`);
    }
  };

  // 8. Staff Logout
  const handleStaffLogout = async () => {
    await supabase.auth.signOut();
    setIsStaffLoggedIn(false);
    setStaffEmail('');
    setIsStaffDashboardOpen(false);
    showToast('ออกจากระบบพนักงานเรียบร้อยแล้ว');
  };

  const totalCartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const handleOpenDetail = (item: MenuItem) => {
    setSelectedDish(item);
    setIsDetailModalOpen(true);
  };

  const handleResetFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setActiveFilter('all');
  };

  const handleExploreMenu = () => {
    const el = document.getElementById('menu-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1E1B18] flex flex-col font-sans selection:bg-[#BC4720] selection:text-white">
      {/* Navigation Bar with Customer Table & Staff Status */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenReservation={() => setIsReservationOpen(true)}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setSearchQuery('');
        }}
        activeCategory={activeCategory}
        tableSession={tableSession}
        onOpenPinModal={() => setIsPinModalOpen(true)}
        onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
        isStaff={isStaffLoggedIn}
        onOpenStaffLogin={() => setIsStaffLoginModalOpen(true)}
        onOpenStaffDashboard={() => setIsStaffDashboardOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onExploreMenu={handleExploreMenu}
          onOpenReservation={() => setIsReservationOpen(true)}
        />

        {/* Category Filter & Instant Search */}
        <CategoryTabs
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          totalFilteredCount={filteredItems.length}
        />

        {/* Loading Spinner or Responsive Food Grid */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-stone-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#BC4720]" />
            <p className="text-sm font-light text-[#877E76]">กำลังจัดเตรียมสำรับอาหารจากห้องครัว...</p>
          </div>
        ) : (
          <MenuGrid
            items={filteredItems}
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            onOpenDetail={handleOpenDetail}
            onQuickAdd={handleQuickAdd}
            onResetFilters={handleResetFilters}
          />
        )}
      </main>

      {/* Minimal Earth-tone Footer */}
      <Footer />

      {/* Dish Customization & Detail Modal */}
      <FoodDetailModal
        item={selectedDish}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart & Ordering Drawer (Checks Table PIN for Dine-in) */}
      <OrderDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        tableSession={tableSession}
        onOpenPinModal={() => setIsPinModalOpen(true)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        onReservationSuccess={handleReservationSuccess}
      />

      {/* Customer: Table PIN Modal */}
      <TablePinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        currentSession={tableSession}
        onSessionVerified={(session) => {
          setTableSession(session);
          showToast(`ยินดีต้อนรับสู่โต๊ะ ${session.table_number} ค่ะ`);
        }}
        onSessionCleared={() => {
          setTableSession(null);
          showToast('ออกจากรอบโต๊ะเรียบร้อยแล้วค่ะ');
        }}
      />

      {/* Customer: Live Order Tracker Modal with Call Staff & Bill Request */}
      <OrderTrackerModal
        isOpen={isOrderTrackerOpen}
        onClose={() => setIsOrderTrackerOpen(false)}
        session={tableSession}
        onOpenPinModal={() => setIsPinModalOpen(true)}
      />

      {/* Staff: Login Modal */}
      <StaffLoginModal
        isOpen={isStaffLoginModalOpen}
        onClose={() => setIsStaffLoginModalOpen(false)}
        onLoginSuccess={(email) => {
          setIsStaffLoggedIn(true);
          setStaffEmail(email);
          setIsStaffDashboardOpen(true);
          showToast(`เข้าสู่ระบบในชื่อ ${email} สำเร็จ`);
        }}
      />

      {/* Staff: Comprehensive Operations Dashboard */}
      <StaffDashboard
        isOpen={isStaffDashboardOpen}
        onClose={() => setIsStaffDashboardOpen(false)}
        staffEmail={staffEmail}
        onLogout={handleStaffLogout}
        onMenuUpdated={fetchMenu}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />

      {/* AI Chatbot Assistant */}
      <Chatbot />
    </div>
  );
};

export default App;