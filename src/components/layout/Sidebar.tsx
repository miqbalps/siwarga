import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, MessageSquareShare, User, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useState, useEffect } from "react";

interface SidebarProps {
  user: any;
}

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function Sidebar({ user }: SidebarProps) {
  const location = useLocation();
  const [counts, setCounts] = useState({ letters: 0, complaints: 0 });
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN_KELURAHAN";

  useEffect(() => {
    Promise.all([
      fetch("/api/letters", { headers: authHeader() }).then((r) => r.json()),
      fetch("/api/complaints", { headers: authHeader() }).then((r) => r.json()),
    ]).then(([letters, complaints]) => {
      const pendingLetters = Array.isArray(letters) ? letters.filter((l: any) => l.status === "PENDING").length : 0;
      const pendingComplaints = Array.isArray(complaints) ? complaints.filter((c: any) => c.status === "PENDING").length : 0;
      setCounts({ letters: pendingLetters, complaints: pendingComplaints });
    }).catch(console.error);
  }, []);

  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Pelayanan Surat", path: "/letters", icon: FileText, badge: counts.letters || undefined },
    { name: "Pengaduan", path: "/complaints", icon: MessageSquareShare, badge: counts.complaints || undefined },
    { name: "Profil Saya", path: "/profile", icon: User },
  ];

  const adminItems = [
    { name: "Manajemen Pengguna", path: "/users", icon: Users },
  ];

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN_KELURAHAN: "Admin Kelurahan",
    PETUGAS: "Petugas Lapangan",
    WARGA: "Member",
  };

  return (
    <aside className="w-64 bg-admin-sidebar flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-admin-sidebar-border shadow-sm">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3 shadow-inner">
          <span className="text-white font-bold text-xs">SW</span>
        </div>
        <span className="text-[#c2c7d0] font-semibold tracking-tight text-lg">SIWARGA</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-admin-sidebar-border text-[10px] uppercase font-bold px-3 mb-2 tracking-wider">Navigasi Utama</div>
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
              {item.badge ? (
                <span className={cn(
                  "ml-auto text-[10px] px-1.5 rounded-full text-white",
                  item.name === "Pengaduan" ? "bg-red-500" : "bg-blue-500"
                )}>
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}

        {isAdmin && (
          <div className="mt-8">
            <div className="text-admin-sidebar-border text-[10px] uppercase font-bold px-3 mb-2 tracking-wider">Administrasi</div>
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
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=6c757d&color=fff`} alt="user" />
          </div>
          <div className="flex flex-col">
            <span className="text-white text-xs font-bold truncate max-w-[140px]">{user?.name || "User"}</span>
            <span className="text-[#c2c7d0] text-[10px] flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
              {roleLabel[user?.role] || "Online"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
