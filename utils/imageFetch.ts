export async function fetchImageAsPngBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  // 以最小依赖的方式在浏览器端拉取图片，并转为 PNG Base64
  // 说明：若远端 CORS 未开放，将抛出错误，按约定不做代理与重试
  // 通过本地 Vite 中间件代理，规避跨域限制
  const proxied = `/api/image-proxy?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxied, { mode: 'same-origin' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Fetch image failed: ${res.status} ${res.statusText}${text ? `\n${text}` : ''}`);
  }

  const blob = await res.blob();

  // 将 blob 读成 DataURL
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error('Failed to read image blob'));
    reader.readAsDataURL(blob);
  });

  // 用 <img> 加载，再绘制到 canvas 并导出为 PNG，确保后续水印逻辑一致
  const pngBase64: string = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not get canvas context'));
        ctx.drawImage(img, 0, 0);
        const out = canvas.toDataURL('image/png');
        const [, base64] = out.split(',');
        if (!base64) return reject(new Error('Failed to export PNG base64'));
        resolve(base64);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('Failed to load data URL for conversion'));
    img.src = dataUrl;
  });

  return { base64: pngBase64, mimeType: 'image/png' };
}

export function pickNearestQwenSizeByRatio(width: number, height: number): string {
  // Qwen 可用档位（你提供的清单）
  const sizes = [
    { w: 1328, h: 1328 }, // 1:1
    { w: 1664, h: 928 },  // 16:9
    { w: 928,  h: 1664 }, // 9:16
    { w: 1472, h: 1140 }, // 4:3
    { w: 1140, h: 1472 }, // 3:4
    { w: 1584, h: 1056 }, // 3:2
    { w: 1056, h: 1584 }, // 2:3
  ];

  const target = width > 0 && height > 0 ? width / height : 1140 / 1472; // 默认偏向竖图 3:4
  let best = sizes[0];
  let bestDiff = Infinity;

  for (const s of sizes) {
    const r = s.w / s.h;
    const diff = Math.abs(r - target);
    // 偏向与输入同方向（横/竖），同向时优先
    const sameOrientation = (width >= height) === (s.w >= s.h);
    const penalty = sameOrientation ? 0 : 0.05; // 轻微惩罚非同向
    const score = diff + penalty;
    if (score < bestDiff) {
      bestDiff = score;
      best = s;
    }
  }

  return `${best.w}x${best.h}`;
}
