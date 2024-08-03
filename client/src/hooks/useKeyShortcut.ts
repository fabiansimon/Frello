import { useEffect } from 'react';
import useDetectOS from './useDetectOS';
import { OperationSystem } from '@/lib';

interface KeyShortcutProps {
  hotkey: string;
  action: () => void;
  ignoreMetaKey?: boolean;
}
function useKeyShortcut({
  hotkey,
  action,
  ignoreMetaKey = true,
}: KeyShortcutProps): void {
  const OS = useDetectOS();

  useEffect(() => {
    if (!hotkey) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const metaDown =
        ignoreMetaKey || (OS === OperationSystem.MAC ? e.metaKey : e.ctrlKey);

      if (metaDown && e.key.toLowerCase() === hotkey.toLowerCase()) action();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hotkey, action, OS, ignoreMetaKey]);
}

export default useKeyShortcut;
