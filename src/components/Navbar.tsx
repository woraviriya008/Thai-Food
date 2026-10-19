import React, { useState } from 'react';
import { ShoppingBag, Calendar, Menu, X, ShieldCheck, KeyRound, Utensils } from 'lucide-react';
import { CategoryId, TableSession } from '../types';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenReservation: () => void;
  onSelectCategory: (cat: CategoryId) => void;
  activeCategory: CategoryId;
  tableSession: TableSession | null;
  onOpenPinModal: () => void;
  onOpenOrderTracker: () => void;
  isStaff: boolean;
  onOpenStaffLogin: () => void;
  onOpenStaffDashboard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenReservation,
  onSelectCategory,
  activeCategory,
  tableSession,
  onOpenPinModal,
  onOpenOrderTracker,
  isStaff,
  onOpenStaffLogin,
  onOpenStaffDashboard,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { label: string; cat: CategoryId; sub: string }[] = [
    { label: 'ทั้งหมด', cat: 'all', sub: 'All' },
    { label: 'กับข้าว', cat: 'mains', sub: 'Mains' },
    { label: 'เครื่องดื่ม', cat: 'drinks', sub: 'Beverages' },
    { label: 'ขนมหนมหวาน', cat: 'desserts', sub: 'Desserts' },
  ];

  const handleNavClick = (cat: CategoryId) => {
    onSelectCategory(cat);
    setMobileMenuOpen(false);
    const el = document.getElementById('menu-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-stone-200/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#"
          className="flex items-center gap-3 group text-decoration-none"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <div className="w-9 h-9 rounded-full bg-[#1E1B18] text-[#FBF9F5] flex items-center justify-center font-serif-thai text-sm font-semibold tracking-wider group-hover:bg-[#BC4720] transition-colors">
            ล
          </div>
          <div className="flex flex-col">
            <span className="font-serif-thai text-2xl font-bold tracking-tight text-[#1E1B18] leading-none">
              ละมุนรส
            </span>
            <span className="text-[10px] tracking-[0.2em] text-[#877E76] uppercase font-medium mt-1">
              Lamunros Culinary
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = activeCategory === link.cat;
            return (
              <button
                key={link.cat}
                onClick={() => handleNavClick(link.cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#1E1B18] text-white shadow-xs font-semibold'
                    : 'text-[#4D4741] hover:text-[#1E1B18] hover:bg-stone-200/50'
                }`}
              >
                <span>{link.label}</span>
              </button>
            );
          })}
          <a
            href="#about-section"
            className="px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-[#877E76] hover:text-[#1E1B18] hover:bg-stone-200/50 transition-colors"
          >
            เรื่องราวร้าน
          </a>
        </nav>

        {/* Right Actions Bar */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Customer Table Status & PIN Trigger */}
          {tableSession ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenPinModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                title="คลิกเพื่อดูรายละเอียดรอบโต๊ะ"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>โต๊ะ {tableSession.table_number}</span>
              </button>

              <button
                onClick={onOpenOrderTracker}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-xs font-medium text-[#1E1B18] border border-stone-200 transition-colors cursor-pointer"
                title="ติดตามสถานะอาหารและเรียกพนักงาน"
              >
                <Utensils className="w-3.5 h-3.5 text-[#BC4720]" />
                <span>สถานะอาหาร</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenPinModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100/90 hover:bg-stone-200 border border-stone-200 text-xs font-medium text-[#4D4741] transition-colors cursor-pointer"
              title="เลือกรอบโต๊ะและกรอก PIN"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#BC4720]" />
              <span>ระบุโต๊ะ / PIN</span>
            </button>
          )}

          {/* Reservation Button */}
          <button
            onClick={onOpenReservation}
            className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-stone-300 hover:border-stone-400 text-xs font-medium text-[#1E1B18] bg-transparent hover:bg-white/80 transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#877E76]" />
            <span>จองโต๊ะ</span>
          </button>

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            aria-label="เปิดสำรับอาหาร"
            className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-[#BC4720] hover:bg-[#A03915] text-white text-xs sm:text-sm font-medium shadow-sm hover:shadow transition-all cursor-pointer active:scale-96"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">สำรับ</span>
            {cartCount > 0 && (
              <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-[#FAF4E9] text-[#1E1B18]">
                {cartCount}
              </span>
            )}
          </button>

          {/* Staff Portal Button */}
          {isStaff ? (
            <button
              onClick={onOpenStaffDashboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-amber-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="เปิดแดชบอร์ดพนักงาน"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Staff</span>
            </button>
          ) : (
            <button
              onClick={onOpenStaffLogin}
              className="p-2 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 transition-colors cursor-pointer"
              title="เข้าสู่ระบบพนักงาน (Staff Portal)"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-[#1E1B18] hover:bg-stone-200/60 transition-colors"
            aria-label="เปิดเมนู"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200/60 bg-[#FBF9F5] px-4 pt-3 pb-5 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-200/60">
            <span className="text-xs text-[#877E76]">สถานะการนั่ง</span>
            {tableSession ? (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenOrderTracker(); }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-xs text-emerald-800 font-semibold"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>โต๊ะ {tableSession.table_number} (ดูสถานะอาหาร)</span>
              </button>
            ) : (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenPinModal(); }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-xs text-stone-700"
              >
                <KeyRound className="w-3 h-3 text-[#BC4720]" />
                <span>ระบุโต๊ะ / PIN</span>
              </button>
            )}
          </div>
          {navLinks.map((link) => (
            <button
              key={link.cat}
              onClick={() => handleNavClick(link.cat)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeCategory === link.cat
                  ? 'bg-[#1E1B18] text-white'
                  : 'text-[#4D4741] hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{link.label}</span>
                <span className="text-xs opacity-60">{link.sub}</span>
              </div>
            </button>
          ))}
          <div className="pt-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenReservation();
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-stone-300 text-[#1E1B18] font-medium text-xs hover:bg-stone-100"
            >
              <Calendar className="w-3.5 h-3.5 text-[#877E76]" />
              <span>สำรองโต๊ะ</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (isStaff) onOpenStaffDashboard();
                else onOpenStaffLogin();
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-stone-900 text-white font-medium text-xs hover:bg-stone-800"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>{isStaff ? 'แดชบอร์ดพนักงาน' : 'ล็อกอินพนักงาน'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
