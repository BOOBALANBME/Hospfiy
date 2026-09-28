import React, { useState, useEffect } from 'react';
import { HospifyLogo } from './HospifyLogo';
import { Activity, ShieldCheck, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

interface HospifySplashScreenProps {
  onComplete: () => void;
  minDurationMs?: number;
}

export const HospifySplashScreen: React.FC<HospifySplashScreenProps> = ({
  onComplete,
  minDurationMs = 3400,
}) => {
  const [animationStage, setAnimationStage] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('Initializing Hospify Core Systems...');
  const [isClosing, setIsClosing] = useState<boolean>(false);

  useEffect(() => {
    // Stage 1: Ambient ECG grid and logo symbol enter
    const t1 = setTimeout(() => {
      setAnimationStage(1);
      setStatusMessage('Powering Biomedical Telemetry Grid...');
    }, 400);

    // Stage 2: Heart & Cross illuminated + ECG pulse surge
    const t2 = setTimeout(() => {
      setAnimationStage(2);
      setStatusMessage('Testing Medical Device Calibrations & Bed Sensors...');
    }, 1200);

    // Stage 3: Full Hospify Branding & Boobalan S BME revealed
    const t3 = setTimeout(() => {
      setAnimationStage(3);
      setStatusMessage('Hospify Portal Ready • Lead BME: Boobalan S');
    }, 2200);

    // Stage 4: Ready to open portal
    const t4 = setTimeout(() => {
      setAnimationStage(4);
      setIsClosing(true);
      setTimeout(() => {
        onComplete();
      }, 600); // Allow smooth fade/zoom out transition
    }, minDurationMs);

    // Progress counter
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, minDurationMs / 52);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearInterval(interval);
    };
  }, [minDurationMs, onComplete]);

  const handleSkip = () => {
    setIsClosing(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none overflow-hidden transition-all duration-700 ${
        isClosing ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background:
          'radial-gradient(circle at 50% 45%, #ffffff 0%, #f1f5f9 45%, #e2e8f0 85%, #cbd5e1 100%)',
      }}
    >
      {/* Subtle Background Hospital Telemetry Grid Lines */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #0284c7 1px, transparent 1px), linear-gradient(to bottom, #0284c7 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Ambient Pulsing Glow behind Logo */}
      <div
        className={`absolute w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none transition-all duration-1000 ${
          animationStage >= 2 ? 'scale-125 opacity-70' : 'scale-75 opacity-30'
        }`}
      />

      {/* Top Controls: Skip Intro button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={handleSkip}
          className="px-3.5 py-1.5 bg-slate-900/10 hover:bg-slate-900/20 text-slate-700 text-xs font-bold rounded-full transition-all border border-slate-300/60 flex items-center gap-1.5 backdrop-blur-xs shadow-xs"
        >
          <span>Enter Portal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center Cinematic Container */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-xl mx-auto">
        {/* Animated Central SVG Logo */}
        <div
          className={`transform transition-all duration-1000 ${
            animationStage >= 1
              ? 'translate-y-0 opacity-100 scale-100'
              : 'translate-y-8 opacity-0 scale-90'
          }`}
        >
          {/* Custom SVG Logo with Live Animation Effects */}
          <div className="relative p-6 sm:p-8 rounded-3xl bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <svg
              width="360"
              height="160"
              viewBox="0 0 460 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-[280px] sm:w-[380px] md:w-[440px] h-auto"
            >
              <defs>
                <linearGradient id="splash-h-blue" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="60%" stopColor="#0369a1" />
                  <stop offset="100%" stopColor="#0c2340" />
                </linearGradient>

                <linearGradient id="splash-cyan-stem" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0891b2" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>

                <linearGradient id="splash-heart" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="50%" stopColor="#0891b2" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>

                <linearGradient id="splash-ecg" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="30%" stopColor="#0ea5e9" />
                  <stop offset="70%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>

                <filter id="splash-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* H Pillar Left */}
              <rect
                x="20"
                y="46"
                width="20"
                height="74"
                rx="4"
                fill="url(#splash-h-blue)"
                className={`transition-all duration-700 ${
                  animationStage >= 1 ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* H Stem Lower Right */}
              <rect
                x="68"
                y="80"
                width="20"
                height="40"
                rx="4"
                fill="url(#splash-cyan-stem)"
                className={`transition-all duration-700 delay-100 ${
                  animationStage >= 1 ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Heart Contour */}
              <path
                d="M 102 54 
                   C 92 35, 66 36, 66 61 
                   C 66 88, 97 109, 107 119 
                   C 117 109, 148 88, 148 61 
                   C 148 36, 122 35, 112 54 
                   L 107 61 Z"
                fill="none"
                stroke="url(#splash-heart)"
                strokeWidth="13"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={animationStage >= 2 ? 'url(#splash-glow)' : undefined}
                className={`transition-all duration-700 ${
                  animationStage >= 1 ? 'opacity-100' : 'opacity-0 scale-95'
                }`}
              />

              {/* Medical Cross inside Heart */}
              <g
                fill="#0284c7"
                className={`transition-all duration-500 ${
                  animationStage >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}
                style={{ transformOrigin: '107px 74px' }}
              >
                <rect x="100.5" y="56" width="13" height="36" rx="3" />
                <rect x="89" y="67.5" width="36" height="13" rx="3" />
              </g>

              {/* Pulsing ECG Ribbon */}
              <path
                d="M 20 86 
                   C 32 86, 38 80, 50 77 
                   C 62 74, 80 70, 94 70 
                   L 101 70 
                   L 105 54 
                   L 111 84 
                   L 116 66 
                   L 120 72 
                   L 126 72 
                   C 141 72, 156 61, 168 45"
                fill="none"
                stroke="url(#splash-ecg)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-all duration-1000 ${
                  animationStage >= 2 ? 'opacity-100 stroke-dashoffset-0' : 'opacity-0'
                }`}
                filter="url(#splash-glow)"
              />

              {/* Arrow Head */}
              <path
                d="M 155 43 L 172 41 L 167 59 Z"
                fill="#14b8a6"
                stroke="#14b8a6"
                strokeWidth="2"
                strokeLinejoin="round"
                className={`transition-all duration-500 delay-300 ${
                  animationStage >= 2 ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Wordmark: Hospify */}
              <text
                x="185"
                y="102"
                fill="#0c2340"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="800"
                fontSize="62"
                letterSpacing="-1.5"
                className={`transition-all duration-700 ${
                  animationStage >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
              >
                Hospify
              </text>

              {/* Cyan dot for the 'i' */}
              <circle
                cx="342"
                cy="62"
                r="6.5"
                fill="#06b6d4"
                className={`transition-all duration-500 ${
                  animationStage >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                }`}
                style={{ transformOrigin: '342px 62px' }}
              />

              {/* Subtitle: BOOBALAN S BME */}
              <text
                x="186"
                y="126"
                fill="#334155"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="700"
                fontSize="17"
                letterSpacing="4"
                className={`transition-all duration-700 delay-150 ${
                  animationStage >= 3 ? 'opacity-100' : 'opacity-0'
                }`}
              >
                BOOBALAN S BME
              </text>
            </svg>
          </div>
        </div>

        {/* Dynamic Medical System Loading Progress Bar */}
        <div className="w-full max-w-sm mt-8 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5 text-blue-800">
              <Activity className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
              <span>{statusMessage}</span>
            </span>
            <span className="font-mono text-cyan-700 font-bold">{progress}%</span>
          </div>

          {/* Glowing Animated Progress Track */}
          <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden p-0.5 border border-slate-300/60 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 transition-all duration-200 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-center gap-3 pt-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Biomedical Device QA</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-600" />
              <span>15 Clinical Wards • 250 Beds</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
