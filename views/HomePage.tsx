import React from "react";
import { Page } from "../App";
import ImageSlider from "../components/ImageSlider";
import { AiIcon, ResolutionIcon, SpeedIcon } from "../components/icons";

interface HomePageProps {
    setPage: (page: Page) => void;
}

const FeatureCard = ({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) => (
    <div className="group relative p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
        <div className="relative z-10">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-gray-50 border border-gray-100 text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-500 leading-relaxed">{description}</p>
        </div>
    </div>
);

const StepCard = ({
    number,
    title,
    description,
}: {
    number: string;
    title: string;
    description: string;
}) => (
    <div className="flex flex-col items-center text-center max-w-sm relative z-10 group">
        <div className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center text-lg font-bold mb-6 shadow-lg shadow-gray-900/20 group-hover:scale-110 transition-transform duration-300">
            {number}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-500 text-base leading-relaxed">{description}</p>
    </div>
);

const TestimonialCard = ({
    name,
    role,
    quote,
}: {
    name: string;
    role: string;
    quote: string;
}) => (
    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-lg transition-all duration-300 h-full">
        <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <span
                    key={i}
                    className="material-symbols-outlined text-yellow-400 text-[20px] select-none"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                >
                    star
                </span>
            ))}
        </div>
        <p className="text-gray-700 leading-relaxed mb-6 font-medium italic">
            "{quote}"
        </p>
        <div className="mt-auto">
            <p className="font-bold text-gray-900">{name}</p>
            <p className="text-sm text-gray-500">{role}</p>
        </div>
    </div>
);

const HomePage: React.FC<HomePageProps> = ({ setPage }) => {
    return (
        <main className="flex-1 bg-white selection:bg-primary/20">
            {/* Hero Section */}
            <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-purple-50/20 to-transparent pointer-events-none" />

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900/5 text-gray-600 text-sm font-medium mb-8 border border-gray-200/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Powered by LuminaScale Ai
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                            Upscale Your Image for Free{" "}
                            <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-600 to-pink-600">
                                LuminaScale Ai
                            </span>
                        </h1>

                        <p className="text-lg text-gray-500 mb-10 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                            LuminaScale uses Advance LuminaScale Ai technology
                            to upscale, denoise, and restore photos up to 4x
                            resolution. Professional grade, completely free.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
                            <button
                                onClick={() => setPage("enhance")}
                                className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-gray-900 rounded-full hover:bg-gray-800 hover:shadow-2xl hover:shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Start Enhancing Free
                                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                                        arrow_forward
                                    </span>
                                </span>
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-primary to-purple-600 transition-transform duration-300 ease-out" />
                            </button>
                            <button
                                onClick={() => {
                                    const el =
                                        document.getElementById("how-it-works");
                                    el?.scrollIntoView({ behavior: "smooth" });
                                }}
                                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:text-gray-900 transition-colors"
                            >
                                See How It Works
                            </button>
                        </div>
                    </div>

                    {/* Hero Slider */}
                    <div className="relative mx-auto max-w-5xl animate-in fade-in zoom-in duration-1000 delay-300">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-20" />
                        <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-2xl bg-white">
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">
                                    touch_app
                                </span>
                                Interactive Preview
                            </div>
                            <ImageSlider
                                originalImage="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=10&blur=4"
                                enhancedImage="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=2000&q=100"
                                blurOriginal={true}
                            />
                        </div>

                        {/* Decorative Elements */}
                        <div className="hidden md:block absolute -z-10 top-1/2 -right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
                        <div
                            className="hidden md:block absolute -z-10 top-1/2 -left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
                            style={{ animationDelay: "1s" }}
                        />
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="border-y border-gray-100 bg-gray-50/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { label: "Images Processed", value: "1M+" },
                            { label: "Active Users", value: "50k+" },
                            { label: "Avg. Rating", value: "4.9/5" },
                            { label: "Cost", value: "$0" },
                        ].map((stat, i) => (
                            <div key={i}>
                                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section
                id="how-it-works"
                className="py-24 relative overflow-hidden bg-white"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                            Enhance in 3 Simple Steps
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto text-base">
                            No complex software or technical skills required.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row justify-center items-start gap-8 md:gap-12 relative max-w-5xl mx-auto">
                        {/* Connector Line */}
                        <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-gray-200 via-primary/30 to-gray-200" />

                        <StepCard
                            number="1"
                            title="Upload"
                            description="Drag & drop your low-resolution image. We support JPG, PNG, and WEBP formats."
                        />
                        <StepCard
                            number="2"
                            title="Enhance"
                            description="Select 'Balanced' (Real-ESRGAN x4plus) or 'Creative' profile and let AI reconstruct details."
                        />
                        <StepCard
                            number="3"
                            title="Download"
                            description="Preview the results and download your crystal-clear 8K image instantly."
                        />
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-gray-50/50 border-t border-gray-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                            Why LuminaScale?
                        </h2>
                        <p className="max-w-xl mx-auto text-gray-500 text-base">
                            Industry-leading LuminaScale Ai technology packaged
                            in a simple tool.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <FeatureCard
                            icon={<AiIcon className="w-8 h-8" />}
                            title="LuminaScale Ai Model"
                            description="We utilize the Real-ESRGAN x4plus architecture, known for superior restoration of textures compared to standard interpolation."
                        />
                        <FeatureCard
                            icon={<ResolutionIcon className="w-8 h-8" />}
                            title="True 8K Upscaling"
                            description="Our pipeline generates missing high-frequency details to create genuine 7680x4320 equivalents."
                        />
                        <FeatureCard
                            icon={<SpeedIcon className="w-8 h-8" />}
                            title="Lightning Fast"
                            description="Optimized cloud inference delivers professional results in seconds. No queues, no waiting."
                        />
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                            Community Love
                        </h2>
                        <p className="max-w-xl mx-auto text-gray-500 text-base">
                            Join thousands of happy creators, photographers, and
                            designers.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <TestimonialCard
                            name="Sarah Jenkins"
                            role="Freelance Photographer"
                            quote="I restored my grandmother's only photo with this. The detail on the lace veil was incredible. I actually cried."
                        />
                        <TestimonialCard
                            name="David Chen"
                            role="UI/UX Designer"
                            quote="Perfect for upscaling assets for retina displays. It saves me so much time trying to vectorise raster images. A must-have tool."
                        />
                        <TestimonialCard
                            name="Elena Rodriguez"
                            role="Content Creator"
                            quote="My thumbnails look so much sharper. The 'Creative' mode actually adds a nice pop that increases my CTR on YouTube."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-900">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/30 to-transparent" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/30 to-transparent" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h2 className="text-2xl sm:text-4xl font-bold text-white mb-6">
                        Ready to see the difference?
                    </h2>
                    <p className="text-gray-400 text-base mb-10 max-w-2xl mx-auto leading-relaxed">
                        No credit card required. No sign-up needed. Just pure 8K
                        magic.
                        <br />
                        Try it on your own photos right now.
                    </p>
                    <button
                        onClick={() => setPage("enhance")}
                        className="inline-flex items-center justify-center px-10 py-5 text-base font-bold text-gray-900 bg-white rounded-full hover:bg-gray-100 transition-all hover:scale-105 shadow-xl shadow-white/10"
                    >
                        Enhance Your First Image
                    </button>
                </div>
            </section>
        </main>
    );
};

export default HomePage;
