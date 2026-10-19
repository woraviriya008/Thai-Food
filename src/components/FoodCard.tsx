import React from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { MenuItem } from '../types';

interface FoodCardProps {
  item: MenuItem;
  onOpenDetail: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, onOpenDetail, onQuickAdd }) => {
  // Discrete spice level dots
  const renderSpiceIndicator = () => {
    if (item.spiceLevel === 0) return null;
    return (
      <div className="flex items-center gap-1" title={`ระดับความเผ็ด: ${item.spiceLevel}/3`}>
        {[1, 2, 3].map((lvl) => (
          <span
            key={lvl}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              lvl <= item.spiceLevel ? 'bg-[#BC4720]' : 'bg-stone-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <article
      onClick={() => onOpenDetail(item)}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-200/70 shadow-soft-card shadow-soft-card-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
    >
      {/* Dish Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Minimal Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {item.isAvailable === false && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-semibold shadow-xs">
              ของหมด
            </span>
          )}
          {item.isChefRecommended && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[#8F6423] text-[10px] font-medium border border-[#C59341]/20 shadow-2xs">
              <Sparkles className="w-2.5 h-2.5 text-[#C59341]" />
              <span>แนะนำ</span>
            </span>
          )}
          {item.isBestSeller && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[#A03915] text-[10px] font-medium border border-[#BC4720]/20 shadow-2xs">
              <span>ยอดนิยม</span>
            </span>
          )}
        </div>

        {/* Calories pill */}
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/85 backdrop-blur-sm text-stone-600 text-[10px] font-light">
          {item.calories}
        </div>
      </div>

      {/* Card Info Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3.5">
        <div className="space-y-1">
          {/* Category & Spice dots */}
          <div className="flex items-center justify-between text-xs pb-0.5">
            <span className="text-[#877E76] font-light text-[11px]">{item.categoryName}</span>
            {renderSpiceIndicator()}
          </div>

          {/* Dish Name */}
          <h3 className="font-serif-thai text-base sm:text-lg font-bold text-[#1E1B18] group-hover:text-[#BC4720] transition-colors leading-snug line-clamp-1">
            {item.name}
          </h3>

          {/* English Subtitle */}
          <p className="text-[11px] text-[#877E76] italic line-clamp-1 font-light">
            {item.nameEn}
          </p>

          {/* Short description */}
          <p className="text-xs text-[#6A635B] line-clamp-2 leading-relaxed pt-1 font-light">
            {item.description}
          </p>
        </div>

        {/* Bottom Price & Order Trigger */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-stone-400">฿</span>
            <span className="text-lg font-bold font-serif-thai text-[#1E1B18]">
              {item.price.toLocaleString()}
            </span>
          </div>

          {item.isAvailable === false ? (
            <span className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-400 text-xs font-medium cursor-not-allowed">
              ของหมด
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(item);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-[#1E1B18] text-[#1E1B18] hover:text-white text-xs font-medium transition-all active:scale-95 cursor-pointer"
              title="เพิ่มลงสำรับทันที"
            >
              <Plus className="w-3 h-3" />
              <span>สั่ง</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
