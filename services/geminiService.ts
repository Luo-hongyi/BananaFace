
import { GoogleGenAI, Modality } from "@google/genai";
import { fetchImageAsPngBase64, pickNearestQwenSizeByRatio } from "../utils/imageFetch";

// Provider 选择：默认 google，可通过环境变量切换到 qwen
const PROVIDER = (process.env.IMAGE_PROVIDER || 'google').toLowerCase();

let lastSeed: string | null = null;

// Google SDK（保留回退）
const apiKey = process.env.API_KEY as string;
const ai = new GoogleGenAI({ apiKey });

const handleError = (error: unknown, context: string): never => {
    console.error(`Error in ${context}:`, error);
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("Unknown error");
};

// ========== Qwen Provider 实现（按 API.md 与你的确认） ==========
const QWEN_GENERATE_ENDPOINT = process.env.QWEN_IMAGE_API_GENERATE || '';
const QWEN_EDIT_ENDPOINT = process.env.QWEN_IMAGE_API_EDIT || '';
const QWEN_API_KEY = process.env.QWEN_API_KEY || '';

const qwenDefaults = {
    // 默认值：你的确认参数
    num_inference_steps: 50,
    guidance_scale: 7.5,
    cfg: 4.0,
};

// 轻量网络重试：仅针对网络层错误（连接被关闭/Failed to fetch），不处理 429/4xx/5xx
async function qwenPostJSON(url: string, body: any): Promise<any> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (QWEN_API_KEY) headers['Authorization'] = `Bearer ${QWEN_API_KEY}`;

    const doFetch = async () => {
        const res = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            mode: 'cors',
            cache: 'no-store',
            credentials: 'omit',
        });
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`Qwen request failed: ${res.status} ${res.statusText}${text ? `\n${text}` : ''}`);
        }
        // 可能为 JSON 或空
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) return res.json();
        const text = await res.text().catch(() => '');
        try { return JSON.parse(text); } catch { return { raw: text }; }
    };

    try {
        return await doFetch();
    } catch (e: any) {
        const msg = String(e?.message || e);
        const isNetworkLayer = /Failed to fetch|ERR_CONNECTION_CLOSED|NetworkError/i.test(msg);
        if (isNetworkLayer) {
            // 一次短暂重试，避免偶发连接关闭
            await new Promise(r => setTimeout(r, 350));
            return await doFetch();
        }
        throw e;
    }
}

const qwenGenerate = async (prompt: string): Promise<string> => {
    if (!QWEN_GENERATE_ENDPOINT) {
        throw new Error('QWEN_IMAGE_API_GENERATE is not configured');
    }
    // 文生图默认使用竖图 3:4 档位（1140x1472）
    const image_size = '1140x1472';

    const body: any = {
        model: 'Qwen/Qwen-Image',
        prompt,
        image_size,
        num_inference_steps: qwenDefaults.num_inference_steps,
        guidance_scale: qwenDefaults.guidance_scale,
        cfg: qwenDefaults.cfg,
    };

    const data = await qwenPostJSON(QWEN_GENERATE_ENDPOINT, body);
    if (data && typeof data.seed !== 'undefined') {
        lastSeed = String(data.seed);
    } else {
        lastSeed = null;
    }
    let url: string | undefined = data?.image_url;
    if (!url) url = data?.images?.[0]?.url || data?.data?.[0]?.url;
    if (!url || typeof url !== 'string') {
        throw new Error('Qwen generate response missing image_url or images[0].url');
    }
    const { base64 } = await fetchImageAsPngBase64(url);
    return base64;
};

const qwenGetImageDims = (base64: string, mimeType: string): Promise<{ w: number; h: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => resolve({ w: 0, h: 0 }); // 无法解析时走默认
        img.src = `data:${mimeType};base64,${base64}`;
    });
};

const qwenEdit = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    if (!QWEN_EDIT_ENDPOINT) {
        throw new Error('QWEN_IMAGE_API_EDIT is not configured');
    }

    // 根据原图尺寸与纵横比选择最接近的 Qwen 档位
    const { w, h } = await qwenGetImageDims(base64ImageData, mimeType);
    const image_size = pickNearestQwenSizeByRatio(w, h);

    const body: any = {
        model: 'Qwen/Qwen-Image-Edit',
        prompt,
        image: `data:${mimeType};base64,${base64ImageData}`,
        image_size,
        num_inference_steps: qwenDefaults.num_inference_steps,
        guidance_scale: qwenDefaults.guidance_scale,
        cfg: qwenDefaults.cfg,
    };

    const data = await qwenPostJSON(QWEN_EDIT_ENDPOINT, body);
    if (data && typeof data.seed !== 'undefined') {
        lastSeed = String(data.seed);
    } else {
        lastSeed = null;
    }
    const url = data?.images?.[0]?.url || data?.data?.[0]?.url;
    if (!url || typeof url !== 'string') {
        throw new Error('Qwen edit response missing image URL');
    }
    const { base64 } = await fetchImageAsPngBase64(url);
    return base64;
};

// ========== 现有 Google Provider（保持不变，作为回退） ==========
export const generatePortrait = async (prompt: string): Promise<string> => {
    if (PROVIDER === 'qwen') {
        try { return await qwenGenerate(prompt); } catch (e) { handleError(e, 'qwen.generate'); }
    }
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '3:4',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }
        throw new Error("No image was generated. The model may have refused the request due to safety policies.");
    } catch (error) {
        handleError(error, "google.generatePortrait");
    }
};

export const editPortrait = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    if (PROVIDER === 'qwen') {
        try { return await qwenEdit(base64ImageData, mimeType, prompt); } catch (e) { handleError(e, 'qwen.edit'); }
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        let textResponse = '';
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
            if (part.text) {
                textResponse += part.text;
            }
        }
        
        const errorMessage = textResponse 
            ? `Model returned text instead of an image: "${textResponse}"`
            : "No image was returned from the edit request. The model may have refused the request.";

        throw new Error(errorMessage);
    } catch (error) {
        handleError(error, "google.editPortrait");
    }
};

export const getLastSeed = (): string | null => lastSeed;
