import React, { useState, useEffect } from 'react';
import { Shield, Search, Heart, Home, Menu, X } from 'lucide-react';

type Role = 'ADMIN' | 'WARDEN' | 'STUDENT';

const Role = {
  ADMIN: 'ADMIN' as Role,
  WARDEN: 'WARDEN' as Role,
  STUDENT: 'STUDENT' as Role
};

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type HeaderProps = {
  user: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
};

const Header = ({ user, onNavigate, onLogout }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll for transparent/solid background transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerBg = scrolled 
    ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200' 
    : 'bg-white border-b border-slate-200';

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${headerBg}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer group" onClick={() => onNavigate('home')}>
            <div className="bg-white p-2.5 rounded-xl shadow-md group-hover:shadow-xl transition-all group-hover:scale-105">
              <img src="/images/UniLodge.png" alt="UniLodge Logo" className="h-6 w-6 object-contain" />
            </div>
            <div className="ml-3">
              <span className="block text-xl font-bold tracking-tight leading-none bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
                UniLodge
              </span>
              <span className="text-[9px] font-medium tracking-widest uppercase text-blue-600">
                Campus Systems
              </span>
            </div>
          </div>

          {/* Center Search - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Find your ideal campus room..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all hover:bg-white"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              // AUTHENTICATED STATE
              <>
                <a 
                  href="#" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    onNavigate(user.role === Role.ADMIN ? 'admin-dashboard' : user.role === Role.WARDEN ? 'warden-dashboard' : 'guest-dashboard'); 
                  }} 
                  className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
                >
                  Dashboard
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    onNavigate('my-bookings'); 
                  }} 
                  className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
                >
                  My Bookings
                </a>
                <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user.role}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {user.name.charAt(0)}
                  </div>
                  <button 
                    onClick={onLogout} 
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-md hover:shadow-lg text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              // LOGGED-OUT STATE
              <>
                <a 
                  href="#" 
                  className="flex items-center text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
                >
                  <Heart className="h-4 w-4 mr-1.5" />
                  Saved
                </a>
                <a 
                  href="#" 
                  className="flex items-center text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
                >
                  <Home className="h-4 w-4 mr-1.5" />
                  Browse
                </a>
                <button 
                  onClick={() => onNavigate('login')} 
                  className="px-5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => onNavigate('login')} 
                  className="px-6 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  List a Room
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-20 bg-white border-b border-slate-200 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search rooms..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {user ? (
                // AUTHENTICATED MOBILE MENU
                <>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">{user.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      onNavigate(user.role === Role.ADMIN ? 'admin-dashboard' : user.role === Role.WARDEN ? 'warden-dashboard' : 'guest-dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-base font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={(e) => {
                      onNavigate('my-bookings');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-base font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                  >
                    My Bookings
                  </button>
                  <button 
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-md text-center"
                  >
                    Logout
                  </button>
                </>
              ) : (
                // LOGGED-OUT MOBILE MENU
                <>
                  <a href="#" className="flex items-center px-4 py-3 text-base font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                    <Heart className="h-5 w-5 mr-3" />
                    Saved Rooms
                  </a>
                  <a href="#" className="flex items-center px-4 py-3 text-base font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                    <Home className="h-5 w-5 mr-3" />
                    Browse Homes
                  </a>
                  <button 
                    onClick={() => {
                      onNavigate('login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-center border border-slate-200"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => {
                      onNavigate('login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-6 py-3.5 text-base font-bold rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg text-center"
                  >
                    List a Room
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;