import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle2, UtensilsCrossed } from 'lucide-react';
import { CartItem, DiningType, TableSession } from '../types';

interface OrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  tableSession: TableSession | null;
  onOpenPinModal: () => void;
  onUpdateQty: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onOrderSuccess: (diningType: DiningType) => void;
}

export const OrderDrawer: React.FC<OrderDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  tableSession,
  onOpenPinModal,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOrderSuccess,
}) => {
  const [diningType, setDiningType] = useState<DiningType>('dine-in');
  const [orderSent, setOrderSent] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, ci) => acc + ci.item.price * ci.quantity, 0);
  const vat = Math.round(subtotal * 0.07);
  const total = subtotal + vat;
  const totalItemsCount = cartItems.reduce((acc, ci) => acc + ci.quantity, 0);

  const handleSendOrder = () => {
    if (diningType === 'dine-in' && !tableSession) {
      alert('กรุณายืนยันรหัส PIN รอบโต๊ะของคุณก่อนส่งออเดอร์เข้าครัวค่ะ');
      onOpenPinModal();
      return;
    }

    setOrderSent(true);
    setTimeout(() => {
      onOrderSuccess(diningType);
      setOrderSent(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs animate-fade-in flex justify-end">
      {/* Slide-over Container */}
      <div
        className="w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl flex flex-col justify-between border-l border-[#2A2421]/10 animate-slide-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#2A2421]/10 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#C85A32] text-white flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-thai font-bold text-lg text-[#2A2421]">
                  สำรับอาหารของคุณ
                </h3>
                <span className="text-[11px] text-[#8A7E77]">
                  {totalItemsCount > 0 ? `${totalItemsCount} รายการในสำรับ` : 'ยังไม่มีรายการ'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="ปิดตะกร้า"
              className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dining Type Switcher */}
          <div className="mt-4 grid grid-cols-2 gap-2 bg-[#F4EFEA] p-1 rounded-xl">
            <button
              onClick={() => setDiningType('dine-in')}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                diningType === 'dine-in'
                  ? 'bg-white text-[#C85A32] shadow-xs'
                  : 'text-[#60554E] hover:text-[#2A2421]'
              }`}
            >
              {tableSession ? `ทานที่ร้าน (โต๊ะ ${tableSession.table_number})` : 'ทานที่ร้าน (ระบุโต๊ะ)'}
            </button>
            <button
              onClick={() => setDiningType('takeaway')}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                diningType === 'takeaway'
                  ? 'bg-white text-[#C85A32] shadow-xs'
                  : 'text-[#60554E] hover:text-[#2A2421]'
              }`}
            >
              สั่งกลับบ้าน (Takeaway)
            </button>
          </div>
        </div>

        {/* Drawer Items Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {orderSent ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-serif-thai text-xl font-bold text-[#2A2421]">
                ส่งรายการเข้าครัวเรียบร้อย!
              </h4>
              <p className="text-xs text-[#60554E] leading-relaxed">
                แม่ครัวละมุนรสกำลังปรุงสดใหม่ด้วยความประณีต <br />
                {diningType === 'dine-in' ? 'อาหารจะถูกนำเสิร์ฟที่โต๊ะ 08' : 'เตรียมรับอาหารที่จุดบริการหน้าร้าน'}
              </p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#F4EFEA] text-[#8A7E77] flex items-center justify-center">
                <UtensilsCrossed className="w-8 h-8 opacity-60" />
              </div>
              <h4 className="font-serif-thai text-lg font-bold text-[#2A2421]">
                สำรับของคุณยังว่างอยู่
              </h4>
              <p className="text-xs text-[#8A7E77]">
                เลือกชมเมนูรสเลิศแล้วแตะ "สั่งเมนูนี้" เพื่อเพิ่มลงสำรับ
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 rounded-full bg-[#C85A32] text-white text-xs font-medium hover:bg-[#B24B25] transition-colors cursor-pointer"
              >
                เลือกดูเมนูอาหาร
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between pb-2 border-b border-[#2A2421]/6">
                <span className="text-xs text-[#8A7E77]">รายการที่เลือก</span>
                <button
                  onClick={onClearCart}
                  className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
                >
                  ล้างสำรับทั้งหมด
                </button>
              </div>

              {cartItems.map((ci, index) => {
                const itemTotal = ci.item.price * ci.quantity;
                return (
                  <div
                    key={`${ci.item.id}-${index}`}
                    className="p-3 bg-white rounded-2xl border border-[#2A2421]/8 flex gap-3 shadow-2xs hover:border-[#C85A32]/20 transition-all"
                  >
                    <img
                      src={ci.item.image}
                      alt={ci.item.name}
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 bg-stone-100"
                    />

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h5 className="font-serif-thai font-bold text-sm text-[#2A2421] truncate">
                            {ci.item.name}
                          </h5>
                          <button
                            onClick={() => onRemoveItem(index)}
                            className="text-stone-400 hover:text-red-500 p-0.5 cursor-pointer"
                            title="ลบรายการ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Customizations tags */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ci.spice && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-medium">
                              {ci.spice}
                            </span>
                          )}
                          {ci.sweetness && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                              {ci.sweetness}
                            </span>
                          )}
                          {ci.note && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 italic">
                              "{ci.note}"
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Price & Counter */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-bold text-[#C85A32] font-serif-thai">
                          ฿{itemTotal.toLocaleString()}
                        </span>

                        <div className="flex items-center border border-stone-200 rounded-full bg-stone-50 px-1 py-0.5">
                          <button
                            onClick={() => onUpdateQty(index, -1)}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-stone-600 hover:bg-stone-200 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-[#2A2421]">
                            {ci.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQty(index, 1)}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-stone-600 hover:bg-stone-200 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Drawer Footer Calculations */}
        {cartItems.length > 0 && !orderSent && (
          <div className="p-5 bg-white border-t border-[#2A2421]/10 space-y-3">
            <div className="space-y-1.5 text-xs text-[#60554E]">
              <div className="flex justify-between">
                <span>ราคารวมค่าอาหาร</span>
                <span className="font-medium text-[#2A2421]">฿{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
                <span>฿{vat.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#2A2421] pt-2 border-t border-dashed border-stone-200">
                <span className="font-serif-thai">ยอดสุทธิ</span>
                <span className="text-[#C85A32] font-serif-thai">฿{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleSendOrder}
              className="w-full py-3.5 px-6 rounded-full bg-[#C85A32] hover:bg-[#B24B25] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#C85A32]/25 transition-all cursor-pointer active:scale-98"
            >
              <span>ยืนยันการสั่งสำรับอาหาร</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-center text-[#8A7E77]">
              {diningType === 'dine-in' ? 'คิดยอดบิลรวมเมื่อสิ้นสุดมื้ออาหาร' : 'ชำระเงินที่จุดชำระหน้าร้านเมื่อรับอาหาร'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

