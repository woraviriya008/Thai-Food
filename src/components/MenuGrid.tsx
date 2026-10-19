import React from 'react';
import { FoodCard } from './FoodCard';
import { MenuItem, CategoryId } from '../types';
import { Utensils, RefreshCw } from 'lucide-react';

interface MenuGridProps {
  items: MenuItem[];
  activeCategory: CategoryId;
  searchQuery: string;
  onOpenDetail: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
  onResetFilters: () => void;
}

export const MenuGrid: React.FC<MenuGridProps> = ({
  items,
  activeCategory,
  searchQuery,
  onOpenDetail,
  onQuickAdd,
  onResetFilters,
}) => {
  // Empty State
  if (items.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FBEFEA] flex items-center justify-center text-[#C85A32]">
          <Utensils className="w-8 h-8" />
        </div>
        <h3 className="font-serif-thai text-xl font-bold text-[#2A2421]">
          ไม่พบรายการอาหารที่ค้นหา
        </h3>
        <p className="text-sm text-[#8A7E77] mt-2">
          ไม่พบเมนูที่ตรงกับเงื่อนไข "{searchQuery}" กรุณาลองใช้คำค้นหาอื่น หรือดูรายการทั้งหมด
        </p>
        <button
          onClick={onResetFilters}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C85A32] text-white text-xs font-semibold hover:bg-[#B24B25] transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>ดูเมนูทั้งหมด</span>
        </button>
      </div>
    );
  }

  // Check if we should group by category
  const shouldGroup = activeCategory === 'all' && !searchQuery;

  if (shouldGroup) {
    const sections: { id: 'mains' | 'drinks' | 'desserts'; title: string; subtitle: string; icon: string }[] = [
      { id: 'mains', title: 'สำรับกับข้าว', subtitle: 'ต้ม แกง ผัด ยำ ทอด รสชาติถึงเครื่องไทยแท้', icon: '🍲' },
      { id: 'drinks', title: 'เครื่องดื่มสมุนไพร & ชงสด', subtitle: 'หอมชื่นใจ คั้นสด สกัดเย็น ดับกระหาย', icon: '🍵' },
      { id: 'desserts', title: 'ขนมหนมหวานตำรับโบราณ', subtitle: 'กะทิสดอบควันเทียน หวานละมุนพอดีคำ', icon: '🍨' },
    ];

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        {sections.map((section) => {
          const sectionItems = items.filter((it) => it.category === section.id);
          if (sectionItems.length === 0) return null;

          return (
            <section key={section.id} className="space-y-6">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#2A2421]/10 pb-4 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{section.icon}</span>
                    <h2 className="font-serif-thai text-2xl sm:text-3xl font-bold text-[#2A2421]">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-[#8A7E77] mt-1">
                    {section.subtitle}
                  </p>
                </div>
                <span className="text-xs font-medium text-[#8A7E77]">
                  {sectionItems.length} เมนู
                </span>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sectionItems.map((item) => (
                  <FoodCard
                    key={item.id}
                    item={item}
                    onOpenDetail={onOpenDetail}
                    onQuickAdd={onQuickAdd}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  // Flat Grid Display
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <FoodCard
            key={item.id}
            item={item}
            onOpenDetail={onOpenDetail}
            onQuickAdd={onQuickAdd}
          />
        ))}
      </div>
    </div>
  );
};

