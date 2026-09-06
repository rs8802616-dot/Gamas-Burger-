import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const STORAGE_KEY_PROMPT_DISMISSED = 'burger10_pwa_prompt_dismissed_v1';
const STORAGE_KEY_ORDER_PROMPT_SHOWN = 'burger10_pwa_order_prompt_shown_v1';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showSmartBanner, setShowSmartBanner] = useState(false);
  const [smartPromptContext, setSmartPromptContext] = useState<'menu' | 'after_order' | null>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Detect standalone mode (already installed as PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    setIsInstalled(isStandalone);

    // Detect iOS devices (iPhone, iPad, iPod)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowSmartBanner(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger smart prompt after browsing menu for a bit or when explicitly requested
  const triggerSmartPrompt = useCallback(
    (context: 'menu' | 'after_order' = 'menu') => {
      if (isInstalled) return;

      if (context === 'menu') {
        const wasDismissed = sessionStorage.getItem(STORAGE_KEY_PROMPT_DISMISSED);
        if (wasDismissed) return;
      }

      setSmartPromptContext(context);
      setShowSmartBanner(true);
    },
    [isInstalled]
  );

  const dismissSmartPrompt = useCallback(() => {
    setShowSmartBanner(false);
    sessionStorage.setItem(STORAGE_KEY_PROMPT_DISMISSED, 'true');
  }, []);

  const install = async (): Promise<boolean> => {
    if (isIOS) {
      setShowIOSGuide(true);
      return false;
    }

    if (!deferredPrompt) {
      // Fallback: If browser doesn't support beforeinstallprompt yet or was already invoked, show guide
      setShowIOSGuide(true);
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        setShowSmartBanner(false);
        return true;
      }
    } catch {
      // Ignore user dismissal
    }
    return false;
  };

  return {
    isInstallable: isInstallable || isIOS,
    isInstalled,
    isIOS,
    showSmartBanner,
    smartPromptContext,
    showIOSGuide,
    setShowIOSGuide,
    triggerSmartPrompt,
    dismissSmartPrompt,
    install,
  };
}
