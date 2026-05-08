import { Plus, Download, Search, FileText, Trash2, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function Letters({ user }: { user: any }) {
  const [letters, setLetters] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN_KELURAHAN";

  const fetchLetters = () => {
    fetch("/api/letters", { headers: authHeader() })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setLetters(data); })
      .catch(console.error);
  };

  useEffect(() => {
    fetchLetters();
    fetch("/api/letter-types", { headers: authHeader() })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTypes(data); })
      .catch(console.error);
  }, []);

  const handleCreate = async () => {
    const typeOptions = types.map(t => `<option value="${t.id}">${t.name}</option>`).join("");
    const { value: formValues } = await Swal.fire({
      title: "Ajukan Surat Baru",
      html:
        `<select id="swal-type" class="swal2-select" style="margin-bottom:12px;width:100%;padding:8px;border:1px solid #d5d5d5;border-radius:4px;font-size:14px;"><option value="">Pilih Jenis Surat</option>${typeOptions}</select>` +
        '<input id="swal-desc" class="swal2-input" placeholder="Keterangan / Keperluan" style="margin-bottom:12px;">' +
        '<div style="text-align:left;padding:0 1rem;"><label style="font-size:12px;color:#6b7280;font-weight:600;">Berkas Pendukung (Opsional):</label><br><input type="file" id="swal-file" style="margin-top:6px;font-size:13px;"></div>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Ajukan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#2563EB",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const letterTypeId = (document.getElementById("swal-type") as HTMLSelectElement).value;
        const desc = (document.getElementById("swal-desc") as HTMLInputElement).value;
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
          } catch { Swal.showValidationMessage("Gagal upload file"); return false; }
        }

        return { letterTypeId: letterTypeId || undefined, attachments: fileUrl || desc };
      },
    });

    if (formValues) {
      try {
        const res = await fetch("/api/letters", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify(formValues),
        });
        if (res.ok) { Swal.fire({ icon: "success", title: "Berhasil", text: "Surat berhasil diajukan", timer: 2000, showConfirmButton: false }); fetchLetters(); }
        else { const e = await res.json(); Swal.fire("Gagal", e.message, "error"); }
      } catch { Swal.fire("Error", "Gagal menghubungi server", "error"); }
    }
  };

  const handleStatusUpdate = async (id: string, currentStatus: string) => {
    const { value: status } = await Swal.fire({
      title: "Ubah Status Surat",
      input: "select",
      inputOptions: { PENDING: "Pending", DIPROSES: "Diproses", SELESAI: "Selesai", DITOLAK: "Ditolak" },
      inputValue: currentStatus,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#2563EB",
    });
    if (status) {
      const res = await fetch(`/api/letters/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ status }),
      });
      if (res.ok) { Swal.fire({ icon: "success", title: "Status diperbarui", timer: 1500, showConfirmButton: false }); fetchLetters(); }
      else Swal.fire("Gagal", "Gagal memperbarui status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const { isConfirmed } = await Swal.fire({
      title: "Hapus Surat?",
      text: "Data surat akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#EF4444",
    });
    if (isConfirmed) {
      const res = await fetch(`/api/letters/${id}`, { method: "DELETE", headers: authHeader() });
      if (res.ok) { Swal.fire({ icon: "success", title: "Dihapus!", timer: 1500, showConfirmButton: false }); fetchLetters(); }
      else Swal.fire("Gagal", "Gagal menghapus surat", "error");
    }
  };

  const handleDetail = (item: any) => {
    Swal.fire({
      title: item.letterType?.name || "Detail Surat",
      html: `
        <div style="text-align:left;font-size:13px;">
          <p><b>Pemohon:</b> ${item.user?.name || "-"}</p>
          <p><b>No. Registrasi:</b> ${item.letterNumber || "-"}</p>
          <p><b>Status:</b> <span style="font-weight:700;text-transform:uppercase;">${item.status}</span></p>
          <p><b>Tanggal:</b> ${new Date(item.createdAt).toLocaleDateString("id-ID")}</p>
          ${item.attachments ? `<p><b>Berkas:</b> <a href="${item.attachments}" target="_blank" style="color:#2563EB;">Lihat Berkas</a></p>` : ""}
          ${item.rejectionReason ? `<p><b>Alasan Ditolak:</b> ${item.rejectionReason}</p>` : ""}
        </div>
      `,
      confirmButtonText: "Tutup",
      confirmButtonColor: "#2563EB",
    });
  };

  const filtered = letters
    .filter((l) => filter === "ALL" || l.status === filter)
    .filter((l) =>
      search === "" ||
      l.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.letterType?.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.letterNumber?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Pelayanan Surat</h2>
          <p className="text-xs text-gray-500">Kelola dan pantau status dokumen penduduk</p>
        </div>
        <button onClick={handleCreate} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded text-xs font-bold shadow hover:bg-blue-700 transition-all uppercase tracking-wider">
          <Plus className="w-4 h-4" />
          <span>Ajukan Surat Baru</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nomor surat, pemohon, atau jenis..." className="w-full pl-10 pr-4 py-1.5 bg-white border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400" />
          </div>
          <div className="flex space-x-2">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-white border border-gray-300 rounded px-3 py-1.5 text-xs font-bold text-gray-600 outline-none">
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Pending</option>
              <option value="DIPROSES">Diproses</option>
              <option value="SELESAI">Selesai</option>
              <option value="DITOLAK">Ditolak</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Warga Pemohon</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Jenis Surat</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">No. Registrasi</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length > 0 ? filtered.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{item.user?.name || "-"}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{item.letterType?.name || "Surat"}</td>
                  <td className="px-6 py-3 text-xs font-mono text-gray-400 font-bold">{item.letterNumber || "-"}</td>
                  <td className="px-6 py-3 text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString("id-ID")}</td>
                  <td className="px-6 py-3 text-center">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      item.status === "SELESAI" ? "bg-green-100 text-green-700 border-green-200" :
                      item.status === "DIPROSES" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                      item.status === "DITOLAK" ? "bg-red-100 text-red-700 border-red-200" :
                      "bg-blue-100 text-blue-700 border-blue-200"
                    }`}>{item.status}</span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end space-x-1">
                      <button onClick={() => handleDetail(item)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors" title="Detail"><Eye className="w-3.5 h-3.5" /></button>
                      {isAdmin && <button onClick={() => handleStatusUpdate(item.id, item.status)} className="p-1.5 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition-colors" title="Ubah Status"><Clock className="w-3.5 h-3.5" /></button>}
                      {isAdmin && <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors" title="Hapus"><Trash2 className="w-3.5 h-3.5" /></button>}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">Belum ada surat</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Menampilkan {filtered.length} dari {letters.length} dokumen</span>
        </div>
      </div>
    </div>
  );
}
