import React from 'react';
import { Search, X, Sparkles, ThumbsUp, Leaf } from 'lucide-react';
import { CategoryId, SubFilterType } from '../types';
import { CATEGORIES } from '../constants/restaurant';

interface CategoryTabsProps {
  activeCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: SubFilterType;
  onSelectFilter: (f: SubFilterType) => void;
  totalFilteredCount: number;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  activeFilter,
  onSelectFilter,
  totalFilteredCount,
}) => {
  return (
    <div id="menu-section" className="pt-10 pb-6 bg-[#FBF9F5] border-b border-stone-200/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Control Bar: Category Pills & Sleek Search Input */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs: Minimal pill segment */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-stone-200/60 border border-stone-200/40 overflow-x-auto no-scrollbar w-fit">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#1E1B18] shadow-xs font-semibold'
                      : 'text-[#6A635B] hover:text-[#1E1B18]'
                  }`}
                >
                  <span className="text-sm opacity-90">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input: Minimal & Clean */}
          <div className="relative min-w-[260px] sm:min-w-[300px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ค้นหาชื่ออาหาร, รสชาติ, วัตถุดิบ..."
              className="w-full pl-9 pr-8 py-2 rounded-full bg-white border border-stone-200 text-xs sm:text-sm text-[#1E1B18] placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                title="ล้างคำค้นหา"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sub-Filters / Tags: Understated & Eye-Comfort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs text-[#877E76] mr-1">ตัวกรอง:</span>

            <button
              onClick={() => onSelectFilter('all')}
              className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#1E1B18] text-white font-medium'
                  : 'bg-stone-100 hover:bg-stone-200/70 text-[#6A635B]'
              }`}
            >
              ทั้งหมด
            </button>

            <button
              onClick={() => onSelectFilter(activeFilter === 'chef' ? 'all' : 'chef')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                activeFilter === 'chef'
                  ? 'bg-[#C59341] text-white font-medium'
                  : 'bg-[#FAF4E9] hover:bg-[#F3E8D4] text-[#8F6423] border border-[#C59341]/20'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#C59341]" />
              <span>เชฟแนะนำ</span>
            </button>

            <button
              onClick={() => onSelectFilter(activeFilter === 'bestseller' ? 'all' : 'bestseller')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                activeFilter === 'bestseller'
                  ? 'bg-[#BC4720] text-white font-medium'
                  : 'bg-[#F9EFEB] hover:bg-[#F3DDD5] text-[#A03915] border border-[#BC4720]/20'
              }`}
            >
              <ThumbsUp className="w-3 h-3 text-[#BC4720]" />
              <span>เมนูยอดนิยม</span>
            </button>

            <button
              onClick={() => onSelectFilter(activeFilter === 'mild' ? 'all' : 'mild')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                activeFilter === 'mild'
                  ? 'bg-[#3D5943] text-white font-medium'
                  : 'bg-[#EEF4F0] hover:bg-[#DDE9E1] text-[#3D5943] border border-[#3D5943]/20'
              }`}
            >
              <Leaf className="w-3 h-3 text-[#3D5943]" />
              <span>เผ็ดน้อย / รสกลม</span>
            </button>
          </div>

          {/* Result Count Indicator */}
          <div className="text-xs text-[#877E76]">
            แสดงผล <span className="font-semibold text-[#1E1B18]">{totalFilteredCount}</span> เมนู
            {searchQuery && <span className="ml-1 text-stone-500 font-light">สำหรับ "{searchQuery}"</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
