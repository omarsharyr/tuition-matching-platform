import { useState, useEffect } from 'react';

const useSidebar = (defaultCollapsed = true) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        // On mobile, start collapsed
        setIsCollapsed(true);
      }
    };

    // Set initial state
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  const closeSidebar = () => {
    setIsCollapsed(true);
  };

  const openSidebar = () => {
    setIsCollapsed(false);
  };

  return {
    isCollapsed,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    setIsCollapsed
  };
};

export default useSidebar;
