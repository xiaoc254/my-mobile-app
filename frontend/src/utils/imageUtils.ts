// 图片处理工具函数

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

/**
 * 压缩图片到指定大小和质量
 * @param file 原始图片文件
 * @param options 压缩选项
 * @returns Promise<string> 压缩后的base64数据
 */
export const compressImage = (
  file: File,
  options: CompressionOptions = {}
): Promise<string> => {
  const {
    maxWidth = 400,
    maxHeight = 400,
    quality = 0.6,
    maxSizeKB = 150
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    if (!ctx) {
      reject(new Error("无法创建Canvas上下文"));
      return;
    }

    img.onload = () => {
      try {
        // 计算压缩后的尺寸
        let { width, height } = img;

        // 按比例缩放到最大尺寸
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const ratio = Math.min(widthRatio, heightRatio, 1);

        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);

        canvas.width = width;
        canvas.height = height;

        // 绘制压缩后的图片
        ctx.drawImage(img, 0, 0, width, height);

        // 尝试不同质量等级
        const tryCompress = (currentQuality: number): string => {
          const dataUrl = canvas.toDataURL("image/jpeg", currentQuality);
          const sizeInKB = (dataUrl.length * 0.75) / 1024;

          console.log(`图片压缩: ${width}x${height}, 质量: ${currentQuality}, 大小: ${sizeInKB.toFixed(1)}KB`);

          // 如果大小合适或质量已经很低，返回结果
          if (sizeInKB <= maxSizeKB || currentQuality <= 0.1) {
            return dataUrl;
          }

          // 递归降低质量
          return tryCompress(Math.max(0.1, currentQuality - 0.1));
        };

        const result = tryCompress(quality);
        resolve(result);

      } catch (error) {
        reject(error);
      } finally {
        // 清理资源
        URL.revokeObjectURL(img.src);
      }
    };

    img.onerror = () => {
      reject(new Error("图片加载失败"));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * 检查文件是否为有效图片
 * @param file 文件对象
 * @returns boolean
 */
export const isValidImage = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns string 格式化后的大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
