import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ImageData, EnhancementStyle } from '../types';
import { fileToImageData, validateImageFile } from '../utils/fileUtils';
import { enhanceImageWithGemini } from '../services/geminiService';
import ImageSlider from './ImageSlider';
import ImageEditor from './ImageEditor';
import { DownloadIcon, EditIcon } from './icons';

interface ProgressState {
  stage: string;
  percent: number;
}

const STAGE_LABELS: Record<string, string> = {
  'reading': 'Preparing your image...',
  'uploading': 'Connecting to AI...',
  'processing': 'AI enhancement in progress...',
  'downloading': 'Downloading result...',
  'finalizing': 'Finalizing enhanced image...'
};

const ImageEnhancer: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<EnhancementStyle>('balanced');
  const [isEditing, setIsEditing] = useState(false);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<ProgressState>({ stage: 'reading', percent: 0 });
  const [processingMessage, setProcessingMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      abortRef.current = true;
    };
  }, []);

  const handleFileChange = useCallback(async (file: File | null) => {
    if (!file) return;
    
    abortRef.current = false;
    setLastFile(file);
    setEnhancedImage(null);
    setIsEditing(false);
    setProgress({ stage: 'reading', percent: 5 });
    setProcessingMessage('');

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setProcessingMessage(validation.error || 'Please upload a valid image file.');
      return;
    }

    setIsLoading(true);

    try {
      setOriginalImage(URL.createObjectURL(file));
      setProgress({ stage: 'reading', percent: 15 });
      
      const imageData: ImageData = await fileToImageData(file);
      
      if (abortRef.current) return;
      
      setProgress({ stage: 'uploading', percent: 25 });
      
      const enhancedImageResult = await enhanceImageWithGemini(
        imageData, 
        selectedStyle,
        (p) => {
          if (!abortRef.current) {
            setProgress({ stage: p.stage, percent: 25 + (p.percent * 0.7) });
          }
        }
      );
      
      if (abortRef.current) return;
      
      setProgress({ stage: 'finalizing', percent: 100 });
      setEnhancedImage(enhancedImageResult);
      
    } catch (err: any) {
      if (abortRef.current) return;
      
      const message = err.message || 'Enhancement failed';
      if (message.toLowerCase().includes('busy') || message.toLowerCase().includes('unavailable')) {
        setProcessingMessage('Our AI servers are busy. Please try again in a moment.');
      } else if (message.toLowerCase().includes('timeout')) {
        setProcessingMessage('The request took too long. Please try with a smaller image.');
      } else if (message.toLowerCase().includes('file') || message.toLowerCase().includes('format')) {
        setProcessingMessage('There was an issue with the image file. Please try a different image.');
      } else {
        setProcessingMessage('Enhancement could not be completed. Please try again.');
      }
    } finally {
      if (!abortRef.current) {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  }, [selectedStyle]);

  const handleRetry = () => {
    if (lastFile) {
      setProcessingMessage('');
      handleFileChange(lastFile);
    }
  };

  const handleSaveEdit = (newImageSrc: string) => {
    setEnhancedImage(newImageSrc);
    setIsEditing(false);
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const resetState = () => {
    abortRef.current = true;
    setOriginalImage(null);
    setEnhancedImage(null);
    setLastFile(null);
    setIsLoading(false);
    setIsEditing(false);
    setProgress({ stage: 'reading', percent: 0 });
    setProcessingMessage('');
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-12 gap-8 text-center bg-white rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary animate-pulse text-2xl">auto_fix_high</span>
          </div>
        </div>
        <div className="max-w-md w-full">
          <h2 className="text-xl font-bold text-gray-900">Enhancing Your Image</h2>
          <p className="text-gray-500 mt-2 text-sm">
            {STAGE_LABELS[progress.stage] || 'Processing...'}
          </p>
          
          <div className="mt-6 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">{Math.round(progress.percent)}% complete</p>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></span>
            Denoising
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
            Upscaling
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
            Refining
          </div>
          
          <p className="mt-6 text-xs text-gray-400">This may take up to 2 minutes for high-quality results</p>
          
          <button
            onClick={resetState}
            className="mt-4 text-sm text-gray-400 hover:text-gray-600 underline"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
  
  if (originalImage && enhancedImage) {
    if (isEditing) {
      return (
        <div className="w-full max-w-5xl mx-auto py-8">
          <ImageEditor 
            imageSrc={enhancedImage} 
            onSave={handleSaveEdit} 
            onCancel={() => setIsEditing(false)} 
          />
        </div>
      )
    }

    return (
      <div className="w-full flex flex-col items-center gap-8 py-8 animate-in fade-in duration-500">
        <div className="w-full flex justify-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-bold border border-green-100 shadow-sm">
            <span className="material-symbols-outlined text-sm mr-2">verified</span>
            AI Enhancement Complete
          </div>
        </div>
        
        <ImageSlider originalImage={originalImage} enhancedImage={enhancedImage} />
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-2xl pt-4">
          <div className="flex flex-1 gap-2 w-full">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg h-14 px-6 bg-white border border-gray-200 text-gray-700 text-base font-bold hover:bg-gray-50 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
            >
              <EditIcon />
              Fine-tune
            </button>
            <a
              href={enhancedImage}
              download={`luminascale-enhanced-${selectedStyle}-${Date.now()}.jpg`}
              className="flex-[2] flex items-center justify-center gap-2 rounded-lg h-14 px-6 bg-primary text-white text-base font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              <DownloadIcon />
              <span>Download Enhanced</span>
            </a>
          </div>
          
          <button
            onClick={resetState}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg h-14 px-6 text-gray-500 hover:text-gray-900 transition-colors text-sm font-bold"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
      <div className="w-full bg-gray-50 p-1.5 rounded-xl border border-gray-200 flex flex-col sm:flex-row shadow-inner">
        {(['balanced', 'creative', 'restoration'] as EnhancementStyle[]).map((style) => (
          <button
            key={style}
            onClick={() => {
              setSelectedStyle(style);
              setProcessingMessage('');
            }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2
              ${selectedStyle === style 
                ? 'bg-white text-primary shadow-md ring-1 ring-black/5' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {style === 'balanced' ? 'tune' : style === 'creative' ? 'palette' : 'history'}
            </span>
            {style.charAt(0).toUpperCase() + style.slice(1)}
          </button>
        ))}
      </div>

      <div
        className={`w-full flex flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed p-10 sm:p-20 cursor-pointer transition-all duration-300 group bg-white
          ${isDragging 
            ? 'border-primary bg-primary/5 scale-[1.02] shadow-2xl' 
            : 'border-gray-300 hover:border-primary/60 hover:bg-gray-50/50'
          }
        `}
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDragOver={onDragOver} onDrop={onDrop}
      >
        <div className={`p-6 rounded-2xl transition-all duration-300 ${isDragging ? 'bg-primary/20 scale-110' : 'bg-gray-100 group-hover:bg-primary/10 group-hover:scale-105'}`}>
          <span className={`material-symbols-outlined !text-5xl ${isDragging ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`}>
            cloud_upload
          </span>
        </div>
        
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-gray-900 text-xl font-bold tracking-tight">
            {isDragging ? 'Release to Enhance' : 'Upload Your Photo'}
          </p>
          <p className="text-gray-500 text-base">Drag and drop or click to browse files</p>
          <p className="text-gray-400 text-xs">JPG, PNG, WEBP up to 15MB</p>
        </div>
        
        <div className={`mt-4 flex items-center justify-center rounded-xl h-12 px-10 text-base font-bold transition-all
          ${isDragging 
            ? 'bg-primary text-white shadow-xl' 
            : 'bg-white border border-gray-200 text-gray-700 shadow-sm group-hover:border-primary/50 group-hover:text-primary'
          }
        `}>
          Select Image
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
        />
      </div>

      {processingMessage && (
        <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4 animate-in fade-in duration-300">
          <div className="p-2 bg-amber-100 rounded-lg shrink-0">
            <span className="material-symbols-outlined text-amber-600 text-xl">info</span>
          </div>
          <div className="flex-1">
            <p className="text-amber-800 text-sm">{processingMessage}</p>
          </div>
          <button 
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-sm">replay</span>
            Try Again
          </button>
        </div>
      )}

      <div className="w-full text-center mt-4">
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
          By uploading, you agree to our terms. We do not store your images; they are processed in real-time and deleted immediately.
        </p>
      </div>
    </div>
  );
};

export default ImageEnhancer;
