import Compressor from 'compressorjs';

export interface CompressionOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  convertSize?: number;
}

export const compressImage = (
  file: File,
  options: CompressionOptions = {}
): Promise<string> => {
  const {
    quality = 0.6,
    maxWidth = 800,
    maxHeight = 800,
    convertSize = 5000000, // 5MB
  } = options;

  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality,
      maxWidth,
      maxHeight,
      convertSize,
      convertTypes: ['image/png', 'image/webp'],
      success(result) {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(result as File);
      },
      error: reject,
    });
  });
};

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
