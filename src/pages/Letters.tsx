import { Plus, Download, Search, FileText } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function Letters({ user }: { user: any }) {
  const [letters, setLetters] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/letters", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setLetters(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleCreateLetter = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Ajukan Surat Baru',
      html:
        '<input id="swal-type" class="swal2-input" placeholder="Jenis Surat (Opsional)" style="margin-bottom: 10px;">' +
        '<input id="swal-desc" class="swal2-input" placeholder="Keterangan / Keperluan" style="margin-bottom: 10px;">' +
        '<div style="text-align: left; padding: 0 1rem;"><label class="text-xs text-gray-500 font-bold mb-1">Upload Berkas Pendukung (Opsional):</label><br><input type="file" id="swal-file" class="swal2-file"></div>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Ajukan',
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
            Swal.showValidationMessage("Gagal mengupload file ke S3");
            return false;
          }
        }

        return {
          type: (document.getElementById('swal-type') as HTMLInputElement).value,
          desc: (document.getElementById('swal-desc') as HTMLInputElement).value,
          fileUrl: fileUrl
        }
      }
    });

    if (formValues) {
      try {
        const res = await fetch("/api/letters", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: JSON.stringify({ attachments: formValues.fileUrl || formValues.desc })
        });
        if (res.ok) {
          Swal.fire("Berhasil", "Surat berhasil diajukan", "success");
          fetch("/api/letters", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }})
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setLetters(data); });
        } else {
          const err = await res.json();
          Swal.fire("Gagal", err.message || "Gagal mengajukan surat", "error");
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
          <h2 className="text-xl font-bold text-gray-800">Pelayanan Surat</h2>
          <p className="text-xs text-gray-500">Kelola dan pantau status dokumen penduduk</p>
        </div>
        <button onClick={handleCreateLetter} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded text-xs font-bold shadow hover:bg-blue-700 transition-all uppercase tracking-wider">
          <Plus className="w-4 h-4" />
          <span>Ajukan Surat Baru</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Cari nomor surat atau jenis layanan..." className="w-full pl-10 pr-4 py-1.5 bg-white border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400" />
          </div>
          <div className="flex space-x-2">
            <select className="bg-white border border-gray-300 rounded px-3 py-1.5 text-xs font-bold text-gray-600 outline-none">
              <option>Semua Status</option>
              <option>Pending</option>
              <option>Diproses</option>
              <option>Selesai</option>
            </select>
            <button className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-bold text-gray-600 hover:bg-gray-50 uppercase tracking-tighter">
              Download Arsip
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-gray-50 border-b border-gray-200">
                 <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Warga Pemohon</th>
                 <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Jenis Surat</th>
                 <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">No. Registrasi</th>
                 <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                 <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
               </tr>
             </thead>
              <tbody className="divide-y divide-gray-100">
                {letters.length > 0 ? letters.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{item.user?.name || "User"}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 italic font-serif">{item.letterType?.name || "Surat"}</td>
                    <td className="px-6 py-3 text-xs font-mono text-gray-400 font-bold">{item.letterNumber || item.id.substring(0,8)}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        item.status === 'SELESAI' ? 'bg-green-100 text-green-700 border-green-200' : 
                        item.status === 'DIPROSES' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                        item.status === 'DITOLAK' ? 'bg-red-100 text-red-700 border-red-200' : 
                        'bg-blue-100 text-blue-700 border-blue-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <button className="px-2 py-1 bg-blue-600 text-white text-[10px] rounded hover:bg-blue-700 transition-colors uppercase font-bold">Detail</button>
                        {item.status === 'SELESAI' && (
                          <button className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] rounded hover:bg-gray-200 transition-colors border border-gray-200">
                             <Download className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                      Belum ada surat
                    </td>
                  </tr>
                )}
             </tbody>
          </table>
        </div>
        
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {letters.length} documents</span>
           <div className="flex space-x-1">
              <button className="w-6 h-6 border border-gray-200 rounded flex items-center justify-center text-[10px] font-bold hover:bg-white transition-colors">&laquo;</button>
              <button className="w-6 h-6 bg-blue-600 text-white rounded flex items-center justify-center text-[10px] font-bold shadow-sm">1</button>
              <button className="w-6 h-6 border border-gray-200 rounded flex items-center justify-center text-[10px] font-bold hover:bg-white transition-colors">2</button>
              <button className="w-6 h-6 border border-gray-200 rounded flex items-center justify-center text-[10px] font-bold hover:bg-white transition-colors">&raquo;</button>
           </div>
        </div>
      </div>
    </div>
  );
}
