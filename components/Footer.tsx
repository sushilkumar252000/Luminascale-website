import React from 'react';
import { Page } from '../App';

interface FooterProps {
  setPage: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ setPage }) => {
  return (
    <footer className="w-full bg-white border-t border-gray-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPage('home')}>
             <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M26.6667 13.3333L16 2.66666L5.33333 13.3333L6.66667 14.6667L16 5.33333L25.3333 14.6667L26.6667 13.3333Z" fill="url(#paint0_linear_1_2)"/>
                <path d="M16 29.3333L5.33333 18.6667L6.66667 17.3333L16 26.6667L25.3333 17.3333L26.6667 18.6667L16 29.3333Z" fill="url(#paint1_linear_1_2)"/>
                <defs>
                <linearGradient id="paint0_linear_1_2" x1="16" y1="2.66666" x2="16" y2="14.6667" gradientUnits="userSpaceOnUse">
                <stop stop-color="#4A69FF"/>
                <stop offset="1" stop-color="#A855F7"/>
                </linearGradient>
                <linearGradient id="paint1_linear_1_2" x1="16" y1="17.3333" x2="16" y2="29.3333" gradientUnits="userSpaceOnUse">
                <stop stop-color="#4A69FF"/>
                <stop offset="1" stop-color="#A855F7"/>
                </linearGradient>
                </defs>
            </svg>
            <h1 className="text-gray-900 text-lg font-bold">LuminaScale</h1>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a 
                href="#" 
                className="hover:text-primary transition-colors" 
                onClick={(e) => { e.preventDefault(); setPage('privacy'); }}
            >
                Privacy Policy
            </a>
            <a 
                href="#" 
                className="hover:text-primary transition-colors" 
                onClick={(e) => { e.preventDefault(); setPage('terms'); }}
            >
                Terms of Service
            </a>
            <a 
                href="#" 
                className="hover:text-primary transition-colors" 
                onClick={(e) => { e.preventDefault(); setPage('contact'); }}
            >
                Contact
            </a>
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} LuminaScale. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;