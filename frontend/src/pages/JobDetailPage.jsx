import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Plus, Briefcase, ChevronDown, ArrowLeft, Heart, Zap, MapPin, CheckCircle, Clock } from 'lucide-react';

export default function JobDetailPage() {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen font-inter">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
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
            <Link to="/interview" className="text-sm text-slate-500 hover:text-slate-700 pb-0.5 h-full flex items-center border-b-2 border-transparent transition-all">
              Tin Nhắn <span className="ml-1.5 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full bg-blue-600">3</span>
            </Link>
            <Link to="/settings" className="text-sm text-slate-500 hover:text-slate-700 pb-0.5 h-full flex items-center border-b-2 border-transparent transition-all">Cài Đặt Công Ty</Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 pt-36 pb-16">
        <Link to="/candidates" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-5">
          <ArrowLeft className="w-4 h-4" />
          Back to search
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Main */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm bg-gradient-to-br from-indigo-500 to-violet-500">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="font-sora text-xl font-bold text-slate-900 mb-1">Senior UI/UX Designer</h1>
                      <p className="text-sm text-slate-500">NovaTech</p>
                    </div>
                    <button className="text-slate-400 hover:text-red-500 transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 py-4 border-t border-b border-slate-100 mb-4">
                <span className="flex items-center gap-1.5 text-xs font-semibold bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full">
                  <MapPin className="w-3 h-3" />
                  Remote
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                  Full-time
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                  $1,500 – $2,500 / month
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Posted 2 days ago
                </span>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-0 border-b border-slate-100 -mx-6 px-6">
                {["Overview", "Skills", "Company", "Similar Jobs"].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 pb-3 text-sm transition-all border-b-2 font-medium ${activeTab === tab ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* About section */}
            {activeTab === "Overview" && (
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-[fadeIn_0.2s_ease-out]">
                <h2 className="font-sora font-bold text-slate-900 text-base mb-3">About the job</h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-5">NovaTech is looking for a Senior UI/UX Designer to join our product team. You will be responsible for designing intuitive and visually appealing experiences for our web and mobile products.</p>
                
                <h3 className="font-sora font-bold text-slate-900 text-sm mb-3">Responsibilities</h3>
                <ul className="space-y-2 mb-5">
                  {[
                    "Design user interfaces for web and mobile applications",
                    "Collaborate with product managers and developers",
                    "Conduct user research and usability testing",
                    "Create design systems and maintain consistency"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-blue-600"></div>
                      {item}
                    </li>
                  ))}
                </ul>
                
                <h3 className="font-sora font-bold text-slate-900 text-sm mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {[
                    "3+ years of UI/UX design experience",
                    "Proficiency in Figma, Adobe XD or similar tools",
                    "Strong portfolio demonstrating UX process",
                    "Experience with design systems and component libraries"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">
            {/* Company Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-indigo-500 to-violet-500">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <p className="font-sora font-bold text-sm text-slate-900">NovaTech</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">We build modern digital products that make a difference.</p>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> 51–200 employees
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-slate-400" /> Software Development
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Vietnam
                </div>
              </div>
              <div className="border-t border-slate-100 mt-4 pt-4">
                <p className="text-xs text-slate-500 mb-3">Posted by</p>
                <div className="flex items-center gap-2.5 mb-4">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=EmmaCarter&backgroundColor=ffd5dc" className="w-8 h-8 rounded-full bg-pink-100" alt="Emma Carter" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Emma Carter</p>
                    <p className="text-xs text-slate-500">Hiring Manager</p>
                  </div>
                </div>
                <button className="w-full border-2 border-blue-200 text-blue-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-50 transition-colors">
                  Message
                </button>
              </div>
            </div>

            {/* Apply CTA */}
            <div className="rounded-2xl p-5 text-white shadow-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <h3 className="font-sora font-bold text-base mb-1">Ready to apply?</h3>
              <p className="text-blue-100 text-xs mb-4">Let AI create a tailored CV for this role and auto-apply on your behalf.</p>
              <button className="w-full bg-white text-blue-700 text-sm font-bold py-2.5 rounded-xl hover:bg-blue-50 transition-colors shadow-sm mb-2">
                ✨ AI Auto-Apply
              </button>
              <button className="w-full border border-white/30 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-white/10 transition-colors">
                Apply Manually
              </button>
            </div>

            {/* Required Skills */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h3 className="font-sora font-bold text-sm text-slate-900 mb-3">Required skills</h3>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-semibold bg-pink-50 text-pink-700 px-2.5 py-1.5 rounded-lg">Figma</span>
                <span className="text-xs font-semibold bg-violet-50 text-violet-700 px-2.5 py-1.5 rounded-lg">UI/UX Design</span>
                <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1.5 rounded-lg">Prototyping</span>
                <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg">User Research</span>
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-lg">Design Systems</span>
              </div>
            </div>

            {/* AI Match */}
            <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-sora font-bold text-sm text-slate-900">AI Match Score</h3>
                <span className="text-lg font-extrabold text-emerald-600 font-sora">92%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600" style={{ width: '92%' }}></div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Strong fit on design skills, experience level, and remote work preference.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
