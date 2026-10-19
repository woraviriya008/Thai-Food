import React from 'react';
import { ArrowDown, Sparkles } from 'lucide-react';

interface HeroProps {
  onExploreMenu: () => void;
  onOpenReservation: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreMenu, onOpenReservation }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 border-b border-stone-200/60 bg-warm-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Text Column: Editorial & Eye-comfort */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            {/* Minimal Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100/90 border border-stone-200/80 text-[11px] font-medium text-[#4D4741] tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BC4720]"></span>
              <span>สำรับไทยโบราณร่วมสมัย • ปรุงสดจานต่อจาน</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif-thai text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#1E1B18] leading-[1.2] tracking-tight">
              สุนทรียรสแห่งสำรับไทย <br className="hidden sm:inline" />
              <span className="font-light italic text-[#BC4720]">ละมุนทุกสัมผัส</span> อบอุ่นใจ
            </h1>

            {/* Paragraph */}
            <p className="text-[#6A635B] text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              ร้อยเรียงรสชาติอาหารไทยต้นตำรับด้วยความประณีต 
              คัดสรรพริกแกงตำมือ กะทิคั้นสดใหม่ และสมุนไพรอินทรีย์พื้นถิ่น 
              เสิร์ฟท่ามกลางบรรยากาศที่เรียบง่าย สบายตา และผ่อนคลาย
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onExploreMenu}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#1E1B18] hover:bg-[#BC4720] text-[#FBF9F5] text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer shadow-xs active:scale-97"
              >
                <span>เลือกชมสำรับอาหาร</span>
                <ArrowDown className="w-3.5 h-3.5 text-stone-300" />
              </button>

              <button
                onClick={onOpenReservation}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-stone-50 border border-stone-300 text-[#1E1B18] text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-2xs"
              >
                <span>สำรองโต๊ะล่วงหน้า</span>
              </button>
            </div>

            {/* Subdued Editorial Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-stone-200/60 max-w-lg mx-auto lg:mx-0">
              <div className="space-y-1">
                <span className="font-serif-thai text-2xl font-bold text-[#1E1B18] block">๑๐๐%</span>
                <span className="text-xs text-[#877E76] block font-light">พริกแกงโขลกสด</span>
              </div>
              <div className="space-y-1">
                <span className="font-serif-thai text-2xl font-bold text-[#1E1B18] block">คั้นสด</span>
                <span className="text-xs text-[#877E76] block font-light">กะทิแท้ไม่ผสมน้ำ</span>
              </div>
              <div className="space-y-1">
                <span className="font-serif-thai text-2xl font-bold text-[#1E1B18] block">ชาววัง</span>
                <span className="text-xs text-[#877E76] block font-light">รสแท้ไร้ผงชูรส</span>
              </div>
            </div>
          </div>

          {/* Right Visual Column: Minimalist Fine Framing */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative card */}
              <div className="relative rounded-[2rem] overflow-hidden bg-white p-3 shadow-soft-card border border-stone-200/70">
                <div className="relative rounded-[1.4rem] overflow-hidden aspect-[4/5] bg-stone-100">
                  <img
                    src="https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=1200&q=80"
                    alt="ต้มยำกุ้งแม่น้ำน้ำข้นโบราณ ละมุนรส"
                    className="w-full h-full object-cover transform hover:scale-104 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  
                  {/* Floating Tag */}
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-medium tracking-wide uppercase mb-2">
                      <Sparkles className="w-3 h-3 text-amber-200" />
                      <span>Signature สำรับเอก</span>
                    </span>
                    <h3 className="font-serif-thai text-xl font-bold text-white">
                      ต้มยำกุ้งแม่น้ำน้ำข้นโบราณ
                    </h3>
                    <p className="text-xs text-stone-200/90 mt-1 line-clamp-1 font-light">
                      มันกุ้งเยิ้ม หอมเครื่องสมุนไพร ข่า ตะไคร้ ใบมะกรูด
                    </p>
                  </div>
                </div>
              </div>

              {/* Minimal floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-[#FBF9F5] p-3.5 rounded-2xl shadow-soft-card border border-stone-200/80 hidden sm:flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EEF4F0] text-[#3D5943] flex items-center justify-center text-xs font-semibold">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#1E1B18]">วัตถุดิบอินทรีย์ 100%</div>
                  <div className="text-[11px] text-[#877E76] font-light">ส่งตรงจากสวนเกษตรกรไทย</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
