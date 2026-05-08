import { motion } from "motion/react";
import { FileText, MessageSquare, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface DashboardProps {
  user: any;
}

export default function Dashboard({ user }: DashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400 text-sm font-semibold animate-pulse">Memuat data dashboard...</div>
    </div>
  );

  const cards = [
    { label: "Total Warga Terdaftar", value: stats?.totalUsers || 0, icon: Users, color: "bg-blue-500", iconPath: "M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a7 7 0 017 7v1H1v-1a7 7 0 017-7z" },
    { label: "Surat Menunggu Verifikasi", value: stats?.pendingLetters || 0, icon: FileText, color: "bg-yellow-400", iconPath: "M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" },
    { label: "Pengaduan Aktif", value: stats?.pendingComplaints || 0, icon: AlertCircle, color: "bg-red-500", iconPath: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" },
    { label: "Total Pengajuan Surat", value: stats?.totalLetters || 0, icon: CheckCircle2, color: "bg-green-500", iconPath: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-xs text-gray-500">Selamat datang, <b>{user?.name}</b> — Ringkasan Layanan Publik</p>
        </div>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`${stat.color} text-white rounded-lg p-5 shadow-sm relative overflow-hidden group`}
          >
            <div className="relative z-10">
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm opacity-90 font-medium">{stat.label}</div>
            </div>
            <svg className="absolute bottom-[-10px] right-[-10px] w-20 h-20 text-white opacity-20 transform group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path d={stat.iconPath}></path>
            </svg>
          </motion.div>
        ))}
      </div>

      {/* charts + recent complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 flex flex-col shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Statistik Layanan (6 Bulan Terakhir)</h3>
            <div className="flex space-x-3 text-[10px] font-bold uppercase tracking-tight">
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-200 mr-1"></span>Surat</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-600 mr-1"></span>Pengaduan</span>
            </div>
          </div>
          <div className="flex-1 p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlyStats || []} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }} />
                <Bar dataKey="surat" fill="#DBEAFE" radius={[2, 2, 0, 0]} />
                <Bar dataKey="pengaduan" fill="#3B82F6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-700">Pengaduan Terbaru</h3>
          </div>
          <div className="flex-1 overflow-hidden divide-y divide-gray-100">
            {stats?.recentComplaints?.length > 0 ? stats.recentComplaints.map((item: any, idx: number) => (
              <div key={idx} className="p-4 flex items-start hover:bg-gray-50 transition-colors cursor-pointer">
                <div className={`w-2 h-2 rounded-full mt-1.5 mr-3 shrink-0 ${item.status === 'SELESAI' ? 'bg-green-500' : item.status === 'DIPROSES' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase">{new Date(item.createdAt).toLocaleDateString("id-ID")} oleh {item.user?.name}</p>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-sm text-gray-400">Belum ada pengaduan</div>
            )}
            <div className="p-4 flex items-center justify-center">
              <Link to="/complaints" className="text-[10px] text-blue-600 font-bold hover:underline uppercase tracking-wider">Lihat Semua Pengaduan</Link>
            </div>
          </div>
        </div>
      </div>

      {/* recent letters table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-700">Pengajuan Surat Terbaru</h3>
          <Link to="/letters" className="text-[10px] text-blue-600 font-bold hover:underline uppercase tracking-wider">Lihat Semua</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nama Warga</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Jenis Surat</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats?.recentLetters?.length > 0 ? stats.recentLetters.map((l: any) => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{l.user?.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{l.letterType?.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{new Date(l.createdAt).toLocaleDateString("id-ID")}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      l.status === 'SELESAI' ? 'bg-green-100 text-green-700 border-green-200' :
                      l.status === 'DIPROSES' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                      l.status === 'DITOLAK' ? 'bg-red-100 text-red-700 border-red-200' :
                      'bg-blue-100 text-blue-700 border-blue-200'
                    }`}>{l.status}</span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">Belum ada pengajuan surat</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
