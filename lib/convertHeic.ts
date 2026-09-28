export function looksLikeHeic(file: File): boolean {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return (
    type === 'image/heic' ||
    type === 'image/heif' ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  );
}

const MAX_DIMENSION = 2560;
const JPEG_QUALITY = 0.82;
const SKIP_IF_UNDER = 0;// small images that are already reasonable: leave alone

async function heicToJpeg(file: File): Promise<File> {
  const { heicTo, isHeic } = await import('heic-to');
  if (!(await isHeic(file))) return file;
  const blob = await heicTo({ blob: file, type: 'image/jpeg', quality: 0.92 });
  return new File([blob], file.name.replace(/\.(heic|heif)$/i, '') + '.jpg', {
    type: 'image/jpeg',
    lastModified: file.lastModified,
  });
}

async function downscale(file: File): Promise<File> {
  // Only raster images; skip GIFs (would lose animation) and non-images (PDFs, docs)
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file); // applies EXIF rotation in modern browsers
  } catch {
    return file; // browser can't decode it; send as-is
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < SKIP_IF_UNDER) {
    bitmap.close();
    return file;
  }

  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return file;
  }

  // White background so transparent PNGs don't turn black as JPEG
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
  );
  if (!blob) return file;
  // PNGs always use the re-encoded version (originals can fail server-side);
  // other formats keep the original if re-encoding made it bigger
  if (file.type !== 'image/png' && blob.size >= file.size) return file;
  
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', {
    type: 'image/jpeg',
    lastModified: file.lastModified,
  });
}

export async function normalizeImageFile(file: File): Promise<File> {
  const converted = looksLikeHeic(file) ? await heicToJpeg(file) : file;
  return downscale(converted);
}

export function safeFileName(name: string): string {
  const dot = name.lastIndexOf('.');
  const rawBase = dot > 0 ? name.slice(0, dot) : name;
  const rawExt = dot > 0 ? name.slice(dot + 1) : 'jpg';
  const base = rawBase
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '_') // strips spaces, U+202F, emoji, etc.
    .replace(/_+/g, '_')
    .slice(0, 80) || 'photo';
  const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  return `${base}.${ext}`;
}