import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Swal from "sweetalert2";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal masuk");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin();
      Swal.fire({
        title: "Berhasil!",
        text: "Selamat datang di SIWARGA",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error: any) {
      Swal.fire("Error!", error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200"
      >
        <div className="bg-admin-sidebar p-10 text-white flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-blue-600/5 pointer-events-none"></div>
            <div className="w-16 h-16 bg-white/10 rounded-lg mb-4 flex items-center justify-center backdrop-blur-md border border-white/20">
                <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">SIWARGA</h1>
            <p className="text-gray-400 text-[10px] font-bold mt-1 uppercase tracking-[0.3em] text-center">Public Service Platform</p>
        </div>

        <div className="p-10">
            <div className="mb-8 text-center">
                <h2 className="text-xl font-bold text-gray-800">Selamat Datang</h2>
                <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest leading-relaxed">Silahkan masuk ke akun Anda</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] pl-1">ID Pengguna / Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="email" 
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all font-mono"
                            placeholder="user@siwarga.cloud"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center pr-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] pl-1">Kata Sandi</label>
                        <Link to="#" className="text-[10px] uppercase font-bold text-blue-600 hover:underline tracking-tighter">Lupa Password?</Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="password" 
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2 pl-1">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ingat Perangkat Ini</span>
                </div>

                <button 
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded shadow-md flex items-center justify-center transition-all disabled:opacity-70 group uppercase text-xs tracking-[0.2em]"
                >
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <span>Masuk</span>
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Belum memiliki akun?</p>
                <Link to="/register" className="inline-block px-8 py-2 border border-blue-600 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded hover:bg-blue-50 transition-colors">Daftar Warga Baru</Link>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
