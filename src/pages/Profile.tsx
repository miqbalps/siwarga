import { User, Mail, Phone, MapPin, Shield, CheckCircle2, Camera, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

export default function Profile({ user }: { user: any }) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Profil Saya</h2>
          <p className="text-xs text-gray-500">Kelola informasi akun dan pengaturan keamanan</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden text-center">
                <div className="h-24 bg-admin-sidebar relative">
                   <div className="absolute inset-0 bg-blue-600/10"></div>
                </div>
                <div className="px-6 pb-6 -mt-12 relative flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-white">
                     <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=EBF4FF&color=3B82F6&size=200`} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800 mt-4 leading-tight">{user?.name}</h3>
                  <div className="mt-1 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{user?.role}</span>
                  </div>
                  
                  <div className="w-full h-px bg-gray-50 my-6"></div>
                  
                  <div className="w-full grid grid-cols-2 gap-4">
                      <div className="text-center">
                          <p className="text-xs font-bold text-gray-800">May 2026</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Bergabung</p>
                      </div>
                      <div className="text-center">
                          <p className="text-xs font-bold text-green-600">VALID</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Status NIK</p>
                      </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                    <button className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest">Unggah Foto Baru</button>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
                 <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Informasi Kontak</h4>
                 <div className="flex items-start space-x-3">
                    <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-gray-700">user@kelurahan.go.id</p>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase">Email Utama</p>
                    </div>
                 </div>
                 <div className="flex items-start space-x-3">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-gray-700">0812-3456-7890</p>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase">WhatsApp / Telp</p>
                    </div>
                 </div>
            </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest font-mono">Data Kependudukan Resmi</h4>
                    <button className="text-[10px] font-bold text-blue-600 flex items-center hover:bg-blue-50 px-2 py-1 rounded transition-colors uppercase">
                        Edit Data
                    </button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Nomor Induk Kependudukan (NIK)</label>
                        <p className="text-sm font-bold text-gray-800 mt-0.5 font-mono">3275012345678901</p>
                    </div>
                    <div>
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Tempat, Tanggal Lahir</label>
                        <p className="text-sm font-bold text-gray-800 mt-0.5">BEKASI, 12 JANUARI 1995</p>
                    </div>
                    <div>
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Jenis Kelamin</label>
                        <p className="text-sm font-bold text-gray-800 mt-0.5">LAKI-LAKI</p>
                    </div>
                    <div>
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Status Perkawinan</label>
                        <p className="text-sm font-bold text-gray-800 mt-0.5">BELUM KAWIN</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Alamat Lengkap (KTP)</label>
                        <p className="text-sm font-bold text-gray-800 mt-0.5 italic leading-relaxed">Perumahan Indah Permai Blok A1 No. 5, RT 004/RW 002, Kelurahan Jati Warna, Kecamatan Digital Valley</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest font-mono">Keamanan Akun</h4>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">Kata Sandi</p>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase">Update terakhir: 3 bulan yang lalu</p>
                            </div>
                        </div>
                        <button className="px-4 py-1.5 bg-white border border-gray-300 rounded text-[10px] font-bold text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-all uppercase tracking-wider shadow-sm">Ubah Password</button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">Verifikasi Dua Langkah</p>
                                <p className="text-[10px] text-green-500 font-bold uppercase">AKTIF [RECOMMENDED]</p>
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
