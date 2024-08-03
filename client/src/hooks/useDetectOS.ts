import { OperationSystem } from '@/lib';
import { useEffect, useState } from 'react';

function useDetectOS() {
  const [os, setOS] = useState<OperationSystem>(OperationSystem.MISC);

  useEffect(() => {
    const platform = window.navigator.platform.toLowerCase();
    const userAgent = window.navigator.userAgent.toLowerCase();

    if (/iphone|ipad|ipod/.test(userAgent)) {
      setOS(OperationSystem.IOS);
    } else if (/android/.test(userAgent)) {
      setOS(OperationSystem.ANDROID);
    } else if (platform.includes('mac') || userAgent.includes('mac os')) {
      setOS(OperationSystem.MAC);
    } else if (platform.includes('win')) {
      setOS(OperationSystem.WINDOWS);
    } else if (platform.includes('linux')) {
      setOS(OperationSystem.LINUX);
    }
  }, []);

  return os;
}

export default useDetectOS;
