"use client";

import { useState, useEffect } from "react";
import { MagnifyingGlass, CaretDown, DownloadSimple, CheckCircle, Brain, Barbell, Bandaids, CalendarX, Clock, XCircle, Prohibit } from "@phosphor-icons/react";
import { adminService } from "@/services/adminService";

interface TabRiwayatProps {
  therapistName?: string;
  therapistId?: string;
}

export default function TabRiwayat({ therapistName, therapistId }: TabRiwayatProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchTherapistSessions = async () => {
      setIsLoading(true);
      try {
        const res = await adminService.getBookings();
        const allBookings = res.data.bookings || [];

        // Filter sesi milik terapis ini secara akurat
        const filtered = allBookings.filter((b: any) => {
          const tId = b.therapistId || b.therapist_id;
          const tName = (b.therapistName || b.therapist_name || "").toLowerCase();
          const targetName = (therapistName || "").toLowerCase().trim();

          if (therapistId && tId) {
            return String(tId) === String(therapistId);
          }
          if (targetName) {
            return tName.includes(targetName) || targetName.includes(tName);
          }
          return true;
        });

        setSessions(filtered);
      } catch (error) {
        console.error("Gagal memuat riwayat sesi terapis:", error);
        setSessions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTherapistSessions();
  }, [therapistName, therapistId]);

  // Reset pagination saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search, serviceFilter, statusFilter]);

  // Filter di sisi client
  const filteredData = sessions.filter((s: any) => {
    const pName = (s.patientName || s.patient_name || "").toLowerCase();
    const refCode = (s.referenceCode || s.bookingReferenceCode || s.code || "").toLowerCase();
    const matchSearch = pName.includes(search.toLowerCase()) || refCode.includes(search.toLowerCase());
    
    // Cari nama layanan dari therapistSpecializations atau serviceName
    const rawServiceName = (s.focusArea?.name || s.therapistSpecializations?.[0]?.name) || s.serviceName || s.service_name || s.specialization || "";
    const sName = rawServiceName.toLowerCase();
    const matchService = serviceFilter ? sName.includes(serviceFilter.toLowerCase()) : true;

    // Ambil status dari bookingStatus atau status
    const st = (s.bookingStatus || s.status || "").toLowerCase();
    const matchStatus = statusFilter ? st === statusFilter.toLowerCase() : true;

    return matchSearch && matchService && matchStatus;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderLayananIcon = (layanan: string) => {
    const low = (layanan || "").toLowerCase();
    if (low.includes("neuro")) return <Brain size={14} weight="bold" />;
    if (low.includes("olahraga")) return <Barbell size={14} weight="bold" />;
    return <Bandaids size={14} weight="bold" />;
  };

  const renderStatus = (statusRaw: string) => {
    const status = (statusRaw || "").toLowerCase();
    let label = "Terkonfirmasi";
    let colorClass = "border-green-500 text-green-600 bg-green-50/50";
    let Icon = CheckCircle;

    if (status === "selesai") {
      label = "Selesai";
      colorClass = "border-gray-300 text-gray-500 bg-gray-50";
      Icon = CheckCircle;
    } else if (status === "dibatalkan") {
      label = "Dibatalkan";
      colorClass = "border-red-300 text-red-500 bg-red-50/50";
      Icon = XCircle;
    } else if (status === "tidak_hadir") {
      label = "Tidak Hadir";
      colorClass = "border-orange-300 text-orange-500 bg-orange-50/50";
      Icon = Prohibit;
    }

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[12px] font-bold ${colorClass}`}>
        <Icon size={15} weight="fill" />
        <span>{label}</span>
      </div>
    );
  };

  // Ekspor CSV
  const handleExportCsv = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada riwayat sesi untuk diekspor!");
      return;
    }

    const headers = ["No", "Kode Reservasi", "Tanggal", "Waktu", "Nama Pasien", "Layanan", "Status"];
    const rows = filteredData.map((s, i) => {
      const sName = (s.focusArea?.name || s.therapistSpecializations?.[0]?.name) ? `Fisioterapi ${s.focusArea?.name || s.therapistSpecializations[0].name}` : s.serviceName || s.service_name || "Fisioterapi";
      const dateStr = s.bookingDate || s.slotDate || s.slot_date || "-";
      const timeStr = s.bookingTime ? `${s.bookingTime.substring(0, 5)} WIB` : s.startTime ? `${s.startTime.substring(0, 5)} - ${(s.endTime || "").substring(0, 5)} WIB` : "-";
      const refCode = s.referenceCode || s.bookingReferenceCode || s.code || `#HP-${String(s.id).substring(0, 6)}`;
      const status = s.bookingStatus || s.status || "-";

      return [
        i + 1,
        refCode,
        `" ${dateStr.substring(0, 10)}"`,
        `" ${timeStr}"`,
        `"${s.patientName || s.patient_name || "-"}"`,
        `"${sName}"`,
        status,
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Riwayat_Sesi_${(therapistName || "Terapis").replace(/[^a-zA-Z0-9]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Filter Bar */}
      <div className="flex flex-col xl:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pasien atau kode reservasi..." 
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-[14px] text-brand-900 outline-none focus:border-gold-600 bg-white shadow-sm" 
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Filter Layanan */}
          <div className="relative min-w-[190px]">
            <select 
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 text-[#585858] text-[13px] font-semibold py-3 pl-4 pr-10 rounded-xl outline-none focus:border-gold-600 cursor-pointer shadow-sm"
            >
              <option value="">Semua Layanan</option>
              <option value="Olahraga">Fisioterapi Olahraga</option>
              <option value="Neuro">Fisioterapi Neuro</option>
              <option value="Muskuloskeletal">Fisioterapi Muskuloskeletal</option>
            </select>
            <CaretDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Filter Status */}
          <div className="relative min-w-[160px]">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 text-[#585858] text-[13px] font-semibold py-3 pl-4 pr-10 rounded-xl outline-none focus:border-gold-600 cursor-pointer shadow-sm"
            >
              <option value="">Semua Status</option>
              <option value="terkonfirmasi">Terkonfirmasi</option>
              <option value="selesai">Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
              <option value="tidak_hadir">Tidak Hadir</option>
            </select>
            <CaretDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Tombol Ekspor */}
          <button 
            onClick={handleExportCsv}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-200 text-brand-900 font-bold text-[13px] rounded-xl hover:bg-gray-50 shadow-sm transition-colors"
          >
            <DownloadSimple size={18} weight="bold" className="text-gold-700" />
            Ekspor CSV
          </button>
        </div>
      </div>

      {/* Tabel Riwayat */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="py-20 text-center text-gray-400 font-medium">
            Memuat riwayat sesi konsultasi...
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-3 border border-gray-100">
              <CalendarX size={32} />
            </div>
            <h4 className="text-[17px] font-bold text-brand-900 mb-1">Data Sesi Tidak Ditemukan</h4>
            <p className="text-[13px] text-gray-500 max-w-sm">
              Tidak ada riwayat sesi yang sesuai dengan kriteria filter atau pencarian Anda.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Tanggal & Waktu</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Nama Pasien</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Tipe Layanan</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row: any) => {
                  const pName = row.patientName || row.patient_name || "Pasien";
                  const rawServiceName = (row.focusArea?.name || row.therapistSpecializations?.[0]?.name) ? `Fisioterapi ${row.focusArea?.name || row.therapistSpecializations[0].name}` : row.serviceName || row.service_name || row.specialization || "Fisioterapi";
                  const dateStr = (row.bookingDate || row.slotDate || row.slot_date || "-").substring(0, 10);
                  const timeStr = row.bookingTime ? `${row.bookingTime.substring(0, 5)} WIB` : row.startTime ? `${row.startTime.substring(0, 5)} - ${(row.endTime || "").substring(0, 5)} WIB` : "-";
                  const refCode = row.referenceCode || row.bookingReferenceCode || row.code || `#HP-${String(row.id).substring(0, 6)}`;
                  const initials = pName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "PS";
                  const status = row.bookingStatus || row.status || "terkonfirmasi";

                  return (
                    <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50 bg-white transition-colors">
                      <td className="py-5 px-6">
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-brand-900">{dateStr}</span>
                          <span className="text-[12px] text-gray-400">{timeStr}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#E0E7FF] text-[#3730A3] font-bold flex items-center justify-center text-[11px] shrink-0">
                            {initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[14px] font-bold text-brand-900">{pName}</span>
                            <span className="text-[11px] text-gray-400 font-mono">{refCode}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-brand-600 text-gold-700 bg-brand-50/40">
                          {renderLayananIcon(rawServiceName)}
                          <span className="text-[11px] font-bold">{rawServiceName}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        {renderStatus(status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!isLoading && filteredData.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-[13px] text-gray-500">
              Menampilkan <strong>{paginatedData.length}</strong> dari <strong>{filteredData.length}</strong> sesi
            </span>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                {'<'}
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
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                {'>'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
