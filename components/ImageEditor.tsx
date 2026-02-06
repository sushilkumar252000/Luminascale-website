import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
    SaveIcon, 
    RotateLeftIcon, 
    CropIcon, 
    AdjustIcon 
} from './icons';

interface ImageEditorProps {
  imageSrc: string;
  onSave: (newImageSrc: string) => void;
  onCancel: () => void;
}

type EditorTab = 'transform' | 'adjust';
type AspectRatio = 'original' | 'square' | '16:9' | '4:3' | '3:2';

const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('adjust');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Transform State
  const [rotation, setRotation] = useState(0); 
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('original');
  const [flipH, setFlipH] = useState(false);

  // Adjustment State (Fast - CSS filters)
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [warmth, setWarmth] = useState(0); 
  const [exposure, setExposure] = useState(100);
  
  // Adjustment State (Slow - CPU pixel manipulation)
  const [sharpness, setSharpness] = useState(0); 
  const [clarity, setClarity] = useState(0); 
  const [highlights, setHighlights] = useState(0); 

  // Load image
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.crossOrigin = "anonymous";
    img.onload = () => setImageObj(img);
  }, [imageSrc]);

  /**
   * Performance Optimized Drawing Function
   * Separates CSS Filter applications from Pixel-level CPU calculations
   */
  const drawImage = useCallback((fullProcess = true) => {
    if (!imageObj || !canvasRef.current) return;

    const canvas = canvasRef.current;
    // CRITICAL: Enable high-quality read for better pixel manipulation
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // CRITICAL: Enable high-quality smoothing for 4K/8K rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Calculate Dimensions
    const isRotated = rotation % 180 !== 0;
    const srcW = imageObj.naturalWidth;
    const srcH = imageObj.naturalHeight;
    const rotW = isRotated ? srcH : srcW;
    const rotH = isRotated ? srcW : srcH;

    let targetW = rotW;
    let targetH = rotH;

    if (aspectRatio !== 'original') {
        const ratios: Record<AspectRatio, number> = {
            'original': 1,
            'square': 1,
            '16:9': 16/9,
            '4:3': 4/3,
            '3:2': 3/2
        };
        const ratio = ratios[aspectRatio];
        if (rotW / rotH > ratio) {
            targetH = rotH;
            targetW = rotH * ratio;
        } else {
            targetW = rotW;
            targetH = rotW / ratio;
        }
    }

    // Only update canvas size if needed to avoid flickering
    if (canvas.width !== Math.floor(targetW) || canvas.height !== Math.floor(targetH)) {
        canvas.width = targetW;
        canvas.height = targetH;
    }

    // 2. Prepare CSS Filters (GPU Accelerated)
    const filterString = `
        brightness(${brightness * (exposure/100)}%) 
        contrast(${contrast}%) 
        saturate(${saturation}%) 
        sepia(${warmth > 0 ? warmth * 0.5 : 0}%) 
        hue-rotate(${warmth > 0 ? -warmth * 0.1 : 0}deg)
    `;
    ctx.filter = filterString;

    // 3. Render Base Transforms
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    if (flipH) ctx.scale(-1, 1);
    ctx.drawImage(imageObj, -srcW / 2, -srcH / 2);
    ctx.restore();

    // 4. Pixel-Level CPU Effects (Slow - Sharpen, Clarity, Highlights)
    const hasSlowFilters = sharpness > 0 || clarity !== 0 || highlights !== 0;
    
    if (fullProcess && hasSlowFilters) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const width = canvas.width;
        const height = canvas.height;
        
        let originalData: Uint8ClampedArray | null = null;
        if (sharpness > 0) {
            originalData = new Uint8ClampedArray(data);
        }

        const sharpenAmount = sharpness / 100;
        const clarityAmount = clarity / 100;
        const highlightAmount = highlights / 100;
        const rowOffset = width * 4;

        for (let y = 0; y < height; y++) {
            const yOffset = y * width * 4;
            const isYEdge = y === 0 || y === height - 1;

            for (let x = 0; x < width; x++) {
                const i = yOffset + (x * 4);
                
                let r = data[i];
                let g = data[i + 1];
                let b = data[i + 2];

                if (sharpness > 0 && originalData && !isYEdge && x > 0 && x < width - 1) {
                     const rEdge = 4 * originalData[i] - originalData[i - rowOffset] - originalData[i + rowOffset] - originalData[i - 4] - originalData[i + 4];
                     const gEdge = 4 * originalData[i+1] - originalData[i+1 - rowOffset] - originalData[i+1 + rowOffset] - originalData[i-3] - originalData[i+5];
                     const bEdge = 4 * originalData[i+2] - originalData[i+2 - rowOffset] - originalData[i+2 + rowOffset] - originalData[i-2] - originalData[i+6];
                     
                     r += rEdge * sharpenAmount;
                     g += gEdge * sharpenAmount;
                     b += bEdge * sharpenAmount;
                }

                const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                
                if (highlightAmount !== 0 && lum > 128) {
                    const adjust = highlightAmount * 50 * ((lum - 128) / 127);
                    r += adjust;
                    g += adjust;
                    b += adjust;
                }

                if (clarityAmount !== 0) {
                     r = r + (r - 128) * clarityAmount * 0.5;
                     g = g + (g - 128) * clarityAmount * 0.5;
                     b = b + (b - 128) * clarityAmount * 0.5;
                }

                data[i] = r < 0 ? 0 : (r > 255 ? 255 : r);
                data[i + 1] = g < 0 ? 0 : (g > 255 ? 255 : g);
                data[i + 2] = b < 0 ? 0 : (b > 255 ? 255 : b);
            }
        }
        
        ctx.putImageData(imgData, 0, 0);
    }
  }, [imageObj, rotation, aspectRatio, flipH, brightness, contrast, saturation, warmth, exposure, sharpness, clarity, highlights]);

  useEffect(() => {
    const hasSlowFilters = sharpness > 0 || clarity !== 0 || highlights !== 0;
    
    if (hasSlowFilters) {
        setIsProcessing(true);
        const timer = setTimeout(() => {
            drawImage(true);
            setIsProcessing(false);
        }, 300);
        return () => clearTimeout(timer);
    } else {
        drawImage(true);
        setIsProcessing(false);
    }
  }, [drawImage, sharpness, clarity, highlights, brightness, contrast, saturation, warmth, exposure, rotation, flipH, aspectRatio]);

  const handleSave = () => {
    if (!canvasRef.current) return;
    // CRITICAL: Maximize output quality (1.0) and use PNG for lossless 8K
    const dataUrl = canvasRef.current.toDataURL('image/png', 1.0);
    onSave(dataUrl);
  };

  const resetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setWarmth(0);
    setExposure(100);
    setSharpness(0);
    setClarity(0);
    setHighlights(0);
  };

  return (
    <div className="w-full flex flex-col bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in duration-300">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-700">Edit Image</h3>
            {isProcessing && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded-full">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></div>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Processing 8K</span>
                </div>
            )}
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={onCancel}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={handleSave}
                className="flex items-center gap-1 px-4 py-1.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors"
            >
                <SaveIcon className="w-4 h-4" />
                Done
            </button>
        </div>
      </div>

      <div className="relative flex-1 bg-gray-900/5 min-h-[400px] flex items-center justify-center p-4 overflow-hidden">
        <div className="relative shadow-2xl rounded-lg overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-200">
             <canvas 
                ref={canvasRef} 
                className="max-w-full max-h-[60vh] object-contain block"
             />
        </div>
      </div>

      <div className="bg-white border-t border-gray-200">
        <div className="flex border-b border-gray-100">
            <button 
                onClick={() => setActiveTab('adjust')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors border-b-2
                    ${activeTab === 'adjust' ? 'text-primary border-primary bg-primary/5' : 'text-gray-500 border-transparent hover:bg-gray-50'}
                `}
            >
                <AdjustIcon className="w-4 h-4" />
                Adjust
            </button>
            <button 
                onClick={() => setActiveTab('transform')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors border-b-2
                    ${activeTab === 'transform' ? 'text-primary border-primary bg-primary/5' : 'text-gray-500 border-transparent hover:bg-gray-50'}
                `}
            >
                <CropIcon className="w-4 h-4" />
                Crop & Rotate
            </button>
        </div>

        <div className="p-6 min-h-[180px]">
            {activeTab === 'adjust' && (
                <div className="space-y-6">
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Color & Light</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                            <RangeControl label="Brightness" value={brightness} min={50} max={150} onChange={setBrightness} />
                            <RangeControl label="Contrast" value={contrast} min={50} max={150} onChange={setContrast} />
                            <RangeControl label="Saturation" value={saturation} min={0} max={200} onChange={setSaturation} />
                            <RangeControl label="Exposure" value={exposure} min={50} max={150} onChange={setExposure} />
                            <RangeControl label="Warmth" value={warmth} min={0} max={100} onChange={setWarmth} />
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Details (CPU Intensive)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                             <RangeControl label="Sharpen" value={sharpness} min={0} max={100} onChange={setSharpness} isSlow />
                             <RangeControl label="Clarity" value={clarity} min={0} max={100} onChange={setClarity} isSlow />
                             <RangeControl label="Highlights" value={highlights} min={-100} max={100} onChange={setHighlights} isSlow />
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-2 border-t border-gray-100">
                        <button onClick={resetAdjustments} className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors">
                            Reset All Adjustments
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'transform' && (
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rotation</span>
                        <div className="flex gap-4">
                             <button 
                                onClick={() => setRotation((r) => (r + 90) % 360)}
                                className="flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-all text-gray-600 hover:text-primary"
                             >
                                <span className="material-symbols-outlined text-[24px]">rotate_right</span>
                                <span className="text-xs font-medium">Rotate</span>
                             </button>
                             <button 
                                onClick={() => setFlipH(!flipH)}
                                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border transition-all
                                    ${flipH ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 hover:border-primary/50 hover:bg-primary/5 text-gray-600'}
                                `}
                             >
                                <span className="material-symbols-outlined text-[24px]">flip</span>
                                <span className="text-xs font-medium">Flip Horizontal</span>
                             </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Crop Ratio</span>
                        <div className="grid grid-cols-5 gap-2">
                            {(['original', 'square', '16:9', '4:3', '3:2'] as AspectRatio[]).map(ratio => (
                                <button
                                    key={ratio}
                                    onClick={() => setAspectRatio(ratio)}
                                    className={`py-2 px-1 rounded-md text-xs font-medium transition-colors border
                                        ${aspectRatio === ratio 
                                            ? 'bg-gray-900 text-white border-gray-900' 
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    {ratio === 'original' ? 'Orig' : ratio}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

const RangeControl = ({ label, value, min, max, onChange, isSlow = false }: { 
    label: string, value: number, min: number, max: number, onChange: (v: number) => void, isSlow?: boolean
}) => (
    <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1">
                {label}
                {isSlow && <span className="material-symbols-outlined text-[14px] text-orange-400" title="High CPU Usage">bolt</span>}
            </span>
            <span>{value}{label === 'Highlights' && value > 0 ? '+' : ''}{label !== 'Sharpen' && label !== 'Clarity' && label !== 'Highlights' ? '%' : ''}</span>
        </div>
        <input 
            type="range" 
            min={min} 
            max={max} 
            value={value} 
            onChange={(e) => onChange(Number(e.target.value))}
            className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20
                ${isSlow ? 'bg-orange-100 accent-orange-400' : 'bg-gray-200 accent-primary'}
            `}
        />
    </div>
);

export default ImageEditor;