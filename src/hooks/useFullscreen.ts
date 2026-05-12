import { useEffect } from 'react';

export function useFullscreen() {
  useEffect(() => {
    const root = document.documentElement;

    const updateAppHeight = () => {
      root.style.setProperty('--app-height', `${window.innerHeight}px`);
    };

    const hideAddressBar = () => {
      try {
        updateAppHeight();
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: 1, left: 0, behavior: 'auto' });
        });
      } catch (e) {
        console.error('Error hiding address bar:', e);
      }
    };

    const handleUserGesture = () => {
      hideAddressBar();
    };

    hideAddressBar();

    window.addEventListener('resize', hideAddressBar);
    window.addEventListener('orientationchange', hideAddressBar);
    window.visualViewport?.addEventListener('resize', hideAddressBar);
    window.addEventListener('scroll', hideAddressBar);
    document.addEventListener('pointerdown', handleUserGesture);
    document.addEventListener('touchstart', handleUserGesture);

    const timeoutId = setTimeout(hideAddressBar, 500);
    const timeoutId2 = setTimeout(hideAddressBar, 1000);

    return () => {
      window.removeEventListener('resize', hideAddressBar);
      window.removeEventListener('orientationchange', hideAddressBar);
      window.visualViewport?.removeEventListener('resize', hideAddressBar);
      window.removeEventListener('scroll', hideAddressBar);
      document.removeEventListener('pointerdown', handleUserGesture);
      document.removeEventListener('touchstart', handleUserGesture);
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
    };
  }, []);
}
