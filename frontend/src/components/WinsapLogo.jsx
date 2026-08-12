import React from 'react';

const WinsapLogo = ({
  variant = 'full', // 'full' | 'icon'
  colorMode = 'original', // 'original' (gradient text like W) | 'white' (white text) | 'dark' (dark slate text)
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  className = ''
}) => {
  const heights = {
    sm: 'h-6 sm:h-7',
    md: 'h-8 sm:h-9',
    lg: 'h-10 sm:h-11',
    xl: 'h-12 sm:h-14',
    '2xl': 'h-16 sm:h-20',
    '3xl': 'h-20 sm:h-24',
  };

  // Text fill: if white explicitly, white text; if dark explicitly, dark slate; otherwise exact same gradient as W
  const textFill =
    colorMode === 'white'
      ? '#FFFFFF'
      : colorMode === 'dark'
      ? '#1C2B33'
      : 'url(#winsapSharedGradient)';

  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 240 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${heights[size] || heights.md} w-auto ${className}`}
      >
        <defs>
          <linearGradient id="winsapSharedGradientIcon" x1="0%" y1="90%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00C6FF" />
            <stop offset="35%" stopColor="#0072FF" />
            <stop offset="75%" stopColor="#0052CC" />
            <stop offset="100%" stopColor="#003399" />
          </linearGradient>
          <filter id="wIconDropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0072FF" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Dynamic Fluid W Icon */}
        <g filter="url(#wIconDropShadow)">
          <path
            d="M 12,30 
               C 8,62 16,108 34,132 
               C 48,150 66,140 80,108 
               C 90,84 98,66 110,66 
               C 122,66 128,78 136,104 
               C 144,128 156,140 170,126 
               C 186,110 204,68 238,8 
               C 184,94 160,112 148,104 
               C 140,98 134,78 126,52 
               C 116,22 96,20 80,38 
               C 62,58 50,106 38,106 
               C 32,106 24,80 24,56 
               C 24,40 16,24 12,30 Z"
            fill="url(#winsapSharedGradientIcon)"
          />
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 600 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${heights[size] || heights.md} w-auto ${className}`}
    >
      <defs>
        <linearGradient id="winsapSharedGradient" x1="0%" y1="90%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00C6FF" />
          <stop offset="35%" stopColor="#0072FF" />
          <stop offset="75%" stopColor="#0052CC" />
          <stop offset="100%" stopColor="#003399" />
        </linearGradient>
        <filter id="wFullDropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0072FF" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Dynamic Fluid W Icon */}
      <g filter="url(#wFullDropShadow)">
        <path
          d="M 12,30 
             C 8,62 16,108 34,132 
             C 48,150 66,140 80,108 
             C 90,84 98,66 110,66 
             C 122,66 128,78 136,104 
             C 144,128 156,140 170,126 
             C 186,110 204,68 238,8 
             C 184,94 160,112 148,104 
             C 140,98 134,78 126,52 
             C 116,22 96,20 80,38 
             C 62,58 50,106 38,106 
             C 32,106 24,80 24,56 
             C 24,40 16,24 12,30 Z"
          fill="url(#winsapSharedGradient)"
        />
      </g>

      {/* Straight, Bold Typography INSAP with the exact same gradient as W */}
      <text
        x="215"
        y="142"
        fontFamily="'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontWeight="900"
        fontSize="90"
        letterSpacing="0.01em"
        fill={textFill}
      >
        INSAP
      </text>
    </svg>
  );
};

export default WinsapLogo;
