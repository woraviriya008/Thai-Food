import React, { useState, useEffect, useCallback } from 'react';
import { X, Clock, ChefHat, Bell, Receipt, RefreshCw, AlertCircle, Utensils, CheckCircle2 } from 'lucide-react';
import { supabase } from '../api';
import { TableSession, OrderRecord } from '../types';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: TableSession | null;
  onOpenPinModal: () => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  session,
  onOpenPinModal,
}) => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [callingStaff, setCallingStaff] = useState(false);
  const [billRequested, setBillRequested] = useState(false);

  const fetchTableOrders = useCallback(async () => {
    if (!session) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('session_id', session.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data as OrderRecord[]) || []);
    } catch (err) {
      console.error('Error fetching table orders:', err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (isOpen && session) {
      fetchTableOrders();
      // Polling or refresh every 8 seconds when tracker is open
      const interval = setInterval(fetchTableOrders, 8000);
      return () => clearInterval(interval);
    }
  }, [isOpen, session, fetchTableOrders]);

  if (!isOpen) return null;

  if (!session) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in" onClick={onClose}>
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
          <AlertCircle className="w-12 h-12 text-[#BC4720] mx-auto" />
          <h3 className="font-serif-thai text-xl font-bold text-[#1E1B18]">ยังไม่ได้ยืนยันรอบโต๊ะ</h3>
          <p className="text-xs text-[#877E76]">กรุณากรอกรหัส PIN ประจำโต๊ะเพื่อดูรายการอาหารและสถานะในครัวค่ะ</p>
          <div className="flex gap-2 pt-2">
            <button onClick={() => { onClose(); onOpenPinModal(); }} className="flex-1 py-3 rounded-full bg-[#BC4720] text-white text-xs font-semibold">
              ยืนยันรหัส PIN โต๊ะ
            </button>
            <button onClick={onClose} className="px-5 py-3 rounded-full bg-stone-100 text-stone-600 text-xs font-medium">
              ปิด
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Call Staff
  const handleCallStaff = async (type: 'calling' | 'bill') => {
    if (orders.length === 0) return;
    try {
      if (type === 'calling') setCallingStaff(true);
      if (type === 'bill') setBillRequested(true);

      const latestOrderId = orders[0].id;
      await supabase
        .from('orders')
        .update({ call_staff_status: type })
        .eq('id', latestOrderId);

      setTimeout(() => {
        if (type === 'calling') setCallingStaff(false);
      }, 4000);
    } catch (err) {
      console.error('Call staff error:', err);
    }
  };

  const grandTotal = orders.reduce((sum, ord) => sum + Number(ord.total_price), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-medium border border-amber-200"><Clock className="w-3 h-3" />รับออเดอร์แล้ว</span>;
      case 'cooking':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-200 animate-pulse"><ChefHat className="w-3 h-3" />กำลังปรุงในครัว</span>;
      case 'ready':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200"><CheckCircle2 className="w-3 h-3" />พร้อมเสิร์ฟ</span>;
      case 'served':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[11px] font-medium">เสิร์ฟเรียบร้อย</span>;
      default:
        return <span className="text-[11px] text-stone-500">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in" onClick={onClose}>
      <div className="relative bg-[#FBF9F5] w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-stone-200/80 my-8 flex flex-col max-h-[90vh] animate-scale-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-stone-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="font-serif-thai text-xl font-bold text-[#1E1B18]">
                สถานะอาหาร • โต๊ะ {session.table_number}
              </h3>
            </div>
            <p className="text-xs text-[#877E76] mt-0.5">
              รหัสรอบโต๊ะ: <span className="font-mono font-bold text-stone-800">{session.pin}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchTableOrders}
              disabled={loading}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors cursor-pointer"
              title="รีเฟรชสถานะ"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#BC4720]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Bar for Calling Staff */}
        <div className="px-5 py-3 bg-[#FAF4E9] border-b border-stone-200/70 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-[#8F6423] font-medium">บริการประจำโต๊ะ:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCallStaff('calling')}
              disabled={orders.length === 0 || callingStaff}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                callingStaff ? 'bg-emerald-600 text-white' : 'bg-white text-[#1E1B18] border border-stone-300 hover:bg-stone-50'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-[#BC4720]" />
              <span>{callingStaff ? 'แจ้งพนักงานแล้วค่ะ' : 'เรียกพนักงาน'}</span>
            </button>

            <button
              onClick={() => handleCallStaff('bill')}
              disabled={orders.length === 0 || billRequested}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                billRequested ? 'bg-amber-600 text-white' : 'bg-white text-[#1E1B18] border border-stone-300 hover:bg-stone-50'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-[#BC4720]" />
              <span>{billRequested ? 'ขอบิลเรียบร้อยค่ะ' : 'ขอเช็กบิล'}</span>
            </button>
          </div>
        </div>

        {/* Orders List Body */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-4">
          {orders.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Utensils className="w-10 h-10 text-stone-300 mx-auto" />
              <h4 className="font-serif-thai text-base font-bold text-[#1E1B18]">ยังไม่มีรายการสั่งอาหารในรอบโต๊ะนี้</h4>
              <p className="text-xs text-[#877E76]">เลือกเมนูโปรดแล้วกด "สั่งอาหาร" เพื่อส่งตรงเข้าครัวได้เลยค่ะ</p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 rounded-full bg-[#BC4720] text-white text-xs font-semibold hover:bg-[#A03915] transition-colors"
              >
                เลือกดูเมนูอาหาร
              </button>
            </div>
          ) : (
            orders.map((ord, idx) => (
              <div key={ord.id} className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 text-xs">
                  <div>
                    <span className="font-bold text-[#1E1B18]">สำรับที่ #{orders.length - idx}</span>
                    <span className="text-[11px] text-[#877E76] ml-2">
                      {new Date(ord.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                    </span>
                  </div>
                  {getStatusBadge(ord.status)}
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {ord.order_items?.map((it) => (
                    <div key={it.id} className="flex items-start justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[#1E1B18]">{it.item_name}</span>
                          <span className="text-stone-500 font-mono">x{it.quantity}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 text-[10px] text-stone-500">
                          {it.spice && <span className="px-1.5 py-0.2 rounded bg-red-50 text-red-600">{it.spice}</span>}
                          {it.sweetness && <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700">{it.sweetness}</span>}
                          {it.note && <span className="italic text-stone-400">"{it.note}"</span>}
                        </div>
                      </div>
                      <span className="font-mono font-medium text-[#1E1B18]">
                        ฿{(Number(it.price) * it.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-dashed border-stone-200 flex justify-between text-xs font-medium text-[#6A635B]">
                  <span>ยอดบิลนี้ (รวม VAT 7%)</span>
                  <span className="font-bold text-[#BC4720]">฿{Number(ord.total_price).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Grand Total Footer */}
        {orders.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#877E76] block">ยอดรวมทั้งสิ้นของโต๊ะ {session.table_number}</span>
              <span className="text-xl font-bold font-serif-thai text-[#1E1B18]">฿{grandTotal.toLocaleString()}</span>
            </div>
            <button
              onClick={() => handleCallStaff('bill')}
              className="px-6 py-2.5 rounded-full bg-[#1E1B18] hover:bg-[#BC4720] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              เรียกเช็กบิล
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

