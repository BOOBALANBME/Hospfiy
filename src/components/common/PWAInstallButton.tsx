import React, { useState } from 'react';
import { Download, Share2, PlusSquare, Check, X, Smartphone, Monitor } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'floating' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);

  // If already running inside an installed standalone PWA, hide install trigger
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setInstalledNotice(true);
        setTimeout(() => setInstalledNotice(false), 4000);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // In browsers without beforeinstallprompt (e.g. desktop Chrome iframe or Firefox)
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          id="pwa-install-header-btn"
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer border border-blue-400/40"
          title="Install Hospify on Android, Windows, Mac, or Chrome for offline access"
        >
          <Download className="w-3.5 h-3.5 animate-bounce" />
          <span className="hidden sm:inline">Install App</span>
          <span className="sm:hidden">Install</span>
        </button>
      )}

      {variant === 'banner' && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white px-4 py-2.5 rounded-xl border border-blue-500/30 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-300">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Install Hospify on your device</p>
              <p className="text-[11px] text-blue-200">
                Work offline seamlessly with local patient records & bed management.
              </p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold rounded-lg shadow-sm shrink-0 transition-all cursor-pointer"
          >
            Install
          </button>
        </div>
      )}

      {/* iOS & Manual Installation Guided Dialog */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                  {isIOS ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isIOS ? 'Install Hospify on iPhone / iPad' : 'Install Hospify as Desktop/Mobile App'}
                  </h3>
                  <p className="text-xs text-slate-500">Enable offline access & standalone mode</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 py-2 text-xs text-slate-700">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg shrink-0">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Step 1: Tap the Share button</p>
                      <p className="text-slate-500 mt-0.5">Located in your Safari bottom navigation bar.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg shrink-0">
                      <PlusSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Step 2: Tap "Add to Home Screen"</p>
                      <p className="text-slate-500 mt-0.5">
                        Scroll down the share sheet and select "Add to Home Screen" to install icon.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg shrink-0">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Google Chrome / Microsoft Edge / Windows</p>
                      <p className="text-slate-500 mt-0.5">
                        Click the <strong>Install Hospify</strong> icon located in your browser's address bar (URL bar on the right side) or press Menu (⋮) → "Install Hospify".
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Android Chrome</p>
                      <p className="text-slate-500 mt-0.5">
                        Tap browser menu (⋮) and choose <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                      </p>
                    </div>
                  </div>
                </>
              )}

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] leading-relaxed">
                ✨ <strong>Offline Ready:</strong> Once installed, Hospify runs without an internet connection using local IndexedDB storage and automatically syncs when online.
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Installed Toast Notification */}
      {installedNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold animate-in slide-in-from-bottom-2">
          <Check className="w-4 h-4" />
          <span>Hospify installed successfully! Offline access enabled.</span>
        </div>
      )}
    </>
  );
};
