import { useEffect } from 'react';

export function useFullscreen() {
  useEffect(() => {
    const root = document.documentElement;

    const updateAppHeight = () => {
      const viewport = window.visualViewport;
      const height = Math.round(viewport?.height ?? window.innerHeight);
      const width = Math.round(viewport?.width ?? window.innerWidth);

      root.style.setProperty('--app-height', `${height}px`);
      root.style.setProperty('--app-width', `${width}px`);
    };

    updateAppHeight();

    window.addEventListener('resize', updateAppHeight);
    window.addEventListener('orientationchange', updateAppHeight);
    window.visualViewport?.addEventListener('resize', updateAppHeight);

    const timeoutId = setTimeout(updateAppHeight, 500);
    const timeoutId2 = setTimeout(updateAppHeight, 1000);

    return () => {
      window.removeEventListener('resize', updateAppHeight);
      window.removeEventListener('orientationchange', updateAppHeight);
      window.visualViewport?.removeEventListener('resize', updateAppHeight);
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
    };
  }, []);
}
