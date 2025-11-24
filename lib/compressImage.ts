export async function compressImage(file: File, maxSizeMB: number = 1): Promise<File> {
  // Skip if not an image or already small
  if (!file.type.startsWith('image/') || file.size < maxSizeMB * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        // Max dimensions
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1920;
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = (width * MAX_HEIGHT) / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Compress to JPEG at 70% quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              const originalMB = (file.size / 1024 / 1024).toFixed(2);
              const compressedMB = (blob.size / 1024 / 1024).toFixed(2);
              console.log(`📦 Compressed ${file.name}: ${originalMB}MB → ${compressedMB}MB`);
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.7 // 70% quality
        );
      };
    };
  });
}

// Compress all files in array
export async function compressImages(files: File[]): Promise<File[]> {
  const compressed = await Promise.all(
    files.map(file => compressImage(file, 1)) // Max 1MB per image
  );
  return compressed;
}
