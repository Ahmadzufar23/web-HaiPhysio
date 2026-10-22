// Perkecil foto di browser sebelum diunggah: potong persegi di tengah, ubah ke JPEG.
// Hasil 320×320 kualitas 0.85 biasanya 20–40 KB, jauh di bawah batas 200 KB backend.

const MAX_INPUT_BYTES = 10 * 1024 * 1024;

export async function resizeToSquareJpeg(file: File, size = 320, quality = 0.85): Promise<string> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("Pilih foto JPG, PNG, atau WebP.");
  if (file.size > MAX_INPUT_BYTES) throw new Error("Ukuran foto maksimal 10 MB.");

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("Foto tidak bisa dibaca. Coba file lain.");
  });
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Browser tidak mendukung pengolahan foto.");
  ctx.fillStyle = "#fff"; // latar putih untuk PNG transparan
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", quality);
}
