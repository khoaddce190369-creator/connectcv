import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, Plus, ChevronDown, Menu, X } from 'lucide-react';

const Navbar = ({ variant = 'landing' }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isDashboard = variant === 'dashboard';

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className={`max-w-7xl mx-auto px-6 h-16 flex items-center justify-between ${isDashboard ? 'gap-4' : ''}`}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm bg-gradient-to-br from-brand-600 to-indigo-600">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </div>
            <span className="font-sora font-bold text-slate-900 text-lg tracking-tight">
              Connect<span className="text-brand-600">CV</span>
            </span>
          </Link>

          {isDashboard ? (
            <>
              {/* Search bar */}
              <div className="hidden md:block flex-1 max-w-md">
                <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3.5 py-2 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:bg-white transition-all">
                  <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm tin tuyển dụng, kỹ năng, vị trí..."
                    className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
                  />
                </div>
              </div>

              {/* Nav links */}
              <div className="hidden md:flex items-center gap-6">
                <Link to="/" className="nav-link text-sm font-medium text-slate-600">Find Work</Link>
                <Link to="/candidates" className="nav-link text-sm font-medium text-slate-600">Hire a Designer</Link>
                <Link to="/job-postings" className="nav-link text-sm font-semibold text-brand-600">For Businesses</Link>
              </div>

              {/* Right actions */}
              <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                <button className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-600"></span>
                </button>

                <Link
                  to="/job-postings"
                  className="flex items-center gap-1.5 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-opacity hover:opacity-95 bg-gradient-to-r from-brand-600 to-indigo-600"
                >
                  <Plus className="w-4 h-4 stroke-[2.5px]" />
                  Đăng Tin Mới
                </Link>

                <div className="flex items-center gap-2 cursor-pointer pl-1">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenBao&backgroundColor=b6e3f4"
                    className="w-8 h-8 rounded-full bg-sky-100 border border-slate-100"
                    alt="Avatar"
                  />
                  <span className="hidden lg:block text-sm font-medium text-slate-700">Nguyễn Bảo (HR)</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Nav links */}
              <div className="hidden md:flex items-center gap-8">
                <Link to="/" className="nav-link text-sm font-semibold text-brand-600">Find Work</Link>
                <Link to="/candidates" className="nav-link text-sm font-medium text-slate-600">Hire a Designer</Link>
                <Link to="/job-postings" className="nav-link text-sm font-medium text-slate-600">For Businesses</Link>
                <div className="relative group">
                  <button className="nav-link text-sm font-medium text-slate-600 flex items-center gap-1">
                    Resources
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right actions */}
              <div className="hidden md:flex items-center gap-3">
                <button>
                  <Search className="w-5 h-5 text-slate-500 hover:text-slate-700 transition-colors" />
                </button>
                <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors px-3 py-1.5">
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-semibold bg-gradient-to-r from-brand-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            </>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-500 hover:text-slate-700">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Sub-nav for dashboard */}
        {isDashboard && (
          <div className="hidden md:block border-t border-slate-100 bg-white">
            <div className="max-w-7xl mx-auto px-6 flex items-center gap-6 h-11">
              <Link to="/social" className={`text-sm pb-0.5 h-full flex items-center border-b-2 ${isActive('/social') ? 'border-brand-600 text-brand-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'} transition-all`}>
                Social
              </Link>
              <Link to="/job-postings" className={`text-sm pb-0.5 h-full flex items-center border-b-2 ${isActive('/job-postings') ? 'border-brand-600 text-brand-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'} transition-all`}>
                Quản Lý Tin Tuyển Dụng
                <span className="ml-1.5 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full bg-brand-600 leading-none">6</span>
              </Link>
              <Link to="/candidates" className={`text-sm pb-0.5 h-full flex items-center border-b-2 ${isActive('/candidates') || location.pathname.startsWith('/job') ? 'border-brand-600 text-brand-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'} transition-all`}>
                Candidates / Freelancer
              </Link>
              <Link to="/interview" className={`text-sm pb-0.5 h-full flex items-center border-b-2 ${isActive('/interview') ? 'border-brand-600 text-brand-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'} transition-all`}>
                Tin Nhắn
                <span className="ml-1.5 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full bg-brand-600 leading-none">3</span>
              </Link>
              <Link to="#" className={`text-sm pb-0.5 h-full flex items-center border-b-2 ${isActive('/settings') ? 'border-brand-600 text-brand-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'} transition-all`}>
                Cài Đặt Công Ty
              </Link>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white">
            <div className="px-4 py-4 space-y-3 flex flex-col">
              {isDashboard ? (
                <>
                  <Link to="/social" className="text-sm font-medium text-slate-600">Social</Link>
                  <Link to="/job-postings" className="text-sm font-medium text-slate-600">Quản Lý Tin Tuyển Dụng</Link>
                  <Link to="/candidates" className="text-sm font-medium text-slate-600">Candidates / Freelancer</Link>
                  <Link to="/interview" className="text-sm font-medium text-slate-600">Tin Nhắn</Link>
                </>
              ) : (
                <>
                  <Link to="/" className="text-sm font-medium text-slate-600">Find Work</Link>
                  <Link to="/candidates" className="text-sm font-medium text-slate-600">Hire a Designer</Link>
                  <Link to="/job-postings" className="text-sm font-medium text-slate-600">For Businesses</Link>
                  <Link to="/login" className="text-sm font-medium text-slate-600">Log In</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      {/* Spacer to prevent content from going under fixed navbar */}
      <div className={isDashboard ? "h-[108px]" : "h-16"}></div>
    </>
  );
};

export default Navbar;
