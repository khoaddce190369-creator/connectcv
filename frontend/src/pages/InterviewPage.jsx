import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Plus, Briefcase, ChevronDown, Check, Mic, Send, Zap } from 'lucide-react';
import { candidates } from '../data/mockData.js'; // Using local mock if needed

export default function InterviewPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: "How do you approach designing a user flow for a complex product? Can you walk me through your process?",
      tags: ["Technical Question", "UI/UX"]
    },
    {
      id: 2,
      type: 'user',
      text: "Great question! When designing a user flow for a complex product, I usually follow these steps:\n1. Understand the goal: Identify the main user goal and business objectives.\n2. Research: Analyze target users, needs, and pain points.\n3. Ideate & sketch: Create multiple flow options and wireframes...",
      time: "Just now"
    },
    {
      id: 3,
      type: 'ai',
      text: "Great structured approach! Tell me more about your Research step — what tools and methods do you use?",
      quickReplies: ["💡 Talk about user interviews", "📊 Mention usability testing"]
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const newUserMsg = {
      id: Date.now(),
      type: 'user',
      text: inputValue,
      time: "Just now"
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        text: "That's a solid answer! Can you share a specific example from a past project and what was the biggest challenge?",
        tags: ["Follow-up"]
      }]);
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = (text) => {
    setInputValue(text);
    setTimeout(handleSend, 100); // Wait for state update
  };

  return (
    <div className="bg-slate-50 text-slate-800 h-screen flex flex-col font-inter">
      {/* Navbar */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm flex-shrink-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm bg-gradient-to-br from-blue-600 to-indigo-600">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-sora font-bold text-slate-900 text-lg tracking-tight">Connect<span className="text-blue-600">CV</span></span>
          </Link>
          <div className="flex-1 max-w-md hidden md:block">
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3.5 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input type="text" placeholder="Tìm kiếm tin tuyển dụng, kỹ năng, vị trí..." className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full" />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Find Work</Link>
            <Link to="/candidates" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Hire a Designer</Link>
            <Link to="/applications" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">For Businesses</Link>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600"></span>
            </button>
            <Link to="/applications" className="hidden sm:flex items-center gap-1.5 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-opacity hover:opacity-95 bg-gradient-to-r from-blue-600 to-indigo-600">
              <Plus className="w-4 h-4" />
              + Đăng Tin Mới
            </Link>
            <div className="flex items-center gap-2 cursor-pointer pl-1">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenBao&backgroundColor=b6e3f4" className="w-8 h-8 rounded-full bg-sky-100 border border-slate-100" alt="Avatar" />
              <span className="hidden lg:block text-sm font-medium text-slate-700">Nguyễn Bảo (HR)</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-6 h-11 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <Link to="/social" className="text-sm text-slate-500 hover:text-slate-700 pb-0.5 h-full flex items-center border-b-2 border-transparent transition-all">Social</Link>
            <Link to="/applications" className="text-sm text-slate-500 hover:text-slate-700 pb-0.5 h-full flex items-center border-b-2 border-transparent transition-all">
              Quản Lý Tin Tuyển Dụng <span className="ml-1.5 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full bg-blue-600">6</span>
            </Link>
            <Link to="/candidates" className="text-sm text-slate-500 hover:text-slate-700 pb-0.5 h-full flex items-center border-b-2 border-transparent transition-all">Candidates / Freelancer</Link>
            <Link to="/interview" className="text-sm font-semibold text-blue-600 pb-0.5 h-full flex items-center border-b-2 border-blue-600 transition-all">
              Tin Nhắn <span className="ml-1.5 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full bg-blue-600">3</span>
            </Link>
            <Link to="/settings" className="text-sm text-slate-500 hover:text-slate-700 pb-0.5 h-full flex items-center border-b-2 border-transparent transition-all">Cài Đặt Công Ty</Link>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden h-full">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-slate-100 flex flex-col overflow-y-auto flex-shrink-0 p-5 hidden md:flex">
          <div className="mb-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Interview for</p>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-indigo-500 to-violet-500">
                <Zap className="w-[18px] h-[18px] text-white" />
              </div>
              <div>
                <p className="font-sora font-bold text-sm text-slate-900">Senior UI/UX Designer</p>
                <p className="text-xs text-slate-500">NovaTech</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-xs bg-sky-50 text-sky-700 font-semibold px-2.5 py-1 rounded-full">Remote</span>
              <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full">Full-time</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 relative">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Interview Stages</p>
            <div className="space-y-0">
              <div className="relative pl-9 pb-5">
                <div className="absolute left-[13px] top-[28px] bottom-0 w-0.5 bg-slate-200"></div>
                <div className="absolute left-0 w-7 h-7 rounded-full bg-emerald-50 border-2 border-emerald-400 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={3} />
                </div>
                <p className="text-sm text-slate-500 font-medium pt-1">Introduction</p>
              </div>
              <div className="relative pl-9 pb-5">
                <div className="absolute left-[13px] top-[28px] bottom-0 w-0.5 bg-slate-200"></div>
                <div className="absolute left-0 w-7 h-7 rounded-full bg-blue-50 border-2 border-blue-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <p className="text-sm font-semibold text-blue-600 pt-1">Technical Questions</p>
              </div>
              <div className="relative pl-9 pb-5">
                <div className="absolute left-[13px] top-[28px] bottom-0 w-0.5 bg-slate-200"></div>
                <div className="absolute left-0 w-7 h-7 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center">
                  <span className="text-xs text-slate-400 font-medium">3</span>
                </div>
                <p className="text-sm text-slate-400 pt-1">Behavioral Questions</p>
              </div>
              <div className="relative pl-9">
                <div className="absolute left-0 w-7 h-7 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center">
                  <span className="text-xs text-slate-400 font-medium">4</span>
                </div>
                <p className="text-sm text-slate-400 pt-1">Wrap Up</p>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 font-medium">Progress</p>
              <p className="text-xs font-bold text-blue-600">50%</p>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 w-1/2"></div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          <div className="bg-white border-b border-slate-100 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-sora text-lg font-bold text-slate-900">AI Interview Assistant</h1>
                <p className="text-sm text-slate-500">Practice with AI after your CV is screened.</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                AI Active
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : ''} animate-[fadeIn_0.3s_ease-out]`}>
                {msg.type === 'ai' && (
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm bg-gradient-to-br from-blue-600 to-indigo-600">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`flex-1 ${msg.type === 'user' ? 'flex justify-end' : ''}`}>
                  {msg.type === 'ai' && (
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-slate-700">AI Interviewer</span>
                      {msg.tags?.map((tag, idx) => (
                        <span key={idx} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${idx === 0 ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-700'}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className={`max-w-xl ${msg.type === 'user' ? 'text-right' : ''}`}>
                    <div className={`p-4 shadow-sm ${msg.type === 'user' ? 'bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl rounded-tr-none text-white' : 'bg-white rounded-2xl rounded-tl-none border border-slate-100 text-slate-800'}`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      {msg.quickReplies && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {msg.quickReplies.map((reply, idx) => (
                            <button 
                              key={idx}
                              onClick={() => handleQuickReply(reply)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors border bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                            >
                              {reply}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {msg.type === 'user' && msg.time && (
                      <p className="text-xs text-slate-400 mt-1">{msg.time}</p>
                    )}
                  </div>
                </div>
                {msg.type === 'user' && (
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenBao&backgroundColor=b6e3f4" className="w-8 h-8 rounded-xl bg-sky-100 flex-shrink-0" alt="User" />
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 animate-[fadeIn_0.3s_ease-out]">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm bg-gradient-to-br from-blue-600 to-indigo-600">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-none p-3 px-4 shadow-sm border border-slate-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400 block animate-[bounce_1.4s_infinite]"></span>
                  <span className="w-2 h-2 rounded-full bg-slate-400 block animate-[bounce_1.4s_infinite_0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-slate-400 block animate-[bounce_1.4s_infinite_0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-white border-t border-slate-100 p-4 flex-shrink-0">
            <div className="flex items-end gap-3 max-w-4xl mx-auto">
              <div className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 flex items-end gap-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all border border-transparent focus-within:border-slate-200">
                <textarea 
                  placeholder="Type your answer..." 
                  rows={1}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none resize-none leading-relaxed max-h-[120px]"
                />
                <button className="text-slate-400 hover:text-slate-600 transition-colors p-1 flex-shrink-0">
                  <Mic className="w-5 h-5" />
                </button>
              </div>
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-br from-blue-600 to-indigo-600"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
