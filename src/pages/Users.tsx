import { Search, ShieldCheck, Trash2, UserCog } from "lucide-react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function UsersPage({ user }: { user: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const fetchUsers = () => {
    fetch("/api/users", { headers: authHeader() })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setUsers(data); })
      .catch(console.error);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChangeRole = async (id: string, currentRole: string) => {
    const { value: role } = await Swal.fire({
      title: "Ubah Role Pengguna",
      input: "select",
      inputOptions: { WARGA: "Warga", PETUGAS: "Petugas", ADMIN_KELURAHAN: "Admin Kelurahan", SUPER_ADMIN: "Super Admin" },
      inputValue: currentRole,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#2563EB",
    });
    if (role) {
      const res = await fetch(`/api/users/${id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ role }),
      });
      if (res.ok) { Swal.fire({ icon: "success", title: "Role diperbarui", timer: 1500, showConfirmButton: false }); fetchUsers(); }
      else Swal.fire("Gagal", "Gagal mengubah role", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const { isConfirmed } = await Swal.fire({
      title: "Hapus Pengguna?",
      text: "Data pengguna akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#EF4444",
    });
    if (isConfirmed) {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE", headers: authHeader() });
      if (res.ok) { Swal.fire({ icon: "success", title: "Dihapus!", timer: 1500, showConfirmButton: false }); fetchUsers(); }
      else { const e = await res.json(); Swal.fire("Gagal", e.message || "Gagal menghapus", "error"); }
    }
  };

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
    ADMIN_KELURAHAN: "bg-blue-100 text-blue-700 border-blue-200",
    PETUGAS: "bg-yellow-100 text-yellow-700 border-yellow-200",
    WARGA: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const filtered = users.filter((u) =>
    search === "" ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.nik?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Manajemen Pengguna</h2>
          <p className="text-xs text-gray-500">Kelola akun dan hak akses pengguna sistem</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama, email, atau NIK..." className="w-full pl-10 pr-4 py-1.5 bg-white border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">NIK</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Telepon</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Role</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Bergabung</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length > 0 ? filtered.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=EBF4FF&color=3B82F6&size=64&bold=true`} alt="" className="w-full h-full" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-xs text-gray-500">{u.email}</td>
                  <td className="px-6 py-3 text-xs font-mono text-gray-400">{u.nik || "-"}</td>
                  <td className="px-6 py-3 text-xs text-gray-500">{u.phoneNumber || "-"}</td>
                  <td className="px-6 py-3 text-center">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${roleColors[u.role] || roleColors.WARGA}`}>{u.role}</span>
                  </td>
                  <td className="px-6 py-3 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString("id-ID")}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end space-x-1">
                      <button onClick={() => handleChangeRole(u.id, u.role)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors" title="Ubah Role"><UserCog className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors" title="Hapus"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">Tidak ada pengguna ditemukan</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Menampilkan {filtered.length} dari {users.length} pengguna</span>
        </div>
      </div>
    </div>
  );
}
