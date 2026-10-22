"use client";

import { useState } from "react";
import { CalendarBlank, Trash, CheckCircle, CalendarX, Sparkle, WarningCircle, CheckSquare, Square, ToggleLeft, Power } from "@phosphor-icons/react";
import { adminService } from "@/services/adminService";
import type { AdminSlot } from "@/types/api.types";

interface ScheduleGridProps {
  slots: AdminSlot[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenGenerateModal: () => void;
}

export default function ScheduleGrid({ slots, isLoading, onRefresh, onOpenGenerateModal }: ScheduleGridProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<string | number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);
  const [isToggling, setIsToggling] = useState<string | number | null>(null);

  // === BULK SELECT STATE ===
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const showNotification = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // === BULK HANDLERS ===
  const toggleSelectAll = () => {
    if (selectedIds.size === slots.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(slots.map((s) => String(s.id))));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const exitBulkMode = () => {
    setIsBulkMode(false);
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    setIsBulkProcessing(true);
    let successCount = 0;
    let failCount = 0;
    for (const id of selectedIds) {
      try {
        await adminService.deleteSlot(id);
        successCount++;
      } catch {
        failCount++;
      }
    }
    setIsBulkDeleteModalOpen(false);
    exitBulkMode();
    onRefresh();
    if (failCount === 0) showNotification(`${successCount} slot berhasil dihapus`, "success");
    else showNotification(`${successCount} berhasil, ${failCount} gagal dihapus`, "warning");
    setIsBulkProcessing(false);
  };

  const handleBulkToggle = async (activate: boolean) => {
    setIsBulkProcessing(true);
    let successCount = 0;
    let failCount = 0;
    for (const id of selectedIds) {
      try {
        await adminService.toggleSlot(id, activate);
        successCount++;
      } catch {
        failCount++;
      }
    }
    exitBulkMode();
    onRefresh();
    const action = activate ? "diaktifkan" : "dinonaktifkan";
    if (failCount === 0) showNotification(`${successCount} slot berhasil ${action}`, "success");
    else showNotification(`${successCount} berhasil, ${failCount} gagal ${action}`, "warning");
    setIsBulkProcessing(false);
  };

  // === SINGLE HANDLERS ===
  const handleToggle = async (slotId: string | number, isActive: boolean) => {
    setIsToggling(slotId);
    const targetStatus = !isActive; // flip: kalau aktif → nonaktifkan, kalau off → aktifkan
    try {
      await adminService.toggleSlot(String(slotId), targetStatus);
      showNotification(`Status slot berhasil ${targetStatus ? "diaktifkan" : "dinonaktifkan"}`);
      onRefresh();
    } catch (error) {
      console.error("Gagal toggle status slot:", error);
      showNotification("Gagal mengubah status slot", "error");
      onRefresh();
    } finally {
      setIsToggling(null);
    }
  };

  const handleDeleteClick = (id: string | number) => {
    setSlotToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (slotToDelete !== null) {
      try {
        await adminService.deleteSlot(String(slotToDelete));
        setIsDeleteModalOpen(false);
        setSlotToDelete(null);
        showNotification("Slot jadwal berhasil dihapus");
        onRefresh();
      } catch (error) {
        console.error("Gagal menghapus slot:", error);
        setIsDeleteModalOpen(false);
        showNotification("Gagal menghapus slot jadwal", "error");
      }
    }
  };

  // === LOADING & EMPTY STATE ===
  if (isLoading) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center text-center">
        <div className="text-[14px] font-bold text-brand-900 animate-pulse">
          Memuat data slot jadwal...
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-3 border border-gray-100">
          <CalendarX size={32} />
        </div>
        <h4 className="text-[15px] font-bold text-brand-900 mb-1">Belum Ada Slot Jadwal</h4>
        <p className="text-[13px] text-gray-500 max-w-md mb-6">
          Belum ada slot waktu yang dibuat untuk terapis dan tanggal ini. Anda dapat membuat slot otomatis untuk 1 pekan ke depan.
        </p>
        <button
          onClick={onOpenGenerateModal}
          className="px-6 py-3 bg-brand-900 hover:bg-brand-950 text-white font-bold text-[13px] rounded-xl flex items-center gap-2 transition-colors shadow-sm"
        >
          <Sparkle size={18} weight="fill" className="text-gold-700" />
          Generate Slot 1 Pekan Otomatis
        </button>
      </div>
    );
  }

  const allSelected = selectedIds.size === slots.length && slots.length > 0;
  const someSelected = selectedIds.size > 0 && !allSelected;

  return (
    <>
      {/* === BULK SELECT TOOLBAR === */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          {!isBulkMode ? (
            <button
              onClick={() => setIsBulkMode(true)}
              className="flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-brand-900 bg-white border border-gray-200 hover:border-brand-900 rounded-xl transition-all shadow-sm"
            >
              <CheckSquare size={18} />
              Pilih Massal
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Checkbox Pilih Semua */}
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-brand-900 bg-white border border-gray-200 hover:border-brand-900 rounded-xl transition-all shadow-sm"
              >
                {allSelected ? (
                  <CheckSquare size={18} weight="fill" className="text-gold-700" />
                ) : someSelected ? (
                  <CheckSquare size={18} weight="duotone" className="text-gold-700" />
                ) : (
                  <Square size={18} className="text-gray-400" />
                )}
                {allSelected ? "Batal Semua" : "Pilih Semua"}
              </button>

              {/* Aksi Bulk (muncul kalau ada yang dipilih) */}
              {selectedIds.size > 0 && (
                <>
                  <span className="text-[13px] font-bold text-brand-900 px-2">
                    {selectedIds.size} dipilih
                  </span>
                  <button
                    onClick={() => handleBulkToggle(true)}
                    disabled={isBulkProcessing}
                    className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold text-white bg-[#3f3f46] hover:bg-green-600 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Power size={16} weight="bold" />
                    Aktifkan
                  </button>
                  <button
                    onClick={() => handleBulkToggle(false)}
                    disabled={isBulkProcessing}
                    className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold text-[#585858] bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                  >
                    <ToggleLeft size={16} weight="bold" />
                    Nonaktifkan
                  </button>
                  <button
                    onClick={() => setIsBulkDeleteModalOpen(true)}
                    disabled={isBulkProcessing}
                    className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Trash size={16} weight="bold" />
                    Hapus
                  </button>
                </>
              )}

              <button
                onClick={exitBulkMode}
                className="px-3 py-2 text-[13px] font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Selesai
              </button>
            </div>
          )}
        </div>
      </div>

      {/* === GRID KARTU SLOT === */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-0">
        {slots.map((slot) => {
          const isBooked = slot.bookedCount > 0;
          const isActive = slot.status === "aktif";
          const slotIdStr = String(slot.id);
          const isSelected = selectedIds.has(slotIdStr);

          const timeDisplay = `${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}`;
          const therapistName = slot.therapistName;

          let statusLabel = "Tersedia";
          let badgeStyle = "bg-green-50 text-green-600 border border-green-100";
          let dotStyle = "bg-green-500";
          let cardBg = "bg-white border-gray-200";

          if (isBooked) {
            statusLabel = "Terisi Pasien";
            badgeStyle = "bg-gray-100 text-gray-400 border border-gray-200";
            dotStyle = "bg-gray-400";
            cardBg = "bg-brand-50 border-brand-100";
          } else if (!isActive) {
            statusLabel = "Nonaktif";
            badgeStyle = "bg-[#f4f4f4] text-[#a1a1a1] border border-gray-200";
            dotStyle = "hidden";
            cardBg = "bg-gray-50/70 border-gray-200 opacity-75";
          }

          if (isSelected) {
            cardBg = "bg-brand-50 border-brand-600 ring-2 ring-brand-600/30";
          }

          return (
            <div
              key={slot.id}
              className={`flex flex-col rounded-2xl border p-5 transition-all shadow-sm ${cardBg} ${isBulkMode ? "cursor-pointer select-none" : ""}`}
              onClick={() => isBulkMode && toggleSelectOne(slotIdStr)}
            >
              {/* Checkbox (hanya di bulk mode) */}
              {isBulkMode && (
                <div className="flex justify-end mb-2">
                  {isSelected
                    ? <CheckSquare size={22} weight="fill" className="text-gold-700" />
                    : <Square size={22} className="text-gray-300" />
                  }
                </div>
              )}

              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                  <span className="text-[19px] font-bold text-brand-900 leading-tight">
                    {timeDisplay} WIB
                  </span>
                  {therapistName && (
                    <span className="text-[12px] text-gray-500 font-medium truncate max-w-[140px] mt-0.5">
                      {therapistName}
                    </span>
                  )}
                </div>
                <div className="p-2 border border-gray-200 rounded-lg bg-white text-gray-400 shrink-0">
                  <CalendarBlank size={18} />
                </div>
              </div>

              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full w-max my-3 ${badgeStyle}`}>
                {dotStyle !== "hidden" && <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`}></span>}
                <span className="text-[12px] font-bold">{statusLabel}</span>
              </div>

              <div className="w-full h-[1px] bg-gray-200 mb-4"></div>

              {/* Aksi Individual (sembunyikan saat bulk mode) */}
              {!isBulkMode && (
                <div className="flex justify-between items-center">
                  {/* Switch Toggle Aktif/Off */}
                  <div
                    onClick={(e) => { e.stopPropagation(); !isBooked && !isToggling && handleToggle(slot.id, isActive); }}
                    className={`flex items-center gap-2 ${isBooked ? "cursor-not-allowed opacity-50" : "cursor-pointer group"}`}
                  >
                    <div className={`w-10 h-6 rounded-full p-1 transition-colors flex items-center ${isActive ? 'bg-[#3f3f46]' : 'bg-gray-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                    <span className={`text-[13px] font-bold ${isActive ? 'text-[#3f3f46]' : 'text-gray-400'}`}>
                      {isActive ? 'Aktif' : 'Off'}
                    </span>
                  </div>

                  {/* Tombol Hapus Slot */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(slot.id); }}
                    disabled={isBooked}
                    className="text-red-400 hover:text-red-600 transition-colors p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Hapus Slot Jadwal"
                  >
                    <Trash size={18} weight="fill" />
                  </button>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* === MODAL KONFIRMASI HAPUS SINGLE === */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-3xl p-8 max-w-[400px] w-full flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-[16px] font-bold text-brand-900 mb-2">Hapus Slot Jadwal?</h3>
            <p className="text-[13px] text-gray-500 mb-8">Slot jadwal ini akan dihapus permanen dari sistem.</p>
            <div className="flex gap-4 w-full">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-[#585858] bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors">Batal</button>
              <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl font-bold text-white bg-[#dc2626] hover:bg-red-700 transition-colors shadow-md shadow-red-500/20">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL KONFIRMASI HAPUS BULK === */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-3xl p-8 max-w-[420px] w-full flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <Trash size={28} weight="fill" className="text-red-500" />
            </div>
            <h3 className="text-[16px] font-bold text-brand-900 mb-2">Hapus {selectedIds.size} Slot?</h3>
            <p className="text-[13px] text-gray-500 mb-8">Seluruh slot yang dipilih akan dihapus permanen dan tidak dapat dikembalikan.</p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setIsBulkDeleteModalOpen(false)}
                disabled={isBulkProcessing}
                className="flex-1 py-3 rounded-xl font-bold text-[#585858] bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isBulkProcessing}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-[#dc2626] hover:bg-red-700 transition-colors shadow-md shadow-red-500/20 disabled:opacity-50"
              >
                {isBulkProcessing ? "Menghapus..." : `Hapus ${selectedIds.size} Slot`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === TOAST NOTIFIKASI === */}
      {toast && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-50 animate-in slide-in-from-bottom-5 duration-300 border
          ${toast.type === "success"
            ? "bg-[#f4f4f5] border-[#e4e4e7] text-[#3f3f46]"
            : toast.type === "warning"
            ? "bg-amber-50 border-amber-200 text-amber-700"
            : "bg-[#fef3f2] border-[#fecdca] text-[#b91c1c]"
          }`}
        >
          {toast.type === "success" && <CheckCircle size={20} weight="fill" />}
          {(toast.type === "warning" || toast.type === "error") && <WarningCircle size={20} weight="fill" />}
          <span className="text-[13px] font-bold">{toast.message}</span>
        </div>
      )}
    </>
  );
}
