import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, Loader2 } from 'lucide-react';
import { askGemini } from '../api';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'สวัสดีค่ะ ยินดีต้อนรับสู่ละมุนรสค่ะ 🍲 วันนี้มีข้อสงสัยเกี่ยวกับเมนูอาหาร ระดับความเผ็ด หรือการสำรองโต๊ะ สอบถามน้องละมุนได้เลยนะคะ',
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // เลื่อนจอลงล่างสุดอัตโนมัติเมื่อมีข้อความใหม่
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // เตรียมประวัติการคุยส่งให้ AI
    const history = messages.map((m) => ({
      role: m.sender,
      parts: m.text,
    }));

    const botReply = await askGemini(userMsg.text, history);

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'bot',
      text: botReply,
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, botMsg]);
    setIsLoading(false);
  };

  const quickQuestions = [
    'มีเมนูอะไรแนะนำบ้าง?',
    'มีเมนูไม่เผ็ดไหม?',
    'ร้านเปิดกี่โมงและมีที่จอดรถไหม?',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* 1. ปุ่มไอคอนลอย (Floating Trigger Button) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="เปิดแชทกับน้องละมุน"
          className="group relative flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-[#1E1B18] hover:bg-[#BC4720] text-white shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer active:scale-95"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-amber-200" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </div>
          <span className="text-xs font-medium pr-1">สอบถามน้องละมุน</span>
        </button>
      )}

      {/* 2. หน้าต่างแชท (Chat Window) */}
      {isOpen && (
        <div className="w-[90vw] sm:w-[380px] h-[520px] bg-[#FBF9F5] rounded-3xl shadow-2xl border border-stone-200/80 flex flex-col overflow-hidden animate-scale-up">
          {/* Header */}
          <div className="p-4 bg-[#1E1B18] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#BC4720] flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-serif-thai text-sm font-bold text-white">น้องละมุน AI</h4>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-light border border-emerald-500/30">
                    ออนไลน์
                  </span>
                </div>
                <p className="text-[10px] text-stone-300 font-light">ผู้ช่วยสำรับไทยประจำร้านละมุนรส</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-warm-canvas">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-[#BC4720] text-white flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-3 h-3 text-amber-200" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#1E1B18] text-white rounded-br-xs'
                      : 'bg-white text-[#1E1B18] border border-stone-200/70 shadow-2xs rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      m.sender === 'user' ? 'text-stone-400' : 'text-stone-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-stone-400 text-xs pl-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#BC4720]" />
                <span className="font-light">น้องละมุนกำลังคิดคำตอบ...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Pills */}
          <div className="px-3 py-2 bg-stone-100/70 border-t border-stone-200/60 overflow-x-auto no-scrollbar flex gap-1.5">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-[#BC4720] hover:text-white border border-stone-200/80 text-[10px] text-[#4D4741] transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="พิมพ์คำถามที่นี่..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2 rounded-full bg-stone-50 border border-stone-200 text-xs text-[#1E1B18] placeholder-stone-400 focus:outline-none focus:border-[#BC4720] transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-8 h-8 rounded-full bg-[#1E1B18] hover:bg-[#BC4720] text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};