import React from 'react';

interface HeaderProps {
  onNavigate?: (section: string) => void;
  currentSection?: string;
  apiStatus?: 'online' | 'offline';
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentSection = 'home', apiStatus = 'offline' }) => {
  const handleNavClick = (section: string) => {
    if (onNavigate) {
      onNavigate(section);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <a href="#" className="logo" onClick={(e: React.MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); handleNavClick('home'); }}>
          🔍 FakeNews Detector
        </a>
        <nav>
          <ul className="nav-links">
            <li>
              <a 
                href="#" 
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); handleNavClick('home'); }}
                className={currentSection === 'home' ? 'active' : ''}
              >
                Home
              </a>
            </li>
            <li>
              <a 
                href="#" 
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); handleNavClick('analyze'); }}
                className={currentSection === 'analyze' ? 'active' : ''}
              >
                Analyze
              </a>
            </li>
            <li>
              <a 
                href="#" 
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); handleNavClick('history'); }}
                className={currentSection === 'history' ? 'active' : ''}
              >
                History
              </a>
            </li>
            <li>
              <a 
                href="#" 
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); handleNavClick('about'); }}
                className={currentSection === 'about' ? 'active' : ''}
              >
                About
              </a>
            </li>
          </ul>
        </nav>
        <span className={`api-status ${apiStatus === 'online' ? 'online' : 'offline'}`}>
          {apiStatus === 'online' ? 'API Online' : 'API Offline'}
        </span>
      </div>
    </header>
  );
};

export default Header;
