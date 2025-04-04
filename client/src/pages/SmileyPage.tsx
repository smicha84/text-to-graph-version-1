import React, { useEffect } from 'react';

export default function SmileyPage() {
  // Hide header when this page is mounted
  useEffect(() => {
    // Store the original display style
    const header = document.querySelector('header');
    const originalDisplay = header ? header.style.display : '';
    
    // Hide the header
    if (header) {
      header.style.display = 'none';
    }
    
    // Restore the header when component unmounts
    return () => {
      if (header) {
        header.style.display = originalDisplay;
      }
    };
  }, []);

  return (
    <div className="h-screen w-full bg-orange-500 flex items-center justify-center">
      <div className="text-yellow-300">
        {/* Large SVG Smiley Face */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="400" 
          height="400" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          strokeWidth="0"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="8" cy="9" r="1.5" fill="black" />
          <circle cx="16" cy="9" r="1.5" fill="black" />
          <path 
            d="M16,14.5 C15,17 13,18 12,18 C11,18 9,17 8,14.5" 
            stroke="black" 
            strokeWidth="1.5" 
            fill="none" 
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}