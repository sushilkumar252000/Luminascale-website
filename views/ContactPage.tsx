import React, { useState } from 'react';
import { FaqIcon, MailIcon } from '../components/icons';
import { contactService, ContactFormData } from '../services/contactService';

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        if (error) setError(null);
    };

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic Validation
        if (!validateEmail(formData.email)) {
            setError("Please enter a valid email address.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const result = await contactService.submitForm(formData);
            if (result.success) {
                setSubmitted(true);
                // Clear form
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                setError(result.message || "Failed to send message. Please try again.");
            }
        } catch (err) {
            setError("A connection error occurred. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

  return (
    <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 max-w-3xl">
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Contact Us</h1>
                <p className="mt-4 text-base text-gray-600">
                    Have a question or need support? Our team typically responds within 24 hours.
                </p>
            </div>
      
            <div className="max-w-xl mx-auto">
                {submitted ? (
                    <div className="p-10 text-center bg-green-50 border border-green-200 rounded-2xl animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-2xl">check</span>
                        </div>
                        <h2 className="text-xl font-bold text-green-800">Message Sent!</h2>
                        <p className="text-green-700 mt-2">
                            Thanks for reaching out, {formData.name || 'there'}. We've received your inquiry and sent a confirmation to your email.
                        </p>
                        <button 
                            onClick={() => setSubmitted(false)}
                            className="mt-8 text-sm font-bold text-green-700 hover:text-green-900 underline underline-offset-4"
                        >
                            Send another message
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">error</span>
                                {error}
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    required 
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full border-gray-200 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition-all px-4 py-2.5" 
                                    placeholder="Jane Doe" 
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    required 
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full border-gray-200 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition-all px-4 py-2.5" 
                                    placeholder="jane@example.com" 
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="subject" className="block text-sm font-bold text-gray-700 mb-1.5">Subject</label>
                            <input 
                                type="text" 
                                id="subject" 
                                required 
                                value={formData.subject}
                                onChange={handleInputChange}
                                className="w-full border-gray-200 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition-all px-4 py-2.5" 
                                placeholder="How can we help?" 
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-1.5">Your Message</label>
                            <textarea 
                                id="message" 
                                required 
                                rows={5} 
                                value={formData.message}
                                onChange={handleInputChange}
                                className="w-full border-gray-200 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition-all px-4 py-2.5" 
                                placeholder="Tell us more about your request..."
                            ></textarea>
                        </div>

                        <div className="flex flex-col items-center">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className={`w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 px-8 rounded-lg transition-all shadow-lg shadow-primary/20
                                    ${isSubmitting ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 hover:-translate-y-0.5'}
                                `}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Sending...
                                    </>
                                ) : (
                                    'Send Message'
                                )}
                            </button>
                            <p className="text-xs text-gray-400 mt-4 text-center leading-relaxed">
                                By clicking send, you agree to our <a href="#" className="underline">Terms</a> and acknowledge that your data will be processed according to our <a href="#" className="underline">Privacy Policy</a>.
                            </p>
                        </div>
                    </form>
                )}
            </div>

            <div className="text-center mt-20 pt-10 border-t border-gray-100">
                <h3 className="text-base font-bold text-gray-900 mb-8">Other Ways to Get Help</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    <a href="#" className="group flex items-center gap-4 p-5 bg-gray-50 border border-gray-100 rounded-xl hover:bg-white hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all text-left">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-primary border border-gray-100 group-hover:scale-110 transition-transform">
                            <FaqIcon />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">Read our FAQ</p>
                            <p className="text-sm text-gray-500">Instant answers to common questions.</p>
                        </div>
                    </a>
                    <a href="mailto:support@luminascale.com" className="group flex items-center gap-4 p-5 bg-gray-50 border border-gray-100 rounded-xl hover:bg-white hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all text-left">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-primary border border-gray-100 group-hover:scale-110 transition-transform">
                            <MailIcon />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">Email Directly</p>
                            <p className="text-sm text-gray-500">support@luminascale.com</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </main>
  );
};

export default ContactPage;