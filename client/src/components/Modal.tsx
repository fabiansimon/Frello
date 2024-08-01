'use client';

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { motion } from 'framer-motion';
import ModalController from '@/controllers/ModalController';
import { cn } from '@/lib/utils';
import useBreakingPoints from '@/hooks/useBreakingPoint';
import { BreakPoint } from '@/lib';

export interface ModalMethods {
  show: (children: React.ReactNode) => void;
  close: () => void;
}
function Modal(): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [content, setContent] = useState<React.ReactNode | null>(null);

  const isSmall = useBreakingPoints(BreakPoint.SM);

  const ref = useRef<ModalMethods>();

  const closeModal = useCallback(() => {
    setIsVisible(false);
    setContent(null);
  }, []);

  useLayoutEffect(() => {
    ModalController.setRef(ref);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      show: (children: React.ReactNode) => {
        setContent(children);
        setIsVisible(true);
      },
      close: () => closeModal(),
    }),
    [closeModal]
  );

  return (
    <motion.div
      onClick={(e) => {
        e.stopPropagation();
        closeModal();
      }}
      initial="hidden"
      transition={{ duration: 0.08 }}
      animate={isVisible ? 'visible' : 'hidden'}
      variants={{
        visible: { opacity: 1 },
        hidden: { opacity: 0 },
      }}
      className={cn(
        'fixed w-full h-full z-20 top-0 left-0 right-0 bottom-0 bg-black/50 flex flex-col items-center justify-end md:justify-center',
        !isVisible && 'pointer-events-none'
      )}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial="hidden"
        transition={{ duration: 0.05 }}
        animate={isVisible ? 'visible' : 'hidden'}
        variants={
          isSmall
            ? {
                visible: { translateY: 0, scale: 1 },
                hidden: { translateY: 1000 },
              }
            : { visible: { scale: 1 }, hidden: { scale: 0.7 } }
        }
        className={cn(
          'rounded-tl-xl rounded-tr-xl flex justify-center min-w-full md:min-w-[90%] max-h-[90%]'
        )}
      >
        {content && content}
      </motion.div>
    </motion.div>
  );
}

export default forwardRef<ModalMethods>(Modal);
