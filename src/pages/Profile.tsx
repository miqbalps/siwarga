import { User, Mail, Phone, Lock, ShieldCheck, Save } from "lucide-react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function Profile({ user }: { user: any }) {
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    fetch("/api/auth/me", { headers: authHeader() })
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setName(data.name || "");
        setPhone(data.phoneNumber || "");
        setAddress(data.address || "");
      })
      .catch(console.error);
  }, []);

  const handleSaveProfile = async () => {
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ name, phoneNumber: phone, address }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        // update localStorage too
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        storedUser.name = updated.name;
        localStorage.setItem("user", JSON.stringify(storedUser));
        Swal.fire({ icon: "success", title: "Profil diperbarui", timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire("Gagal", "Gagal memperbarui profil", "error");
      }
    } catch {
      Swal.fire("Error", "Gagal menghubungi server", "error");
    }
  };

  const handleChangePassword = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Ubah Password",
      html:
        '<input id="swal-old" type="password" class="swal2-input" placeholder="Password Lama">' +
        '<input id="swal-new" type="password" class="swal2-input" placeholder="Password Baru">' +
        '<input id="swal-confirm" type="password" class="swal2-input" placeholder="Konfirmasi Password Baru">',
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#2563EB",
      preConfirm: () => {
        const currentPassword = (document.getElementById("swal-old") as HTMLInputElement).value;
        const newPassword = (document.getElementById("swal-new") as HTMLInputElement).value;
        const confirm = (document.getElementById("swal-confirm") as HTMLInputElement).value;
        if (!currentPassword || !newPassword) { Swal.showValidationMessage("Semua field wajib diisi"); return false; }
        if (newPassword !== confirm) { Swal.showValidationMessage("Password baru tidak cocok"); return false; }
        if (newPassword.length < 6) { Swal.showValidationMessage("Password minimal 6 karakter"); return false; }
        return { currentPassword, newPassword };
      },
    });

    if (formValues) {
      try {
        const res = await fetch("/api/auth/password", {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify(formValues),
        });
        const data = await res.json();
        if (res.ok) Swal.fire({ icon: "success", title: "Password diubah", timer: 1500, showConfirmButton: false });
        else Swal.fire("Gagal", data.message || "Gagal mengubah password", "error");
      } catch {
        Swal.fire("Error", "Gagal menghubungi server", "error");
      }
    }
  };

  if (!profile) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400 text-sm font-semibold animate-pulse">Memuat profil...</div>
    </div>
  );

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: "Super Administrator",
    ADMIN_KELURAHAN: "Admin Kelurahan",
    PETUGAS: "Petugas Lapangan",
    WARGA: "Warga / Member",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Profil Saya</h2>
          <p className="text-xs text-gray-500">Kelola informasi akun dan pengaturan keamanan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden text-center">
            <div className="h-24 bg-admin-sidebar relative">
              <div className="absolute inset-0 bg-blue-600/10"></div>
            </div>
            <div className="px-6 pb-6 -mt-12 relative flex flex-col items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-white">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=EBF4FF&color=3B82F6&size=200`} alt="avatar" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-base font-bold text-gray-800 mt-4 leading-tight">{profile.name}</h3>
              <div className="mt-1 flex items-center justify-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{roleLabel[profile.role] || profile.role}</span>
              </div>
              <div className="w-full h-px bg-gray-50 my-6"></div>
              <div className="w-full grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-800">{new Date(profile.createdAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Bergabung</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-green-600">VALID</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Status NIK</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Informasi Kontak</h4>
            <div className="flex items-start space-x-3">
              <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-700">{profile.email}</p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Email Utama</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-700">{profile.phoneNumber || "-"}</p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Telepon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Edit profile */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest font-mono">Data Profil</h4>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">NIK</label>
                <p className="text-sm font-bold text-gray-800 mt-0.5 font-mono">{profile.nik || "-"}</p>
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Nama Lengkap</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">No. Telepon</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Alamat Lengkap</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Alamat lengkap..." />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button onClick={handleSaveProfile} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded text-xs font-bold shadow hover:bg-blue-700 transition-all uppercase tracking-wider">
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest font-mono">Keamanan Akun</h4>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Kata Sandi</p>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Ganti password Anda secara berkala</p>
                  </div>
                </div>
                <button onClick={handleChangePassword} className="px-4 py-1.5 bg-white border border-gray-300 rounded text-[10px] font-bold text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-all uppercase tracking-wider shadow-sm">
                  Ubah Password
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Status Akun</p>
                    <p className="text-[10px] text-green-500 font-bold uppercase">AKTIF</p>
                  </div>
                </div>
                <div className="w-10 h-5 bg-green-500 rounded-full relative shadow-inner">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
