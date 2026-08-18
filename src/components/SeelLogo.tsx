import React from 'react';

export const SEEL_LOGO_SVG_DATA = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 148" width="240" height="148"><rect width="240" height="148" fill="%2306477d" rx="4"/><rect x="8" y="8" width="224" height="132" fill="none" stroke="%23f5cb0c" stroke-width="4"/><rect x="18" y="16" width="204" height="88" fill="none" stroke="%23f5cb0c" stroke-width="3.5"/><text x="28" y="86" font-family="'Arial Black', Impact, sans-serif" font-size="70" font-weight="900" fill="%23f5cb0c" letter-spacing="4">SEEL</text><rect x="186" y="28" width="16" height="16" fill="%23f5cb0c"/><line x1="18" y1="112" x2="222" y2="112" stroke="%23f5cb0c" stroke-width="3.5"/><text x="120" y="128" font-family="Arial, Helvetica, sans-serif" font-size="10.5" font-weight="bold" fill="%23f5cb0c" text-anchor="middle" letter-spacing="0.5">SERVIÇOS ESPECIAIS DE ENGENHARIA</text></svg>`;

interface SeelLogoProps {
  className?: string;
  height?: number | string;
  width?: number | string;
}

export const SeelLogo: React.FC<SeelLogoProps> = ({ 
  className = "h-10 w-auto",
  height,
  width
}) => {
  return (
    <svg 
      viewBox="0 0 240 148" 
      className={className}
      style={{ height, width }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Dark Blue */}
      <rect width="240" height="148" fill="#06477d" rx="4" />
      
      {/* Outer Yellow Border */}
      <rect x="8" y="8" width="224" height="132" fill="none" stroke="#f5cb0c" strokeWidth="4" />
      
      {/* Inner Yellow Frame Box around SEEL */}
      <rect x="18" y="16" width="204" height="88" fill="none" stroke="#f5cb0c" strokeWidth="3.5" />
      
      {/* Main SEEL Text */}
      <text 
        x="28" 
        y="86" 
        fontFamily="'Arial Black', 'Trebuchet MS', sans-serif" 
        fontSize="70" 
        fontWeight="900" 
        fill="#f5cb0c" 
        letterSpacing="4"
      >
        SEEL
      </text>
      
      {/* Distinctive Yellow Square Accent above the L */}
      <rect x="186" y="28" width="16" height="16" fill="#f5cb0c" />
      
      {/* Yellow Separator Line */}
      <line x1="18" y1="112" x2="222" y2="112" stroke="#f5cb0c" strokeWidth="3.5" />
      
      {/* Subtitle Text */}
      <text 
        x="120" 
        y="128" 
        fontFamily="Arial, Helvetica, sans-serif" 
        fontSize="10.5" 
        fontWeight="bold" 
        fill="#f5cb0c" 
        textAnchor="middle" 
        letterSpacing="0.5"
      >
        SERVIÇOS ESPECIAIS DE ENGENHARIA
      </text>
    </svg>
  );
};
