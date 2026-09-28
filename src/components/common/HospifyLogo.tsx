import React from 'react';

interface HospifyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon-only' | 'compact';
  showSubtitle?: boolean;
  animated?: boolean;
}

export const HospifyLogo: React.FC<HospifyLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  showSubtitle = true,
  animated = false,
}) => {
  // Dimension scales
  const dimensions = {
    sm: { width: 140, height: 42, iconSize: 34 },
    md: { width: 190, height: 56, iconSize: 46 },
    lg: { width: 280, height: 84, iconSize: 68 },
    xl: { width: 440, height: 130, iconSize: 104 },
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* SVG Icon Mark: H + Heart + Medical Cross + ECG Pulse Ribbon + Arrow */}
      <svg
        width={variant === 'icon-only' ? dimensions.iconSize * 1.3 : dimensions.iconSize * 1.3}
        height={variant === 'icon-only' ? dimensions.iconSize : dimensions.iconSize}
        viewBox="0 0 160 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${animated ? 'drop-shadow-[0_4px_16px_rgba(6,182,212,0.4)]' : 'drop-shadow-xs'}`}
      >
        <defs>
          {/* Gradients matching exact uploaded logo image */}
          <linearGradient id="hospify-dark-blue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#0c2340" />
          </linearGradient>

          <linearGradient id="hospify-cyan-stem" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          <linearGradient id="hospify-heart-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="40%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          <linearGradient id="hospify-ecg-ribbon" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="30%" stopColor="#0ea5e9" />
            <stop offset="70%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>

          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Left vertical pillar of 'H' */}
        <rect
          x="14"
          y="34"
          width="17"
          height="62"
          rx="3.5"
          fill="url(#hospify-dark-blue)"
        />

        {/* Lower right stem of 'H' */}
        <rect
          x="54"
          y="62"
          width="17"
          height="34"
          rx="3.5"
          fill="url(#hospify-cyan-stem)"
        />

        {/* Heart Contour (encircling the medical cross) */}
        <path
          d="M 82 42 
             C 74 26, 52 27, 52 48 
             C 52 70, 78 88, 86 96 
             C 94 88, 120 70, 120 48 
             C 120 27, 98 26, 90 42 
             L 86 48 Z"
          fill="none"
          stroke="url(#hospify-heart-gradient)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animated ? 'animate-pulse' : ''}
        />

        {/* Medical Cross inside Heart */}
        <g fill="#0284c7">
          {/* Vertical Bar of Cross */}
          <rect x="80.5" y="44" width="11" height="28" rx="2.5" />
          {/* Horizontal Bar of Cross */}
          <rect x="72" y="52.5" width="28" height="11" rx="2.5" />
        </g>

        {/* Dynamic ECG Ribbon Wave flowing from H stem, through Cross, out as an Arrow */}
        <path
          d="M 14 68 
             C 24 68, 28 62, 38 60 
             C 48 58, 62 55, 74 55 
             L 80 55 
             L 83 43 
             L 88 66 
             L 92 52 
             L 95 56 
             L 100 56 
             C 112 56, 124 48, 134 35"
          fill="none"
          stroke="url(#hospify-ecg-ribbon)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={animated ? 'url(#glow-cyan)' : undefined}
        />

        {/* Arrowhead pointing up-right at top of ECG curve */}
        <path
          d="M 124 33 L 138 32 L 134 46 Z"
          fill="#14b8a6"
          stroke="#14b8a6"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Typography: "Hospify" + "BOOBALAN S BME" */}
      {variant !== 'icon-only' && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-baseline">
            <span
              className="font-extrabold tracking-tight text-[#0c2340] font-sans"
              style={{
                fontSize:
                  size === 'sm'
                    ? '1.25rem'
                    : size === 'md'
                    ? '1.65rem'
                    : size === 'lg'
                    ? '2.4rem'
                    : '3.4rem',
                letterSpacing: '-0.03em',
              }}
            >
              Hosp
              <span className="relative inline-block">
                i
                {/* Cyan dot for the 'i' matching the user's logo */}
                <span
                  className="absolute -top-[0.22em] left-[50%] -translate-x-1/2 rounded-full bg-[#06b6d4]"
                  style={{
                    width: size === 'sm' ? '5px' : size === 'md' ? '7px' : size === 'lg' ? '10px' : '14px',
                    height: size === 'sm' ? '5px' : size === 'md' ? '7px' : size === 'lg' ? '10px' : '14px',
                  }}
                />
              </span>
              fy
            </span>
          </div>

          {showSubtitle && (
            <span
              className="font-bold tracking-[0.18em] text-[#334155] uppercase font-sans mt-0.5"
              style={{
                fontSize:
                  size === 'sm'
                    ? '0.55rem'
                    : size === 'md'
                    ? '0.7rem'
                    : size === 'lg'
                    ? '0.95rem'
                    : '1.3rem',
              }}
            >
              BOOBALAN S BME
            </span>
          )}
        </div>
      )}
    </div>
  );
};
