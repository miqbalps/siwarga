import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, MessageSquareShare, User, Settings, LogOut, ShieldCheck, Database } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface SidebarProps {
  user: any;
}

export default function Sidebar({ user }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Pelayanan Surat", path: "/letters", icon: FileText, badge: 12 },
    { name: "Pengaduan", path: "/complaints", icon: MessageSquareShare, badge: 8 },
    { name: "Profil Saya", path: "/profile", icon: User },
  ];

  const adminItems = [
     { name: "Master Data", path: "/master", icon: Database },
     { name: "User Management", path: "/users", icon: ShieldCheck },
     { name: "System Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-admin-sidebar flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-admin-sidebar-border shadow-sm">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3 shadow-inner">
          <span className="text-white font-bold text-xs">SW</span>
        </div>
        <span className="text-[#c2c7d0] font-semibold tracking-tight text-lg">SIWARGA</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-admin-sidebar-border text-[10px] uppercase font-bold px-3 mb-2 tracking-wider">Main Navigation</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 rounded-md transition-colors",
                isActive 
                  ? "bg-blue-600 text-white" 
                  : "text-[#c2c7d0] hover:bg-admin-sidebar-hover hover:text-white"
              )}
            >
              <Icon className={cn("w-4 h-4 mr-3", isActive ? "text-white" : "text-[#c2c7d0]")} />
              <span className="text-sm font-medium">{item.name}</span>
              {item.badge && (
                <span className={cn(
                  "ml-auto text-[10px] px-1.5 rounded-full",
                  item.name === "Pengaduan" ? "bg-red-500" : "bg-blue-500"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {user?.role === "SUPER_ADMIN" && (
          <div className="mt-8">
            <div className="text-admin-sidebar-border text-[10px] uppercase font-bold px-3 mb-2 tracking-wider">Data Master</div>
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md transition-colors",
                    isActive 
                      ? "bg-blue-600 text-white" 
                      : "text-[#c2c7d0] hover:bg-admin-sidebar-hover hover:text-white"
                  )}
                >
                  <Icon className={cn("w-4 h-4 mr-3", isActive ? "text-white" : "text-[#c2c7d0]")} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-admin-sidebar-border">
        <div className="flex items-center">
          <div className="w-9 h-9 rounded-full bg-gray-400 mr-3 border-2 border-admin-sidebar-border overflow-hidden">
             <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Admin")}&background=6c757d&color=fff`} alt="user" />
          </div>
          <div className="flex flex-col">
            <span className="text-white text-xs font-bold">{user?.role === 'WARGA' ? 'Member' : 'Petugas Kelurahan'}</span>
            <span className="text-[#c2c7d0] text-[10px] flex items-center">
               <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
               Online
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
