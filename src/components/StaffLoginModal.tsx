import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '../api';

interface StaffLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
}

export const StaffLoginModal: React.FC<StaffLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ล้างค่า username และ password ทุกครั้งที่เปิดหรือปิด Modal
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setErrorMessage(null);
    }
  }, [isOpen]);

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setErrorMessage(null);
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        setEmail('');
        setPassword('');
        setErrorMessage(null);
        onLoginSuccess(data.user.email || 'Staff');
        onClose();
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      console.error('Staff login error:', errorObj);
      setErrorMessage('อีเมลหรือรหัสผ่านพนักงานไม่ถูกต้อง กรุณาตรวจสอบอีกครั้งค่ะ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
    >
      <div
        className="relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-stone-200/80 my-8 animate-scale-up"
      >
        <button
          onClick={handleClose}
          aria-label="ปิดหน้าต่าง"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-[#1E1B18] text-[11px] font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#BC4720]" />
              <span>พอร์ทัลสำหรับพนักงาน (Staff Portal)</span>
            </div>
            <h3 className="font-serif-thai text-2xl font-bold text-[#1E1B18]">
              เข้าสู่ระบบจัดการร้าน
            </h3>
            <p className="text-xs text-[#877E76] mt-1 font-light">
              จัดการรอบโต๊ะอาหาร ออเดอร์ในครัว และสต็อกเมนูแบบเรียลไทม์
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider block">
                อีเมลพนักงาน
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="เช่น staff@lamunros.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#BC4720]/30 focus:border-[#BC4720]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider block">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#BC4720]/30 focus:border-[#BC4720]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-[#1E1B18] hover:bg-[#BC4720] text-white font-medium text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังตรวจสอบสิทธิ์...</span>
                </>
              ) : (
                <span>เข้าสู่แดชบอร์ดพนักงาน</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

