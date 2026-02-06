import React, { useState } from 'react';
import { Page } from '../App';
import { MenuIcon, CloseIcon } from './icons';

interface HeaderProps {
  currentPage: Page;
  setPage: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fix: Explicitly type navLinks to ensure link.page is of type Page, not string.
  const navLinks: { page: Page; label: string }[] = [
    { page: 'home', label: 'Home' },
    { page: 'enhance', label: 'Enhance Image' },
    { page: 'contact', label: 'Contact Us' },
  ];

  const NavLinkItems = ({ isMobile = false }) => (
    <>
      {navLinks.map((link) => (
        <a
          key={link.page}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage(link.page);
            if (isMobile) setIsMenuOpen(false);
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentPage === link.page
              ? 'text-primary'
              : 'text-gray-600 hover:text-primary hover:bg-primary/5'
          }`}
        >
          {link.label}
        </a>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm border-b border-gray-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
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
          
          <div className="hidden md:flex items-center space-x-4">
            <NavLinkItems />
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-primary hover:bg-primary/5 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <CloseIcon className="block h-6 w-6" /> : <MenuIcon className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-center">
            <NavLinkItems isMobile />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;