import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './views/HomePage';
import EnhancePage from './views/EnhancePage';
import ContactPage from './views/ContactPage';
import PrivacyPolicyPage from './views/PrivacyPolicyPage';
import TermsPage from './views/TermsPage';

export type Page = 'home' | 'enhance' | 'contact' | 'privacy' | 'terms';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setPage={setCurrentPage} />;
      case 'enhance':
        return <EnhancePage />;
      case 'contact':
        return <ContactPage />;
      case 'privacy':
        return <PrivacyPolicyPage />;
      case 'terms':
        return <TermsPage />;
      default:
        return <HomePage setPage={setCurrentPage} />;
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-white">
      <Header currentPage={currentPage} setPage={setCurrentPage} />
      {renderPage()}
      <Footer setPage={setCurrentPage} />
    </div>
  );
};

export default App;