import { motion } from "motion/react";
import { 
  FileText, 
  MessageSquare, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from "recharts";

interface DashboardProps {
  user: any;
}

const data = [
  { name: "Jan", surat: 400, pengaduan: 240 },
  { name: "Feb", surat: 300, pengaduan: 139 },
  { name: "Mar", surat: 200, pengaduan: 980 },
  { name: "Apr", surat: 278, pengaduan: 390 },
  { name: "May", surat: 189, pengaduan: 480 },
  { name: "Jun", surat: 239, pengaduan: 380 },
];

const categoryData = [
  { name: "Jalan Rusak", value: 45, color: "#3B82F6" },
  { name: "Kebersihan", value: 25, color: "#10B981" },
  { name: "Infrastruktur", value: 20, color: "#F59E0B" },
  { name: "Lampu Jalan", value: 10, color: "#EF4444" },
];

export default function Dashboard({ user }: DashboardProps) {
  const stats = [
    { label: "Total Warga Terdaftar", value: "1,240", icon: Users, color: "bg-blue-500", iconPath: "M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a7 7 0 017 7v1H1v-1a7 7 0 017-7z" },
    { label: "Surat Menunggu Verifikasi", value: "12", icon: FileText, color: "bg-yellow-400", iconPath: "M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" },
    { label: "Pengaduan Aktif", value: "8", icon: AlertCircle, color: "bg-red-500", iconPath: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" },
    { label: "Petugas Lapangan", value: "15", icon: CheckCircle2, color: "bg-green-500", iconPath: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" },
  ];

  const recentActivity = [
    { id: 1, type: "surat", title: "Surat Domisili Baru", user: "Ahmad Subarjo", status: "Diproses", time: "15 Okt 2023" },
    { id: 2, type: "surat", title: "Surat Tidak Mampu", user: "Linda Permata", status: "Selesai", time: "14 Okt 2023" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-xs text-gray-500">Ringkasan Kelurahan Digital Cloud Terkini</p>
        </div>
        <div className="flex space-x-2">
            <button className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-semibold hover:bg-gray-50 transition-colors">
                Cloud Server: Active
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 ml-2"></span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          return (
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
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 flex flex-col shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Statistik Layanan (30 Hari Terakhir)</h3>
            <div className="flex space-x-2 text-[10px] font-bold uppercase tracking-tight">
                <span className="text-gray-400">• Pengajuan Surat</span>
                <span className="text-blue-500">• Pengaduan</span>
            </div>
          </div>
          <div className="flex-1 p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip 
                   cursor={{ fill: '#F9FAFB' }}
                   contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                />
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
              {[
                { title: "Lampu Jalan Mati - RT 04", user: "Budi S.", time: "2 jam yang lalu", dot: "bg-red-500" },
                { title: "Tumpukan Sampah Liar", user: "Siti K.", time: "5 jam yang lalu", dot: "bg-yellow-500" },
                { title: "Drainase Tersumbat", user: "Agus M.", time: "Kemarin", dot: "bg-blue-500" },
              ].map((item, idx) => (
                <div key={idx} className="p-4 flex items-start hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className={`w-2 h-2 rounded-full ${item.dot} mt-1.5 mr-3 shrink-0`}></div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                    <p className="text-[10px] text-gray-500 font-semibold uppercase">{item.time} oleh {item.user}</p>
                  </div>
                </div>
              ))}
              <div className="p-4 flex items-center justify-center">
                <button className="text-[10px] text-blue-600 font-bold hover:underline uppercase tracking-wider">Lihat Semua Pengaduan</button>
              </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-700">Pengajuan Surat Terbaru</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nama Warga</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Jenis Surat</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {recentActivity.map((activity) => (
                        <tr key={activity.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">{activity.user}</td>
                            <td className="px-6 py-3 text-sm text-gray-600">{activity.title}</td>
                            <td className="px-6 py-3 text-sm text-gray-500">{activity.time}</td>
                            <td className="px-6 py-3 text-xs">
                                <span className={`px-2 py-0.5 rounded-full font-semibold ${
                                    activity.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {activity.status}
                                </span>
                            </td>
                            <td className="px-6 py-3 text-right">
                                <button className="px-2 py-1 bg-blue-600 text-white text-[10px] rounded hover:bg-blue-700 transition-colors">Detail</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
