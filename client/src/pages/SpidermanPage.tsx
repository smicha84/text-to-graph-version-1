import React, { useEffect } from 'react';

export default function SpidermanPage() {
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
    <div className="min-h-screen w-full bg-blue-100 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl h-[600px] bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Sky background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-blue-100">
          {/* Sun */}
          <div className="absolute top-10 right-20 w-20 h-20 bg-yellow-300 rounded-full shadow-lg" />
          
          {/* Clouds */}
          <div className="absolute top-16 left-20 w-32 h-12 bg-white rounded-full" />
          <div className="absolute top-12 left-36 w-24 h-12 bg-white rounded-full" />
          <div className="absolute top-14 left-28 w-28 h-14 bg-white rounded-full" />
          
          <div className="absolute top-24 right-40 w-32 h-12 bg-white rounded-full" />
          <div className="absolute top-20 right-56 w-24 h-12 bg-white rounded-full" />
          <div className="absolute top-22 right-48 w-28 h-14 bg-white rounded-full" />
          
          {/* Ground */}
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-green-600 to-green-400" />
        </div>
        
        {/* Spiderman */}
        <div className="absolute bottom-32 left-20 transform -rotate-12 animate-bounce">
          <svg width="150" height="180" viewBox="0 0 150 180">
            {/* Body */}
            <rect x="50" y="60" width="50" height="70" fill="#D40000" />
            
            {/* Head */}
            <circle cx="75" cy="45" r="25" fill="#D40000" />
            
            {/* Eyes */}
            <ellipse cx="65" cy="40" rx="10" ry="15" fill="white" />
            <ellipse cx="85" cy="40" rx="10" ry="15" fill="white" />
            
            {/* Web pattern */}
            <path d="M75 20 L75 70 M60 25 L90 65 M90 25 L60 65 M50 40 L100 50 M100 40 L50 50" 
                  stroke="black" strokeWidth="1" fill="none" />
            
            {/* Arms in running position */}
            <rect x="30" y="65" width="20" height="10" fill="#D40000" transform="rotate(-30, 30, 65)" />
            <rect x="100" y="65" width="20" height="10" fill="#D40000" transform="rotate(45, 100, 65)" />
            
            {/* Legs running */}
            <rect x="50" y="130" width="10" height="30" fill="#D40000" transform="rotate(-30, 50, 130)" />
            <rect x="90" y="130" width="10" height="30" fill="#D40000" transform="rotate(30, 90, 130)" />
          </svg>
          
          {/* Motion lines */}
          <svg className="absolute -right-10 top-20" width="50" height="100">
            <path d="M0 0 L40 10 M0 20 L40 30 M0 40 L40 50 M0 60 L40 70 M0 80 L40 90"
                  stroke="#999" strokeWidth="2" strokeDasharray="4" />
          </svg>
          
          {/* Sweat drops */}
          <svg className="absolute -top-10 left-20" width="50" height="50">
            <circle cx="10" cy="10" r="3" fill="#7DD3FC" />
            <circle cx="20" cy="5" r="2" fill="#7DD3FC" />
            <circle cx="5" cy="20" r="2" fill="#7DD3FC" />
          </svg>
          
          {/* Panic expression */}
          <div className="absolute top-10 right-0 bg-white rounded-lg p-2 transform rotate-12">
            <div className="text-xl font-comic">Aaaah!</div>
          </div>
        </div>
        
        {/* Fly chasing Spiderman */}
        <div className="absolute bottom-60 left-40 animate-pulse">
          <svg width="50" height="50" viewBox="0 0 50 50">
            {/* Fly body */}
            <ellipse cx="25" cy="25" rx="15" ry="10" fill="#333" />
            
            {/* Wings */}
            <ellipse cx="20" cy="15" rx="15" ry="8" fill="#AAA" fillOpacity="0.7" />
            <ellipse cx="30" cy="15" rx="15" ry="8" fill="#AAA" fillOpacity="0.7" />
            
            {/* Eyes */}
            <circle cx="20" cy="22" r="3" fill="red" />
            <circle cx="30" cy="22" r="3" fill="red" />
            
            {/* Legs */}
            <path d="M20 30 L15 40 M25 30 L25 40 M30 30 L35 40" 
                  stroke="#333" strokeWidth="1" />
          </svg>
          
          {/* Buzzing lines */}
          <svg className="absolute -top-5 left-5" width="40" height="40">
            <path d="M0 0 L10 10 M20 0 L10 10 M0 20 L10 10 M20 20 L10 10"
                  stroke="#333" strokeWidth="1" />
          </svg>
        </div>
        
        {/* Title */}
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-yellow-300 px-4 py-2 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600">Spiderman's Greatest Fear!</h1>
        </div>
        
        {/* Caption */}
        <div className="absolute bottom-5 right-5 bg-white px-3 py-2 rounded-lg shadow">
          <p className="text-sm italic">Even superheroes have their weaknesses...</p>
        </div>
      </div>
    </div>
  );
}