
import React, { useState, useEffect } from 'react';
import { LayoutGrid } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/85 backdrop-blur-md py-4 border-b border-black/5' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-default">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors shadow-sm ${scrolled ? 'bg-bw-light border-black/10' : 'bg-white/70 border-black/10'} group-hover:border-bw-gold/50`}>
              <LayoutGrid className="w-5 h-5 text-bw-navy" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-serif font-bold leading-none tracking-tight text-bw-navy">
                    VERDIX
                </h1>
                <span className="text-[10px] text-bw-gold font-medium uppercase tracking-[0.2em] mt-1 opacity-90">
                    Verified Decision Intelligence Exchange
                </span>
            </div>
          </div>

          {/* Right Side - Empty as requested (Button moved to pricing) */}
          <div className="hidden md:flex items-center gap-6">
             {/* Optional: Add navigation links here if needed later */}
          </div>

        </div>
      </div>
    </nav>
  );
};

