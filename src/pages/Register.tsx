import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Mail, Lock, User, Phone, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import Swal from "sweetalert2";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", nik: "", phone: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mendaftar");
      }

      Swal.fire("Berhasil!", "Akun warga berhasil dibuat. Silakan login.", "success");
      navigate("/login");
    } catch (error: any) {
      Swal.fire("Error!", error.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col items-center justify-center p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl w-full bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200"
      >
        <div className="bg-admin-sidebar p-8 text-white flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-blue-600/5 pointer-events-none"></div>
            <Link to="/login" className="p-2 bg-white/10 rounded hover:bg-white/20 transition-colors z-10">
                <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-black tracking-tighter uppercase italic z-10">REGISTRASI WARGA</h1>
            <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center backdrop-blur-md border border-white/20 z-10">
                <ShieldCheck className="w-5 h-5 text-white" />
            </div>
        </div>

        <div className="p-10">
            <div className="mb-10 text-center">
                <h2 className="text-xl font-bold text-gray-800">Formulir Pendaftaran</h2>
                <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">Gunakan data sesuai KTP untuk verifikasi otomatis</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] pl-1">Nama Lengkap (Sesuai KTP)</label>
                    <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all" />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] pl-1">NIK (16 Digit Terverifikasi)</label>
                    <input type="text" maxLength={16} required value={formData.nik} onChange={(e) => setFormData({...formData, nik: e.target.value})} placeholder="3275..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all font-mono" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] pl-1">Nomor Seluler (WhatsApp)</label>
                    <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="0812..." className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all font-mono" />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] pl-1">Email Aktif</label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="user@domain.com" className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all font-mono" />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] pl-1">Kata Sandi Baru</label>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all" />
                    </div>
                </div>
                <div className="md:col-span-2 pt-6">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded shadow-lg transition-all uppercase text-xs tracking-[0.2em]">
                        Konfirmasi Pendaftaran
                    </button>
                    <p className="mt-4 text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">DENGAN MENDAFTAR, ANDA MENYETUJUI <Link to="#" className="text-blue-600 underline">SYARAT & KETENTUAN</Link></p>
                </div>
            </form>
        </div>
      </motion.div>
    </div>
  );
}
