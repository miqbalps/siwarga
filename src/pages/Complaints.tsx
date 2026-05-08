import { Plus, Search, Eye, Clock, Trash2, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function Complaints({ user }: { user: any }) {
  const [reports, setReports] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN_KELURAHAN";

  const fetchReports = () => {
    fetch("/api/complaints", { headers: authHeader() })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setReports(data); })
      .catch(console.error);
  };

  useEffect(() => {
    fetchReports();
    fetch("/api/complaint-categories", { headers: authHeader() })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCategories(data); })
      .catch(console.error);
  }, []);

  const handleCreate = async () => {
    const catOptions = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    const { value: formValues } = await Swal.fire({
      title: "Buat Laporan Baru",
      html: `
        <div class="swal-logo-header"><img src="/logo.png" alt="SIWARGA" /><span style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">SIWARGA</span></div>
        <div class="swal-form-group">
          <label class="swal-form-label">Judul Laporan</label>
          <input id="swal-title" class="swal-form-input" placeholder="Tuliskan judul laporan..." />
        </div>
        <div class="swal-form-group">
          <label class="swal-form-label">Kategori</label>
          <select id="swal-cat" class="swal-form-select"><option value="">— Pilih Kategori —</option>${catOptions}</select>
        </div>
        <div class="swal-form-group">
          <label class="swal-form-label">Deskripsi Kejadian</label>
          <textarea id="swal-desc" class="swal-form-textarea" placeholder="Jelaskan kejadian secara detail..."></textarea>
        </div>
        <div class="swal-form-group">
          <label class="swal-form-label">Lokasi Kejadian</label>
          <input id="swal-loc" class="swal-form-input" placeholder="Contoh: Jl. Merdeka No.12 RT 04" />
        </div>
        <div class="swal-form-group">
          <label class="swal-form-label">Foto Kejadian (Opsional)</label>
          <div class="swal-form-file-wrapper">
            <input type="file" id="swal-file" accept="image/*" />
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Laporkan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#DC2626",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const title = (document.getElementById("swal-title") as HTMLInputElement).value;
        if (!title) { Swal.showValidationMessage("Judul laporan wajib diisi"); return false; }
        const categoryId = (document.getElementById("swal-cat") as HTMLSelectElement).value;
        const description = (document.getElementById("swal-desc") as HTMLTextAreaElement).value;
        const location = (document.getElementById("swal-loc") as HTMLInputElement).value;
        const fileInput = document.getElementById("swal-file") as HTMLInputElement;
        const file = fileInput.files?.[0] || null;
        let fileUrl = "";

        if (file) {
          const fd = new FormData();
          fd.append("file", file);
          try {
            const r = await fetch("/api/upload", { method: "POST", headers: authHeader(), body: fd });
            const d = await r.json();
            fileUrl = d.url;
          } catch { Swal.showValidationMessage("Gagal upload foto"); return false; }
        }

        return { title, categoryId: categoryId || undefined, description, location, images: fileUrl ? [fileUrl] : [] };
      },
    });

    if (formValues) {
      try {
        const res = await fetch("/api/complaints", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify(formValues),
        });
        if (res.ok) { Swal.fire({ icon: "success", title: "Berhasil", text: "Laporan berhasil dikirim", timer: 2000, showConfirmButton: false }); fetchReports(); }
        else { const e = await res.json(); Swal.fire("Gagal", e.message, "error"); }
      } catch { Swal.fire("Error", "Gagal menghubungi server", "error"); }
    }
  };

  const handleStatusUpdate = async (id: string, currentStatus: string) => {
    const { value: status } = await Swal.fire({
      title: "Ubah Status Pengaduan",
      input: "select",
      inputOptions: { PENDING: "Pending", DIVERIFIKASI: "Diverifikasi", DIPROSES: "Diproses", SELESAI: "Selesai", DITOLAK: "Ditolak" },
      inputValue: currentStatus,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#2563EB",
    });
    if (status) {
      const res = await fetch(`/api/complaints/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ status }),
      });
      if (res.ok) { Swal.fire({ icon: "success", title: "Status diperbarui", timer: 1500, showConfirmButton: false }); fetchReports(); }
      else Swal.fire("Gagal", "Gagal memperbarui status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const { isConfirmed } = await Swal.fire({
      title: "Hapus Pengaduan?",
      text: "Data pengaduan akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#EF4444",
    });
    if (isConfirmed) {
      const res = await fetch(`/api/complaints/${id}`, { method: "DELETE", headers: authHeader() });
      if (res.ok) { Swal.fire({ icon: "success", title: "Dihapus!", timer: 1500, showConfirmButton: false }); fetchReports(); }
      else Swal.fire("Gagal", "Gagal menghapus pengaduan", "error");
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { SELESAI: 'background:#dcfce7;color:#15803d;', DIPROSES: 'background:#fef9c3;color:#a16207;', DITOLAK: 'background:#fee2e2;color:#b91c1c;', DIVERIFIKASI: 'background:#e0e7ff;color:#4338ca;', PENDING: 'background:#dbeafe;color:#1d4ed8;' };
    return `<span class="swal-detail-badge" style="${map[s] || map.PENDING}">${s}</span>`;
  };

  const handleDetail = (report: any) => {
    Swal.fire({
      title: " ",
      html: `
        <div class="swal-logo-header"><img src="/logo.png" alt="SIWARGA" /><span style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">Detail Pengaduan</span></div>
        <div style="text-align:center;margin-bottom:16px;">
          <div style="font-size:16px;font-weight:700;color:#1f2937;">${report.title}</div>
        </div>
        <div class="swal-detail-row"><span class="swal-detail-label">Pelapor</span><span class="swal-detail-value">${report.user?.name || '-'}</span></div>
        <div class="swal-detail-row"><span class="swal-detail-label">Kategori</span><span class="swal-detail-value">${report.category?.name || '-'}</span></div>
        <div class="swal-detail-row"><span class="swal-detail-label">Lokasi</span><span class="swal-detail-value">${report.location || '-'}</span></div>
        <div class="swal-detail-row"><span class="swal-detail-label">Status</span><span class="swal-detail-value">${statusBadge(report.status)}</span></div>
        <div class="swal-detail-row"><span class="swal-detail-label">Tanggal</span><span class="swal-detail-value">${new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
        ${report.description ? `<div class="swal-detail-desc">${report.description}</div>` : ''}
        ${report.images?.length > 0 ? `<img src="${report.images[0].url}" alt="Foto" class="swal-detail-image" />` : ''}
      `,
      confirmButtonText: "Tutup",
      confirmButtonColor: "#2563EB",
      width: 520,
    });
  };

  const filtered = reports.filter((r) => filter === "ALL" || r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Pengaduan Masyarakat</h2>
          <p className="text-xs text-gray-500">Pantau dan verifikasi laporan warga secara realtime</p>
        </div>
        <button onClick={handleCreate} className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded text-xs font-bold shadow hover:bg-red-700 transition-all uppercase tracking-wider">
          <Plus className="w-4 h-4" />
          <span>Buat Laporan Baru</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex space-x-2">
        {["ALL", "PENDING", "DIPROSES", "SELESAI"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${filter === s ? "bg-blue-600 text-white shadow" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
            {s === "ALL" ? "Semua" : s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-400 text-sm">Belum ada pengaduan</div>
        ) : filtered.map((report: any, idx: number) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col group"
          >
            <div className="h-40 bg-gray-100 relative">
              <div className="absolute top-2 left-2 z-10">
                <span className="bg-gray-900/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter">{report.category?.name || "UMUM"}</span>
              </div>
              <div className={`absolute top-2 right-2 w-3 h-3 rounded-full border-2 border-white shadow-sm ${report.status === "SELESAI" ? "bg-green-500" : report.status === "DIPROSES" ? "bg-yellow-500" : "bg-red-500"}`}></div>
              <img
                src={report.images?.[0]?.url || "https://images.unsplash.com/photo-1541698444083-023c97d3f4b6?w=400&q=80"}
                alt="issue"
                className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-300"
              />
            </div>
            <div className="p-4 flex-1">
              <h3 className="text-sm font-bold text-gray-800 mb-1 truncate leading-tight">{report.title}</h3>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-3 flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {report.location || "Lokasi tidak disebutkan"}
              </p>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{report.description}</p>
            </div>
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                  report.status === "SELESAI" ? "bg-green-50 text-green-700 border-green-100" :
                  report.status === "DIPROSES" ? "bg-yellow-50 text-yellow-700 border-yellow-100" :
                  "bg-red-50 text-red-700 border-red-100"
                }`}>{report.status}</span>
                <div className="flex space-x-1">
                  <button onClick={() => handleDetail(report)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors" title="Detail"><Eye className="w-3.5 h-3.5" /></button>
                  {isAdmin && <button onClick={() => handleStatusUpdate(report.id, report.status)} className="p-1.5 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition-colors" title="Ubah Status"><Clock className="w-3.5 h-3.5" /></button>}
                  {isAdmin && <button onClick={() => handleDelete(report.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors" title="Hapus"><Trash2 className="w-3.5 h-3.5" /></button>}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-center">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em]">Menampilkan {filtered.length} dari {reports.length} pengaduan</p>
      </div>
    </div>
  );
}
