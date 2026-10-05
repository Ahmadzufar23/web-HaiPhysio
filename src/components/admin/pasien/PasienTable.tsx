"use client";

import { useState } from "react";
import Link from "next/link";
import { CaretDown, DownloadSimple, Brain, Barbell, Bandaids, CaretRight, CaretLeft, Users } from "@phosphor-icons/react";

interface PasienTableProps {
  patients: any[];
  isLoading: boolean;
  searchQuery: string;
}

export default function PasienTable({ patients, isLoading, searchQuery }: PasienTableProps) {
  const [filterLayanan, setFilterLayanan] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter Data di Sisi Klien
  const filteredData = patients.filter((item) => {
    const pName = (item.name || item.fullName || "").toLowerCase();
    const pEmail = (item.email || "").toLowerCase();
    const pPhone = (item.phone || "").toLowerCase();
    const pCode = (item.patientCode || item.code || `P-${String(item.id).substring(0, 3)}`).toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchSearch = pName.includes(query) || pEmail.includes(query) || pPhone.includes(query) || pCode.includes(query);

    const sName = (item.lastService || item.serviceName || "Fisioterapi").toLowerCase();
    const matchService = filterLayanan ? sName.includes(filterLayanan.toLowerCase()) : true;

    return matchSearch && matchService;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Ekspor Data Pasien ke CSV
  const handleExportCsv = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data pasien untuk diekspor!");
      return;
    }

    const headers = ["No", "ID Pasien", "Nama Lengkap", "Email", "Nomor Telepon", "Kunjungan Terakhir", "Layanan Terakhir", "Total Sesi"];
    const rows = filteredData.map((p, i) => {
      const pCode = p.patientCode || p.code || `P-${String(p.id).padStart(3, "0")}`;
      const visitDate = p.lastVisitDate || p.lastBookingDate || "-";
      return [
        i + 1,
        pCode,
        `"${p.name || p.fullName || "-"}"`,
        `"${p.email || "-"}"`,
        `"${p.phone || "-"}"`,
        `" ${visitDate}"`,
        `"${p.lastService || p.serviceName || "Fisioterapi"}"`,
        p.totalSessions || p.totalBookings || 1,
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Pasien_HaiPhysio_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderLayananIcon = (layanan: string) => {
    if (layanan.toLowerCase().includes("neuro")) return <Brain size={14} weight="bold" />;
    if (layanan.toLowerCase().includes("olahraga")) return <Barbell size={14} weight="bold" />;
    return <Bandaids size={14} weight="bold" />;
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      
      {/* FILTER BAR */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          
          {/* Dropdown Filter Layanan */}
          <div className="relative min-w-[200px]">
            <select 
              value={filterLayanan}
              onChange={(e) => setFilterLayanan(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 text-brand-900 font-semibold text-[13px] py-2.5 pl-4 pr-10 rounded-xl outline-none focus:border-gold-600 cursor-pointer"
            >
              <option value="">Semua Layanan</option>
              <option value="Olahraga">Fisioterapi Olahraga</option>
              <option value="Neuro">Fisioterapi Neuro</option>
              <option value="Muskuloskeletal">Fisioterapi Muskuloskeletal</option>
            </select>
            <CaretDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <button 
            onClick={handleExportCsv}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-brand-900 font-bold text-[13px] rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <DownloadSimple size={18} weight="bold" className="text-gold-700" />
            Ekspor CSV
          </button>
        </div>
        
        <span className="text-[13px] text-gray-400 font-medium">
          Total <strong>{filteredData.length}</strong> Pasien Ditemukan
        </span>
      </div>

      {/* TABEL DATA */}
      {isLoading ? (
        <div className="py-24 text-center text-gray-400 font-medium">
          Memuat daftar data pasien...
        </div>
      ) : filteredData.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-3 border border-gray-100">
            <Users size={32} />
          </div>
          <h4 className="text-[17px] font-bold text-brand-900 mb-1">Data Pasien Tidak Ditemukan</h4>
          <p className="text-[13px] text-gray-500 max-w-sm">
            Tidak ada pasien yang sesuai dengan kata kunci pencarian Anda.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">ID Pasien</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Nama Lengkap & Kontak</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Kunjungan Terakhir</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Layanan Terakhir</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-center">Total Sesi</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row) => {
                const pName = row.name || row.fullName || "Pasien";
                const pCode = row.patientCode || row.code || `P-${String(row.id).padStart(3, "0")}`;
                const pPhone = row.phone || "-";
                const pEmail = row.email || "";
                const lastDate = row.lastVisitDate || row.lastBookingDate || "-";
                const serviceName = row.lastService || row.serviceName || "Fisioterapi";
                const totalSessions = row.totalSessions || row.totalBookings || 1;
                const initials = pName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

                return (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors bg-white">
                    <td className="py-5 px-6 text-[14px] font-bold text-brand-900">{pCode}</td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full font-bold flex items-center justify-center text-[12px] shrink-0 bg-brand-900 text-white">
                          {initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-brand-900">{pName}</span>
                          <span className="text-[12px] text-gray-400">{pPhone}</span>
                          {pEmail && pPhone !== pEmail && (
                            <span className="text-[12px] text-gray-400">{pEmail}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-[14px] text-gray-500 font-medium">{lastDate}</td>
                    <td className="py-5 px-6">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-brand-600 text-gold-700 bg-brand-50/40">
                        {renderLayananIcon(serviceName)}
                        <span className="text-[11px] font-bold">{serviceName}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-[14px] font-bold text-brand-900 text-center">
                      {totalSessions} Sesi
                    </td>
                    <td className="py-5 px-6 text-center">
                      <Link 
                        href={`/admin/pasien/detail?id=${row.id}`} 
                        className="inline-flex items-center justify-center gap-1.5 text-gold-700 hover:text-gold-800 transition-colors font-bold text-[14px] px-3 py-1.5 rounded-lg hover:bg-brand-50"
                      >
                        Lihat Detail <CaretRight size={14} weight="bold" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      {!isLoading && filteredData.length > 0 && (
        <div className="px-6 py-4 flex items-center justify-between bg-gray-50/50 border-t border-gray-100">
          <span className="text-[13px] text-gray-500">
            Menampilkan <strong>{paginatedData.length}</strong> dari <strong>{filteredData.length}</strong> Pasien
          </span>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-40"
            >
              <CaretLeft size={16} weight="bold" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg font-bold text-[13px] transition-colors ${
                  currentPage === i + 1
                    ? "bg-brand-900 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-40"
            >
              <CaretRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
