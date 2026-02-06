import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <main className="flex-1 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 max-w-4xl">
        <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-lg prose-indigo max-w-none text-gray-600">
            <p className="lead text-lg text-gray-700 mb-8">
                At LuminaScale, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our image enhancement application.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h3>
            <p className="mb-4">
                <strong>Image Data:</strong> When you use LuminaScale, you upload images to our servers for processing. These images are temporarily stored to perform the enhancement. We do not use your images for training our AI models without your explicit consent, nor do we claim ownership of your content.
            </p>
            <p className="mb-4">
                <strong>Usage Data:</strong> We may collect anonymous information about how you access and use the service, such as your browser type, device type, and the pages you visit. This helps us improve the application's performance.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>To provide and maintain the image enhancement service.</li>
                <li>To detect, prevent, and address technical issues.</li>
                <li>To monitor the usage of the service to improve user experience.</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Data Retention</h3>
            <p className="mb-4">
                Uploaded images are processed in real-time. We employ a strict data retention policy where processed images and original uploads are automatically deleted from our servers shortly after the enhancement process is complete or the session ends. We do not store your personal photos permanently.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Third-Party Services</h3>
            <p className="mb-4">
                We use Google Gemini API for image processing. By using this application, you acknowledge that your data may be processed by Google's infrastructure in accordance with their <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</a>.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Contact Us</h3>
            <p className="mb-4">
                If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@luminascale.com" className="text-primary hover:underline">privacy@luminascale.com</a>.
            </p>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicyPage;