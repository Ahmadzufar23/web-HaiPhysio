import StatCards from "@/components/admin/dashboard/StatCards";
import ScheduleTable from "@/components/admin/dashboard/ScheduleTable";

export default function AdminDashboardPage() {
  return (
    <div className="w-full flex flex-col gap-8">
      
      {/* Judul & Deskripsi Halaman */}
      <div className="flex flex-col gap-1">
        <h2 className="text-[28px] font-bold text-brand-900">Dashboard</h2>
        <p className="text-[#585858] text-[15px]">Ringkasan operasional klinik hari ini.</p>
      </div>

      {/* Komponen Stat Cards (Fase 2) */}
      <StatCards />

      {/* Komponen Tabel Jadwal (Fase 2) */}
      <ScheduleTable />

    </div>
  );
}