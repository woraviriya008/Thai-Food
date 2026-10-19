import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Sparkles, Flame, Check, Utensils } from 'lucide-react';
import { MenuItem, CartItem } from '../types';

interface FoodDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSpice, setSelectedSpice] = useState('เผ็ดปานกลาง');
  const [selectedSweetness, setSelectedSweetness] = useState('หวานพอดี (50%)');
  const [kitchenNote, setKitchenNote] = useState('');

  // Reset form when modal opens with a new item
  useEffect(() => {
    if (item) {
      setQuantity(1);
      setSelectedSpice(
        item.spiceLevel === 1 ? 'เผ็ดน้อย' : item.spiceLevel === 2 ? 'เผ็ดปานกลาง' : item.spiceLevel === 3 ? 'รสจัดจ้าน' : 'ไม่เผ็ด'
      );
      setSelectedSweetness(
        item.sweetnessOptions && item.sweetnessOptions.length > 0 ? item.sweetnessOptions[0] : 'หวานพอดี (50%)'
      );
      setKitchenNote('');
    }
  }, [item]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const isMain = item.category === 'mains';
  const isDrinkOrDessert = item.category === 'drinks' || item.category === 'desserts';
  const totalPrice = item.price * quantity;

  const spiceOptions = ['ไม่เผ็ด', 'เผ็ดน้อย', 'เผ็ดปานกลาง', 'รสจัดจ้าน'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddToCart({
      item,
      quantity,
      spice: isMain ? selectedSpice : undefined,
      sweetness: isDrinkOrDessert ? selectedSweetness : undefined,
      note: kitchenNote.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-[#2A2421]/10 my-8 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="ปิดหน้าต่าง"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Image Hero */}
        <div className="relative aspect-[16/9] w-full bg-stone-100 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Image Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {item.isChefRecommended && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>เชฟแนะนำ</span>
              </span>
            )}
            {item.isBestSeller && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C85A32] text-white text-xs font-semibold shadow-md">
                <Flame className="w-3.5 h-3.5" />
                <span>ขายดี</span>
              </span>
            )}
          </div>

          {/* Dish Header on Image */}
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <span className="text-xs uppercase tracking-wider text-stone-200">
              {item.categoryName} • {item.calories} {item.servingSize ? `• ${item.servingSize}` : ''}
            </span>
            <h2 className="font-serif-thai text-2xl sm:text-3xl font-bold mt-0.5 leading-snug">
              {item.name}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 italic">{item.nameEn}</p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Description */}
          <div className="space-y-2">
            <p className="text-sm text-[#4A403A] leading-relaxed font-light">
              {item.description}
            </p>

            {/* Ingredients pills */}
            {item.ingredients && item.ingredients.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-medium text-[#8A7E77] block mb-1.5">
                  เครื่องปรุง & วัตถุดิบหลัก:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {item.ingredients.map((ing, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F4EFEA] text-[11px] text-[#4A403A]"
                    >
                      <Utensils className="w-2.5 h-2.5 text-[#C85A32]" />
                      <span>{ing}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customization Options */}
          <div className="border-t border-[#2A2421]/10 pt-4 space-y-5">
            {/* Spice Options for Mains */}
            {isMain && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2A2421] uppercase tracking-wider">
                  ระดับความเผ็ดที่ต้องการ
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {spiceOptions.map((spice) => {
                    const isSelected = selectedSpice === spice;
                    return (
                      <button
                        type="button"
                        key={spice}
                        onClick={() => setSelectedSpice(spice)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-xs'
                            : 'bg-white hover:bg-stone-50 text-[#4A403A] border-stone-200'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                        <span>{spice}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sweetness Options for Drinks & Desserts */}
            {isDrinkOrDessert && item.sweetnessOptions && item.sweetnessOptions.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2A2421] uppercase tracking-wider">
                  ระดับความหวาน
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {item.sweetnessOptions.map((opt) => {
                    const isSelected = selectedSweetness === opt;
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => setSelectedSweetness(opt)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#4A6B53] text-white border-[#4A6B53] shadow-xs'
                            : 'bg-white hover:bg-stone-50 text-[#4A403A] border-stone-200'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Kitchen Note */}
            <div className="space-y-1.5">
              <label htmlFor="modal-note" className="text-xs font-bold text-[#2A2421] uppercase tracking-wider">
                ข้อความพิเศษถึงแม่ครัว (ถ้ามี)
              </label>
              <textarea
                id="modal-note"
                rows={2}
                value={kitchenNote}
                onChange={(e) => setKitchenNote(e.target.value)}
                placeholder="เช่น ไม่ใส่ผักชี, แยกน้ำจิ้ม, แยกพริกขี้หนูสวน..."
                className="w-full p-3 rounded-xl border border-stone-200 text-xs text-[#2A2421] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C85A32]/30 focus:border-[#C85A32]"
              />
            </div>
          </div>

          {/* Footer Quantity & Add to Cart */}
          <div className="border-t border-[#2A2421]/10 pt-4 flex items-center justify-between gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center border border-stone-200 rounded-full bg-stone-50 p-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full bg-white hover:bg-stone-200 flex items-center justify-center text-[#2A2421] transition-colors cursor-pointer"
                disabled={quantity <= 1}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-bold text-sm text-[#2A2421]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full bg-white hover:bg-stone-200 flex items-center justify-center text-[#2A2421] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Submit Add Button */}
            <button
              type="submit"
              disabled={item.isAvailable === false}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-full font-medium text-sm transition-all cursor-pointer active:scale-98 ${
                item.isAvailable === false
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-[#C85A32] hover:bg-[#B24B25] text-white shadow-md shadow-[#C85A32]/25'
              }`}
            >
              {item.isAvailable === false ? (
                <span>ขออภัย เมนูนี้หมดชั่วคราว</span>
              ) : (
                <>
                  <span>เพิ่มลงสำรับ</span>
                  <span className="font-serif-thai font-bold">฿{totalPrice.toLocaleString()}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

