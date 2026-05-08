import { Bell, Search, User, LogOut, Menu, Moon, Sun, Settings } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center">
        <button className="md:hidden p-2 text-gray-500 mr-4 hover:bg-gray-50 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center text-sm font-medium text-gray-400">
           <span>Dashboard</span>
           <span className="mx-2">/</span>
           <span className="text-gray-900">Ringkasan Pelayanan Publik</span>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative cursor-pointer group">
          <Bell className="w-5 h-5 text-gray-500 hover:text-blue-600 transition-colors" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold shadow-sm">4</span>
        </div>
        
        <button className="hidden sm:flex px-4 py-1.5 bg-[#f8f9fa] border border-gray-200 rounded text-[10px] font-bold uppercase tracking-wider text-gray-600 items-center hover:bg-gray-100 transition-colors">
          Cloud Server: Active
          <div className="w-2 h-2 rounded-full bg-green-500 ml-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
        </button>

        <div className="h-8 w-px bg-gray-100 hidden sm:block"></div>

        <div className="relative group">
           <button className="flex items-center space-x-3 focus:outline-none">
              <div className="flex flex-col text-right hidden sm:flex">
                 <span className="text-gray-900 text-xs font-bold leading-none">{user?.name || "Admin"}</span>
                 <span className="text-gray-400 text-[10px] font-semibold mt-1 uppercase tracking-tight">{user?.role || "Warga"}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-gray-200 border-2 border-gray-100 overflow-hidden shadow-sm hover:border-blue-300 transition-all">
                 <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=EBF4FF&color=3B82F6&bold=true`} 
                    alt="avatar" 
                 />
              </div>
           </button>
           <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all transform origin-top-right scale-95 group-hover:scale-100">
              <div className="px-4 py-2 border-b border-gray-50 mb-1">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Signed in as</p>
                 <p className="text-xs font-bold text-gray-900 truncate">{user?.email || "user@kelurahan.go.id"}</p>
              </div>
              <button className="flex items-center w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 font-medium">
                <User className="w-3.5 h-3.5 mr-3 text-gray-400" />
                Profil Saya
              </button>
              <button className="flex items-center w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 font-medium">
                <Settings className="w-3.5 h-3.5 mr-3 text-gray-400" />
                Pengaturan Akun
              </button>
              <div className="border-t border-gray-50 my-1"></div>
              <button 
                onClick={onLogout}
                className="flex items-center w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-bold"
              >
                <LogOut className="w-3.5 h-3.5 mr-3" />
                Keluar [Logout]
              </button>
           </div>
        </div>
      </div>
    </header>
  );
}
