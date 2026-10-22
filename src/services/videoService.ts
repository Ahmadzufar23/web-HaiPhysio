import { bookingApi } from "@/app/utils/api";
import type { ApiSuccess, StaffVideoFolder, StaffVideoProgram, TherapyVideo, VideoDetail, VideoFolder, VideoProgram } from "@/types/api.types";

// Perpustakaan video terapi, program latihan pasien, dan check-in harian.
export const videoService = {
  // ---------- Pasien ----------
  getFolders: async (): Promise<ApiSuccess<{ folders: VideoFolder[] }>> => (await bookingApi.get("/videos/folders")).data,

  getFolder: async (slug: string): Promise<ApiSuccess<{ folder: Omit<VideoFolder, "videoCount" | "coverUrl">; videos: TherapyVideo[] }>> =>
    (await bookingApi.get(`/videos/folders/${slug}`)).data,

  getVideo: async (id: string): Promise<ApiSuccess<VideoDetail>> => (await bookingApi.get(`/videos/${id}`)).data,

  getMyProgram: async (): Promise<ApiSuccess<{ program: VideoProgram }>> => (await bookingApi.get("/videos/program")).data,

  // Dipanggil player saat video program ditonton sampai habis
  // watchToken dari getVideo: server menolak check-in yang datang terlalu cepat untuk durasi videonya
  checkin: async (assignmentId: string, watchedSeconds: number, durationSeconds: number, watchToken: string): Promise<ApiSuccess<{ program: VideoProgram }>> =>
    (
      await bookingApi.post(`/videos/program/${assignmentId}/checkin`, {
        watched_seconds: watchedSeconds,
        duration_seconds: durationSeconds,
        watch_token: watchToken,
      })
    ).data,

  // ---------- Staf ----------
  getLibrary: async (): Promise<ApiSuccess<{ folders: StaffVideoFolder[] }>> => (await bookingApi.get("/admin/videos")).data,

  createFolder: async (data: { name: string; description?: string }) => (await bookingApi.post("/admin/video-folders", data)).data,
  updateFolder: async (id: string, data: { name?: string; description?: string }) => (await bookingApi.patch(`/admin/video-folders/${id}`, data)).data,
  deleteFolder: async (id: string) => (await bookingApi.delete(`/admin/video-folders/${id}`)).data,

  createVideo: async (
    data: { folder_id: string; title: string; description?: string } & ({ source: "youtube"; youtube_url: string } | { source: "upload"; duration_seconds?: number; poster?: string })
  ): Promise<ApiSuccess<{ video: TherapyVideo }>> => (await bookingApi.post("/admin/videos", data)).data,

  // Body mentah supaya file besar tidak perlu di-encode; progres untuk bar unggah
  uploadVideoFile: async (id: string, file: File, onProgress: (ratio: number) => void): Promise<ApiSuccess<{ video: TherapyVideo }>> =>
    (
      await bookingApi.put(`/admin/videos/${id}/file`, file, {
        headers: { "Content-Type": file.type },
        timeout: 0,
        onUploadProgress: (e) => e.total && onProgress(e.loaded / e.total),
      })
    ).data,

  updateVideo: async (id: string, data: { folder_id?: string; title?: string; description?: string; is_active?: boolean }) =>
    (await bookingApi.patch(`/admin/videos/${id}`, data)).data,

  deleteVideo: async (id: string): Promise<ApiSuccess<{ deleted: boolean; deactivated: boolean }>> => (await bookingApi.delete(`/admin/videos/${id}`)).data,

  getPatientProgram: async (patientId: string): Promise<ApiSuccess<{ program: StaffVideoProgram }>> =>
    (await bookingApi.get(`/admin/patients/${patientId}/program`)).data,

  assignVideo: async (patientId: string, videoId: string, dosage: string): Promise<ApiSuccess<{ program: StaffVideoProgram }>> =>
    (await bookingApi.post(`/admin/patients/${patientId}/program`, { video_id: videoId, dosage })).data,

  endAssignment: async (patientId: string, assignmentId: string): Promise<ApiSuccess<{ program: StaffVideoProgram }>> =>
    (await bookingApi.delete(`/admin/patients/${patientId}/program/${assignmentId}`)).data,
};
