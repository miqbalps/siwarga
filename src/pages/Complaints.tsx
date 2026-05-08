import { Plus, Search, MapPin, Camera, MessageSquare, Clock } from "lucide-react";
import { motion } from "motion/react";

export default function Complaints({ user }: { user: any }) {
  const reports = [
    { 
      id: 1, 
      title: "Lampu Jalan Mati - RT 04", 
      desc: "Laporan mengenai jalan rusak berat yang sering menyebabkan genangan air saat hujan...",
      category: "PELAYANAN PUBLIK",
      status: "PENDING",
      loc: "Gg. Melati No. 12",
      time: "2 jam lalu",
      img: "https://images.unsplash.com/photo-1541698444083-023c97d3f4b6?w=400&q=80",
      dot: "bg-red-500"
    },
    { 
      id: 2, 
      title: "Tumpukan Sampah Liar", 
      desc: "Penumpukan sampah liar di lahan kosong dekat pasar desa, bau tidak sedap...",
      category: "KEBERSIHAN",
      status: "PROSES",
      loc: "Jl. Raya Timur",
      time: "5 jam lalu",
      img: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&q=80",
      dot: "bg-yellow-500"
    },
    { 
      id: 3, 
      title: "Drainase Tersumbat", 
      desc: "Sudah 3 hari lampu penerangan jalan di depan sekolah padam, area menjadi gelap...",
      category: "INFRASTRUKTUR",
      status: "SELESAI",
      loc: "Depan SDN 01",
      time: "1 minggu lalu",
      img: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&q=80",
      dot: "bg-blue-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Pengaduan Masyarakat</h2>
          <p className="text-xs text-gray-500">Pantau dan verifikasi laporan warga secara realtime</p>
        </div>
        <button className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded text-xs font-bold shadow hover:bg-red-700 transition-all uppercase tracking-wider">
          <Plus className="w-4 h-4" />
          <span>Buat Laporan Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, idx) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col group cursor-pointer"
          >
            <div className="h-40 bg-gray-100 relative">
               <div className="absolute top-2 left-2 z-10 flex space-x-1">
                 <span className="bg-gray-900/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter">{report.category}</span>
               </div>
               <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${report.dot} border-2 border-white shadow-sm`}></div>
               <img 
                 src={report.img} 
                 alt="issue" 
                 className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-300" 
               />
            </div>
            <div className="p-4 flex-1">
              <h3 className="text-sm font-bold text-gray-800 mb-1 truncate leading-tight">{report.title}</h3>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-4">{report.time} • {report.loc}</p>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed italic border-l-2 border-gray-100 pl-3">{report.desc}</p>
            </div>
            <div className="px-4 pb-4">
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                        report.status === 'SELESAI' ? 'bg-green-50 text-green-700 border-green-100' : 
                        report.status === 'PROSES' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                        STATUS: {report.status}
                    </span>
                    <button className="text-[10px] font-bold text-blue-600 hover:underline uppercase">Ubah Status</button>
                </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em]">End of report feed</p>
      </div>
    </div>
  );
}
