import React, { useState } from 'react';
import { X, KeyRound, CheckCircle2, AlertCircle, Loader2, Sparkles, LogOut } from 'lucide-react';
import { supabase } from '../api';
import { TableSession } from '../types';

interface TablePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: TableSession | null;
  onSessionVerified: (session: TableSession) => void;
  onSessionCleared: () => void;
}

export const TablePinModal: React.FC<TablePinModalProps> = ({
  isOpen,
  onClose,
  currentSession,
  onSessionVerified,
  onSessionCleared,
}) => {
  const [selectedTable, setSelectedTable] = useState('08');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const tableList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || pin.length < 4) {
      setErrorMessage('กรุณากรอกรหัส PIN ให้ครบ 4 หลักค่ะ');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const { data, error } = await supabase
        .from('table_sessions')
        .select('*')
        .eq('table_number', selectedTable)
        .eq('pin', pin.trim())
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setErrorMessage(`ไม่พบรหัส PIN "${pin}" สำหรับโต๊ะ ${selectedTable} หรือโต๊ะนี้ยังไม่ได้เปิดรอบบริการ กรุณาสอบถามพนักงานเพื่อรับ PIN ค่ะ`);
        return;
      }

      // Valid session
      localStorage.setItem('lamunros_table_session', JSON.stringify(data));
      onSessionVerified(data as TableSession);
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      console.error('Verify error:', errorObj);
      setErrorMessage('เกิดข้อผิดพลาดในการตรวจสอบ กรุณาลองใหม่อีกครั้งค่ะ');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveTable = () => {
    localStorage.removeItem('lamunros_table_session');
    onSessionCleared();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-stone-200/80 my-8 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="ปิดหน้าต่าง"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Current Active Table State */}
        {currentSession ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                เปิดรอบโต๊ะแล้ว
              </span>
              <h3 className="font-serif-thai text-2xl font-bold text-[#1E1B18] mt-2">
                คุณกำลังนั่งที่ โต๊ะ {currentSession.table_number}
              </h3>
              <p className="text-xs text-[#877E76] mt-1 font-light">
                รหัสรอบโต๊ะ: <span className="font-mono font-bold text-[#1E1B18]">{currentSession.pin}</span> • เริ่มเปิดเมื่อ {new Date(currentSession.opened_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
              </p>
            </div>

            <div className="p-4 bg-[#FBF9F5] rounded-2xl text-xs text-[#6A635B] border border-stone-200/60 leading-relaxed text-left space-y-1.5">
              <div className="flex items-center gap-2 text-[#1E1B18] font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#BC4720]" />
                <span>สิทธิประโยชน์ประจำโต๊ะของคุณ:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-stone-500 pl-1">
                <li>สั่งอาหารตรงเข้าครัวพร้อมระบุความเผ็ด</li>
                <li>ติดตามสถานะอาหารแบบเรียลไทม์</li>
                <li>กดปุ่มเรียกพนักงานหรือขอเช็กบิลได้ทันที</li>
              </ul>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-full bg-[#1E1B18] hover:bg-[#BC4720] text-white text-xs font-medium transition-colors cursor-pointer"
              >
                สั่งอาหารต่อ
              </button>
              <button
                type="button"
                onClick={handleLeaveTable}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition-colors cursor-pointer"
                title="ออกจากรอบโต๊ะนี้"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>เปลี่ยนโต๊ะ</span>
              </button>
            </div>
          </div>
        ) : (
          /* Form to Select Table & Enter PIN */
          <div className="p-6 sm:p-8 space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F9EFEB] text-[#BC4720] text-[11px] font-semibold mb-2">
                <KeyRound className="w-3.5 h-3.5" />
                <span>ยืนยันตัวตนสำหรับลูกค้าที่ร้าน</span>
              </div>
              <h3 className="font-serif-thai text-2xl font-bold text-[#1E1B18]">
                เข้าสู่รอบโต๊ะอาหาร
              </h3>
              <p className="text-xs text-[#877E76] mt-1 font-light">
                กรุณาเลือกหมายเลขโต๊ะ และกรอกรหัส PIN 4 หลักที่พนักงานเปิดให้เพื่อเริ่มสั่งอาหาร
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              {/* Table Selector Grid */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider block">
                  เลือกหมายเลขโต๊ะของคุณ
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {tableList.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => {
                        setSelectedTable(t);
                        setErrorMessage(null);
                      }}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedTable === t
                          ? 'bg-[#1E1B18] text-white border-[#1E1B18] shadow-xs'
                          : 'bg-stone-50 hover:bg-stone-100 text-[#4D4741] border-stone-200'
                      }`}
                    >
                      โต๊ะ {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* PIN Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider block">
                  รหัส PIN รอบโต๊ะ (4 หลัก)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ''); // Numbers only
                    setPin(val);
                    setErrorMessage(null);
                  }}
                  placeholder="เช่น 1234"
                  className="w-full text-center text-2xl font-mono tracking-[0.5em] py-3 rounded-2xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#BC4720]/30 focus:border-[#BC4720] transition-all"
                />
                <span className="text-[11px] text-[#877E76] text-center block">
                  *สอบถามรหัส PIN ได้จากพนักงานประจำร้าน
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading || pin.length < 4}
                className="w-full py-3.5 rounded-full bg-[#BC4720] hover:bg-[#A03915] text-white font-medium text-xs sm:text-sm shadow-md shadow-[#BC4720]/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังตรวจสอบรอบโต๊ะ...</span>
                  </>
                ) : (
                  <span>ยืนยันเข้าสู่โต๊ะ {selectedTable}</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

