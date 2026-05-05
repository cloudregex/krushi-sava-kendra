import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Aggressive Global Reset
    const resetScroll = () => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      
      // Target specific layout containers explicitly by ID
      const mainContainer = document.getElementById('agro-main-container');
      const topAnchor = document.getElementById('top-anchor');
      
      if (topAnchor) {
        topAnchor.scrollIntoView({ behavior: 'auto', block: 'start' });
      }

      if (mainContainer) {
        mainContainer.style.scrollBehavior = 'auto'; // Force instant
        mainContainer.scrollTop = 0;
        if (mainContainer.scrollTo) mainContainer.scrollTo({ top: 0, behavior: 'instant' });
      }

      const containers = document.querySelectorAll('.main-content, .agro-container, main');
      containers.forEach(container => {
        container.style.scrollBehavior = 'auto';
        container.scrollTop = 0;
        if (container.scrollTo) container.scrollTo({ top: 0, behavior: 'instant' });
      });
    };

    resetScroll();
    
    // Safety backups for dynamic content
    const t1 = setTimeout(resetScroll, 10);
    const t2 = setTimeout(resetScroll, 100);
    const t3 = setTimeout(resetScroll, 300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;
