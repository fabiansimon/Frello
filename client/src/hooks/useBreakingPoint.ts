import { useEffect, useState } from 'react';
import { BreakPoint } from '../lib';

const breakpointsData = {
  [BreakPoint.SM]: 640,
  [BreakPoint.MD]: 768,
  [BreakPoint.LG]: 1024,
  [BreakPoint.XL]: 1280,
  [BreakPoint.XXL]: 1536,
};

/**
 * Custom hook to detect if the current window width is less than a specified breakpoint.
 */
function useBreakingPoints(breakpoint: BreakPoint): boolean {
  const [breakActive, setBreakActive] = useState<boolean>(() => {
    return window.innerWidth < breakpointsData[breakpoint];
  });

  useEffect(() => {
    const handleResize = () => {
      const { innerWidth: width } = window;
      setBreakActive(width <= breakpointsData[breakpoint]);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return breakActive;
}

export default useBreakingPoints;
