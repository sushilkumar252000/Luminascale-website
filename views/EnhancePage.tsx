import React from 'react';
import ImageEnhancer from '../components/ImageEnhancer';

const EnhancePage: React.FC = () => {
  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Upload & Enhance</h1>
            <p className="mt-4 text-base text-gray-600 max-w-2xl mx-auto">
                Select an image from your device or drag it into the box below. Our AI will automatically upscale it to 8K resolution.
            </p>
        </div>
        <ImageEnhancer />
      </div>
    </main>
  );
};

export default EnhancePage;