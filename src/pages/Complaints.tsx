import { Plus, Search, MapPin, Camera, MessageSquare, Clock } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function Complaints({ user }: { user: any }) {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/complaints", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReports(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleCreateComplaint = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Buat Laporan Baru',
      html:
        '<input id="swal-title" class="swal2-input" placeholder="Judul Laporan" style="margin-bottom: 10px;">' +
        '<textarea id="swal-desc" class="swal2-textarea" placeholder="Deskripsi kejadian..."></textarea>' +
        '<input id="swal-loc" class="swal2-input" placeholder="Lokasi Kejadian (Opsional)" style="margin-bottom: 10px;">' +
        '<div style="text-align: left; padding: 0 1rem;"><label class="text-xs text-gray-500 font-bold mb-1">Upload Foto Kejadian:</label><br><input type="file" id="swal-file" class="swal2-file" accept="image/*"></div>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Laporkan',
      cancelButtonText: 'Batal',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const fileInput = document.getElementById('swal-file') as HTMLInputElement;
        const file = fileInput.files && fileInput.files.length > 0 ? fileInput.files[0] : null;
        let fileUrl = "";

        if (file) {
          const formData = new FormData();
          formData.append("file", file);
          try {
            const uploadRes = await fetch("/api/upload", {
              method: "POST",
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
              body: formData
            });
            const uploadData = await uploadRes.json();
            fileUrl = uploadData.url;
          } catch (e) {
            Swal.showValidationMessage("Gagal mengupload foto ke S3");
            return false;
          }
        }

        return {
          title: (document.getElementById('swal-title') as HTMLInputElement).value,
          description: (document.getElementById('swal-desc') as HTMLTextAreaElement).value,
          location: (document.getElementById('swal-loc') as HTMLInputElement).value,
          images: fileUrl ? [fileUrl] : []
        }
      }
    });

    if (formValues && formValues.title) {
      try {
        const res = await fetch("/api/complaints", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: JSON.stringify(formValues)
        });
        if (res.ok) {
          Swal.fire("Berhasil", "Laporan berhasil dikirim", "success");
          fetch("/api/complaints", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }})
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setReports(data); });
        } else {
          const err = await res.json();
          Swal.fire("Gagal", err.message || "Gagal mengirim laporan", "error");
        }
      } catch (error) {
        Swal.fire("Error", "Gagal menghubungi server", "error");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Pengaduan Masyarakat</h2>
          <p className="text-xs text-gray-500">Pantau dan verifikasi laporan warga secara realtime</p>
        </div>
        <button onClick={handleCreateComplaint} className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded text-xs font-bold shadow hover:bg-red-700 transition-all uppercase tracking-wider">
          <Plus className="w-4 h-4" />
          <span>Buat Laporan Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">Belum ada pengaduan</div>
        ) : reports.map((report: any, idx: number) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col group cursor-pointer"
          >
            <div className="h-40 bg-gray-100 relative">
               <div className="absolute top-2 left-2 z-10 flex space-x-1">
                 <span className="bg-gray-900/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter">{report.category?.name || 'UMUM'}</span>
               </div>
               <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${report.priority === 'HIGH' ? 'bg-red-500' : 'bg-yellow-500'} border-2 border-white shadow-sm`}></div>
               <img 
                 src={report.images?.[0]?.url || "https://images.unsplash.com/photo-1541698444083-023c97d3f4b6?w=400&q=80"} 
                 alt="issue" 
                 className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-300" 
               />
            </div>
            <div className="p-4 flex-1">
              <h3 className="text-sm font-bold text-gray-800 mb-1 truncate leading-tight">{report.title}</h3>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-4">
                {new Date(report.createdAt).toLocaleDateString()} • {report.location || 'Lokasi tidak disebutkan'}
              </p>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed italic border-l-2 border-gray-100 pl-3">{report.description}</p>
            </div>
            <div className="px-4 pb-4">
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                        report.status === 'SELESAI' ? 'bg-green-50 text-green-700 border-green-100' : 
                        report.status === 'DIPROSES' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 'bg-red-50 text-red-700 border-red-100'
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
