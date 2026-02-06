import { ImageData } from '../types';

const MAX_MOBILE_PIXELS = 1200 * 1200;
const MAX_DESKTOP_PIXELS = 2000 * 2000;
const MOBILE_QUALITY = 0.7;
const DESKTOP_QUALITY = 0.85;

const isMobileDevice = (): boolean => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth < 768;
};

const compressImage = (
    img: HTMLImageElement, 
    mimeType: string,
    maxPixels: number,
    quality: number
): Promise<{ base64: string; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
            let targetWidth = img.width;
            let targetHeight = img.height;
            const currentPixels = img.width * img.height;
            
            if (currentPixels > maxPixels) {
                const scale = Math.sqrt(maxPixels / currentPixels);
                targetWidth = Math.floor(img.width * scale);
                targetHeight = Math.floor(img.height * scale);
            }
            
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error("File Read Error: Failed to create image context."));
                return;
            }
            
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            
            const outputMime = 'image/jpeg';
            const dataUrl = canvas.toDataURL(outputMime, quality);
            const base64 = dataUrl.split(',')[1];
            
            if (!base64) {
                reject(new Error("File Read Error: Failed to compress image."));
                return;
            }
            
            console.log(`[FileUtils] Compressed: ${img.width}x${img.height} -> ${targetWidth}x${targetHeight}, quality: ${quality}`);
            
            resolve({ 
                base64, 
                width: targetWidth, 
                height: targetHeight 
            });
        } catch (err) {
            reject(new Error("File Read Error: Image compression failed."));
        }
    });
};

export const fileToImageData = (file: File): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
        if (file.size === 0) {
            reject(new Error("File Read Error: The selected file is empty (0 bytes). Please select a valid image file."));
            return;
        }
        
        if (file.size > 15 * 1024 * 1024) {
            reject(new Error("File Read Error: File is too large. Maximum size is 15MB."));
            return;
        }

        const isMobile = isMobileDevice();
        const maxPixels = isMobile ? MAX_MOBILE_PIXELS : MAX_DESKTOP_PIXELS;
        const quality = isMobile ? MOBILE_QUALITY : DESKTOP_QUALITY;
        
        console.log(`[FileUtils] Processing file: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB, mobile: ${isMobile}`);

        const reader = new FileReader();
        
        reader.onload = () => {
            const result = reader.result as string;
            
            if (typeof result !== 'string' || !result.includes(',')) {
                reject(new Error("File Read Error: Unexpected file format structure."));
                return;
            }
            
            const img = new Image();
            
            img.onload = async () => {
                try {
                    const compressed = await compressImage(img, file.type, maxPixels, quality);
                    resolve({
                        base64: compressed.base64,
                        mimeType: 'image/jpeg',
                        width: compressed.width,
                        height: compressed.height
                    });
                } catch (err: any) {
                    reject(err);
                }
            };
            
            img.onerror = () => {
                reject(new Error("File Read Error: Failed to load image. The file may be corrupted."));
            };
            
            img.src = result;
        };
        
        reader.onerror = () => {
            reject(new Error("File Read Error: Could not read the file. It might be corrupted or locked."));
        };
        
        reader.onabort = () => {
            reject(new Error("File Read Error: File reading was aborted."));
        };
        
        reader.readAsDataURL(file);
    });
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    
    if (!validTypes.includes(file.type.toLowerCase())) {
        return { 
            valid: false, 
            error: `Unsupported format: ${file.type || 'unknown'}. Please use JPG, PNG, or WEBP.` 
        };
    }
    
    if (file.size > 15 * 1024 * 1024) {
        return { 
            valid: false, 
            error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum is 15MB.` 
        };
    }
    
    if (file.size === 0) {
        return { 
            valid: false, 
            error: 'File is empty.' 
        };
    }
    
    return { valid: true };
};
