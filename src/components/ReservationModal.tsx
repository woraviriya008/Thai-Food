import React, { useState } from 'react';
import { X, Calendar, Clock, Users, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { ReservationData } from '../types';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReservationSuccess: (data: ReservationData) => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  onReservationSuccess,
}) => {
  const [formData, setFormData] = useState<ReservationData>({
    name: '',
    phone: '',
    guests: 2,
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    zone: 'โถงเรือนไทยโบราณ (Heritage Main Hall)',
    specialRequest: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      onReservationSuccess(formData);
      setIsSubmitted(false);
      onClose();
    }, 2200);
  };

  const zones = [
    'โถงเรือนไทยโบราณ (Heritage Main Hall)',
    'ห้องกระจกริมสวนบัว (Lotus Garden Veranda)',
    'ห้องรับรองส่วนตัว (Private Heritage Suite)',
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-[#2A2421]/10 my-8 animate-scale-up"
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

        {isSubmitted ? (
          <div className="p-8 sm:p-12 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-serif-thai text-2xl font-bold text-[#2A2421]">
              สำรองโต๊ะสำเร็จแล้ว
            </h3>
            <p className="text-sm text-[#60554E] max-w-sm mx-auto leading-relaxed">
              ขอขอบพระคุณ <strong>{formData.name}</strong> ทางร้านละมุนรสได้รับข้อมูลการสำรองโต๊ะสำหรับ {formData.guests} ท่าน ในวันที่ {formData.date} เวลา {formData.time} น. เรียบร้อยแล้ว
            </p>
            <div className="p-3 bg-[#FAF8F5] rounded-xl text-xs text-[#8A7E77] border border-[#2A2421]/6">
              เจ้าหน้าที่จะส่ง SMS ยืนยันไปยังเบอร์ {formData.phone} ในลำดับถัดไป
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 sm:p-8 bg-gradient-to-b from-[#FBEFEA] to-white border-b border-[#2A2421]/6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C85A32] text-white text-[11px] font-semibold mb-2">
                <Sparkles className="w-3 h-3 text-amber-200" />
                <span>สำรองที่นั่งล่วงหน้า</span>
              </span>
              <h3 className="font-serif-thai text-2xl sm:text-3xl font-bold text-[#2A2421]">
                สัมผัสมื้อพิเศษที่ ละมุนรส
              </h3>
              <p className="text-xs sm:text-sm text-[#8A7E77] mt-1">
                เปิดบริการทุกวัน 10:30 - 21:30 น. (กรุณาจองล่วงหน้าอย่างน้อย 2 ชั่วโมง)
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2A2421] uppercase tracking-wider">
                    ชื่อผู้สำรอง *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="เช่น คุณวรวรรณ ศิริพงษ์"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32]/30 focus:border-[#C85A32]"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2A2421] uppercase tracking-wider">
                    เบอร์โทรศัพท์ติดต่อ *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08x-xxx-xxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32]/30 focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Guests */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2A2421] uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>จำนวนที่นั่ง</span>
                  </label>
                  <select
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C85A32]/30"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                      <option key={num} value={num}>
                        {num} ท่าน
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2A2421] uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>วันที่</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32]/30"
                  />
                </div>

                {/* Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2A2421] uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>เวลา</span>
                  </label>
                  <select
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C85A32]/30"
                  >
                    {['11:00', '12:00', '13:00', '17:30', '18:00', '19:00', '20:00'].map((t) => (
                      <option key={t} value={t}>
                        {t} น.
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Seating Zone Preference */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2A2421] uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>โซนที่นั่งที่ต้องการ</span>
                </label>
                <select
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C85A32]/30"
                >
                  {zones.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Special Request */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2A2421] uppercase tracking-wider">
                  คำขอพิเศษเพิ่มเติม (ถ้ามี)
                </label>
                <textarea
                  rows={2}
                  value={formData.specialRequest}
                  onChange={(e) => setFormData({ ...formData, specialRequest: e.target.value })}
                  placeholder="เช่น มื้อวันเกิด, ต้องการเก้าอี้เสริมสำหรับเด็ก, แพ้อาหาร..."
                  className="w-full p-3 rounded-xl border border-stone-200 text-xs text-[#2A2421] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C85A32]/30"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#C85A32] hover:bg-[#B24B25] text-white font-medium text-sm shadow-md shadow-[#C85A32]/25 transition-all cursor-pointer active:scale-98"
              >
                ยืนยันการสำรองโต๊ะ
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

