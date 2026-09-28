import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, Plus, ChevronDown, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Navbar = ({ variant = 'landing' }) => {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isDashboard = variant === 'dashboard';

  const isActive = (path) => location.pathname === path;

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const LanguageSwitcher = () => (
    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 ml-2">
      <button 
        onClick={() => changeLanguage('vi')}
        className={`w-7 h-5 flex items-center justify-center rounded-sm overflow-hidden transition-all ${i18n.language === 'vi' ? 'ring-2 ring-brand-500 shadow-sm opacity-100' : 'opacity-50 hover:opacity-100 grayscale hover:grayscale-0'}`}
        title="Tiếng Việt"
      >
        <img src="https://flagcdn.com/w20/vn.png" alt="VN" className="w-full h-full object-cover" />
      </button>
      <button 
        onClick={() => changeLanguage('en')}
        className={`w-7 h-5 flex items-center justify-center rounded-sm overflow-hidden transition-all ${i18n.language === 'en' ? 'ring-2 ring-brand-500 shadow-sm opacity-100' : 'opacity-50 hover:opacity-100 grayscale hover:grayscale-0'}`}
        title="English"
      >
        <img src="https://flagcdn.com/w20/us.png" alt="EN" className="w-full h-full object-cover" />
      </button>
    </div>
  );

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
                    placeholder={t('nav.searchPlaceholder')}
                    className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
                  />
                </div>
              </div>

              {/* Nav links */}
              <div className="hidden md:flex items-center gap-6">
                <Link to="/" className="nav-link text-sm font-medium text-slate-600">{t('nav.findWork')}</Link>
                <Link to="/candidates" className="nav-link text-sm font-medium text-slate-600">{t('nav.hireDesigner')}</Link>
                <Link to="/job-postings" className="nav-link text-sm font-semibold text-brand-600">{t('nav.forBusinesses')}</Link>
              </div>

              {/* Right actions */}
              <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                
                <LanguageSwitcher />

                <button className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-600"></span>
                </button>

                <Link
                  to="/job-postings"
                  className="flex items-center gap-1.5 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-opacity hover:opacity-95 bg-gradient-to-r from-brand-600 to-indigo-600"
                >
                  <Plus className="w-4 h-4 stroke-[2.5px]" />
                  {t('nav.postJob')}
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
                <Link to="/" className="nav-link text-sm font-semibold text-brand-600">{t('nav.findWork')}</Link>
                <Link to="/candidates" className="nav-link text-sm font-medium text-slate-600">{t('nav.hireDesigner')}</Link>
                <Link to="/job-postings" className="nav-link text-sm font-medium text-slate-600">{t('nav.forBusinesses')}</Link>
                <div className="relative group">
                  <button className="nav-link text-sm font-medium text-slate-600 flex items-center gap-1">
                    {t('nav.resources')}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right actions */}
              <div className="hidden md:flex items-center gap-3">
                <LanguageSwitcher />

                <button>
                  <Search className="w-5 h-5 text-slate-500 hover:text-slate-700 transition-colors ml-2" />
                </button>
                <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors px-3 py-1.5">
                  {t('nav.login')}
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-semibold bg-gradient-to-r from-brand-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                >
                  {t('nav.signup')}
                </Link>
              </div>
            </>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <LanguageSwitcher />
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-500 hover:text-slate-700">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Sub-nav for dashboard - horizontal swipeable on mobile */}
        {isDashboard && (
          <div className="border-t border-slate-100 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4 sm:gap-6 h-11 overflow-x-auto whitespace-nowrap scrollbar-hide">
              <Link 
                to="/social" 
                className={`text-xs sm:text-sm pb-0.5 h-full flex items-center border-b-2 flex-shrink-0 ${isActive('/social') ? 'border-brand-600 text-brand-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'} transition-all`}
              >
                {t('nav.social')}
              </Link>
              <Link 
                to="/job-postings" 
                className={`text-xs sm:text-sm pb-0.5 h-full flex items-center border-b-2 flex-shrink-0 ${isActive('/job-postings') ? 'border-brand-600 text-brand-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'} transition-all`}
              >
                {t('nav.manageJobs')}
                <span className="ml-1.5 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full bg-brand-600 leading-none">6</span>
              </Link>
              <Link 
                to="/candidates" 
                className={`text-xs sm:text-sm pb-0.5 h-full flex items-center border-b-2 flex-shrink-0 ${isActive('/candidates') || location.pathname.startsWith('/job') ? 'border-brand-600 text-brand-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'} transition-all`}
              >
                {t('nav.candidates')}
              </Link>
              <Link 
                to="/interview" 
                className={`text-xs sm:text-sm pb-0.5 h-full flex items-center border-b-2 flex-shrink-0 ${isActive('/interview') ? 'border-brand-600 text-brand-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'} transition-all`}
              >
                {t('nav.messages')}
                <span className="ml-1.5 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full bg-brand-600 leading-none">3</span>
              </Link>
              <Link 
                to="/settings" 
                className={`text-xs sm:text-sm pb-0.5 h-full flex items-center border-b-2 flex-shrink-0 ${isActive('/settings') ? 'border-brand-600 text-brand-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'} transition-all`}
              >
                {t('nav.companySettings')}
              </Link>
            </div>
          </div>
        )}

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white/98 backdrop-blur-md shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-5 py-4 space-y-4">
              {isDashboard ? (
                <>
                  {/* Search on mobile */}
                  <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3.5 py-2.5">
                    <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder={t('nav.searchPlaceholder')}
                      className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
                    />
                  </div>

                  {/* Profile snippet on mobile */}
                  <div className="flex items-center gap-3 py-2 px-1 border-b border-slate-100">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenBao&backgroundColor=b6e3f4"
                      className="w-9 h-9 rounded-full bg-sky-100 border border-slate-200"
                      alt="Avatar"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-800">Nguyễn Bảo</p>
                      <p className="text-xs text-slate-500">HR Manager · ConnectCV</p>
                    </div>
                  </div>

                  {/* Quick post job button */}
                  <Link
                    to="/job-postings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow-sm bg-gradient-to-r from-brand-600 to-indigo-600 w-full"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5px]" />
                    {t('nav.postJob')}
                  </Link>

                  <div className="space-y-1 pt-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Navigation</p>
                    <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">{t('nav.findWork')}</Link>
                    <Link to="/candidates" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">{t('nav.hireDesigner')}</Link>
                    <Link to="/job-postings" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">{t('nav.forBusinesses')}</Link>
                    <Link to="/social" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">{t('nav.social')}</Link>
                    <Link to="/interview" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">{t('nav.messages')}</Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-semibold text-brand-600 bg-brand-50">{t('nav.findWork')}</Link>
                    <Link to="/candidates" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">{t('nav.hireDesigner')}</Link>
                    <Link to="/job-postings" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">{t('nav.forBusinesses')}</Link>
                    <Link to="/social" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">{t('nav.social')}</Link>
                    <Link to="/interview" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">{t('nav.messages')}</Link>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50">
                      {t('nav.login')}
                    </Link>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="text-center py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 rounded-xl shadow-sm">
                      {t('nav.signup')}
                    </Link>
                  </div>
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
