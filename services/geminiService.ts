import { ImageData, EnhancementStyle } from '../types';

const TIMEOUT_MS = 180000;
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 3000;

interface EnhanceProgress {
  stage: 'uploading' | 'processing' | 'downloading' | 'finalizing';
  percent: number;
}

type ProgressCallback = (progress: EnhanceProgress) => void;

const isMobileDevice = (): boolean => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth < 768;
};

const upscaleImage = async (base64Str: string): Promise<string> => {
    if (typeof window === 'undefined') return base64Str;
    
    const isMobile = isMobileDevice();
    const MAX_SAFE_PIXELS_MOBILE = 4000000;
    const MAX_SAFE_PIXELS_DESKTOP = 25000000;
    const TARGET_LONG_EDGE_MOBILE = 2048;
    const TARGET_LONG_EDGE_DESKTOP = 4096;
    
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            try {
                const currentPixels = img.width * img.height;
                const maxSafePixels = isMobile ? MAX_SAFE_PIXELS_MOBILE : MAX_SAFE_PIXELS_DESKTOP;
                const targetLongEdge = isMobile ? TARGET_LONG_EDGE_MOBILE : TARGET_LONG_EDGE_DESKTOP;
                
                if (currentPixels > maxSafePixels) {
                    resolve(base64Str);
                    return;
                }
                
                const currentLongEdge = Math.max(img.width, img.height);
                if (currentLongEdge >= targetLongEdge) {
                    resolve(base64Str);
                    return;
                }
                
                const canvas = document.createElement('canvas');
                const scale = targetLongEdge / currentLongEdge;
                
                const targetWidth = Math.round(img.width * scale);
                const targetHeight = Math.round(img.height * scale);
                
                if (targetWidth * targetHeight > maxSafePixels) {
                    resolve(base64Str);
                    return;
                }

                canvas.width = targetWidth;
                canvas.height = targetHeight;
                
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(base64Str);
                    return;
                }
                
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const quality = isMobile ? 0.85 : 0.95;
                const result = canvas.toDataURL('image/jpeg', quality);
                
                canvas.width = 0;
                canvas.height = 0;
                
                resolve(result);
            } catch (err) {
                resolve(base64Str);
            }
        };
        img.onerror = () => resolve(base64Str);
        img.src = base64Str;
    });
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithTimeout = async (
    url: string, 
    options: RequestInit, 
    timeoutMs: number
): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('RETRY:Timeout - request took too long');
        }
        throw error;
    }
};

const isRetryableError = (error: any): boolean => {
    const message = (error.message || '').toLowerCase();
    return (
        message.includes('retry:') ||
        message.includes('timeout') ||
        message.includes('network') ||
        message.includes('fetch') ||
        message.includes('503') ||
        message.includes('500') ||
        message.includes('429') ||
        message.includes('busy') ||
        message.includes('unavailable') ||
        message.includes('connection')
    );
};

export const enhanceImageWithGemini = async (
    image: ImageData, 
    style: EnhancementStyle = 'balanced',
    onProgress?: ProgressCallback
): Promise<string> => {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const progressBase = Math.min(10 + (attempt - 1) * 5, 30);
            
            if (onProgress) {
                onProgress({ stage: 'uploading', percent: progressBase });
            }
            
            const response = await fetchWithTimeout(
                '/api/enhance',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image, style })
                },
                TIMEOUT_MS
            );
            
            if (onProgress) {
                onProgress({ stage: 'processing', percent: progressBase + 30 });
            }

            const text = await response.text();
            
            if (!text) {
                throw new Error('RETRY:Empty response');
            }

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                throw new Error('RETRY:Invalid response format');
            }

            if (!response.ok) {
                const errorMsg = data.error || `Status ${response.status}`;
                if (response.status >= 500 || response.status === 429 || data.retryable) {
                    throw new Error(`RETRY:${errorMsg}`);
                }
                throw new Error(errorMsg);
            }

            if (!data.enhancedImage) {
                throw new Error('RETRY:No enhanced image in response');
            }
            
            if (onProgress) {
                onProgress({ stage: 'finalizing', percent: 85 });
            }

            const result = await upscaleImage(data.enhancedImage);
            
            if (onProgress) {
                onProgress({ stage: 'finalizing', percent: 100 });
            }
            
            return result;
            
        } catch (error: any) {
            lastError = error;
            const cleanMessage = (error.message || '').replace('RETRY:', '');
            console.log(`[Enhancement] Attempt ${attempt}/${MAX_RETRIES}: ${cleanMessage}`);
            
            if (attempt < MAX_RETRIES && isRetryableError(error)) {
                const delay = INITIAL_RETRY_DELAY * Math.pow(1.5, attempt - 1);
                console.log(`[Enhancement] Waiting ${Math.round(delay/1000)}s before retry...`);
                
                if (onProgress) {
                    onProgress({ 
                        stage: 'processing', 
                        percent: Math.min(15 + attempt * 10, 50)
                    });
                }
                
                await sleep(delay);
            } else if (!isRetryableError(error)) {
                break;
            }
        }
    }

    const finalMessage = (lastError?.message || 'Enhancement failed').replace('RETRY:', '');
    throw new Error(finalMessage);
};
