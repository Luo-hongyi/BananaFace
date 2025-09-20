

export const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [header, data] = result.split(',');
      const mimeType = header?.split(';')[0]?.split(':')[1];

      if (data && mimeType) {
        resolve({ base64: data, mimeType });
      } else {
        reject(new Error("Failed to parse file and convert to base64."));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const addWatermark = (base64Image: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Watermark settings (强制使用你指定的文案)
      const watermarkText = '';
      const padding = img.width * 0.02; // 2% padding from the edge
      const fontSize = Math.max(12, Math.round(img.width / 50)); // Responsive font size, min 12px

      ctx.font = `400 ${fontSize}px sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; // White with 60% opacity
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';

      // Draw the watermark
      ctx.fillText(watermarkText, canvas.width - padding, canvas.height - padding);

      // Get the new base64 string, extracting just the data part
      const dataUrl = canvas.toDataURL('image/png');
      const [, base64Data] = dataUrl.split(',');

      if (base64Data) {
        resolve(base64Data);
      } else {
        reject(new Error("Failed to create watermarked image from canvas."));
      }
    };
    img.onerror = (error) => {
      reject(error instanceof Event ? new Error('Image loading failed.') : error);
    };
    img.src = `data:image/png;base64,${base64Image}`;
  });
};
