import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import AlertController from '@/controllers/AlertController';
import Text from './Text';

const DEFAULT_TITLE = 'Are you sure?';
const DEFAULT_DESCRIPTION = 'This cannot be reverted.';

interface AlertInfo {
  title?: string;
  description?: string;
  callback?: (args?: any) => any | void | Promise<void>;
  buttonText?: string;
  optimistic?: boolean;
  destructive?: boolean;
}

export interface AlertMethods {
  show: ({
    title,
    description,
    callback,
    buttonText,
    optimistic,
    destructive,
  }: {
    title?: string;
    description?: string;
    callback?: (args?: any) => any | void;
    buttonText?: string;
    optimistic?: boolean;
    destructive?: boolean;
  }) => void;
}

function Alert(): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [info, setInfo] = useState<AlertInfo | null>(null);

  const ref = useRef<AlertMethods>();

  const onClick = async () => {
    try {
      if (info?.callback) {
        !info.optimistic && setIsLoading(true);
        await info.callback();
      }
    } finally {
      setIsLoading(false);
      closeAlert();
    }
  };

  const closeAlert = () => {
    setIsVisible(false);
    setTimeout(() => {
      setInfo(null);
    }, 300);
  };

  useLayoutEffect(() => {
    AlertController.setRef(ref);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      show: ({
        title,
        description,
        callback,
        buttonText = 'Remove',
        optimistic = false,
        destructive = true,
      }: {
        title?: string;
        description?: string;
        callback?: (args?: any) => any | void | Promise<void>;
        buttonText?: string;
        optimistic?: boolean;
        destructive?: boolean;
      }) => {
        setInfo({
          title,
          description,
          callback,
          buttonText,
          optimistic,
          destructive,
        });
        setIsVisible(true);
      },
    }),
    []
  );

  return (
    <motion.div
      onClick={(e) => {
        e.stopPropagation();
        closeAlert();
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
        variants={{ visible: { scale: 1 }, hidden: { scale: 0.7 } }}
        className={cn('bg-white p-4 rounded-xl w-80 items-start')}
      >
        <>
          <Text.Body className="font-medium  text-left text-[16px]">
            {info?.title || DEFAULT_TITLE}
          </Text.Body>
          <Text.Body className="text-black/60 text-left text-sm mt-1">
            {info?.description || DEFAULT_DESCRIPTION}
          </Text.Body>
          <div className="modal-action">
            <form method="dialog">
              <button
                className="btn btn-outline"
                onClick={closeAlert}
              >
                <Text.Subtitle>Close</Text.Subtitle>
              </button>
              {info?.callback !== undefined && (
                <button
                  disabled={isLoading}
                  onClick={onClick}
                  className={cn(
                    'btn ml-2',
                    info.destructive ? 'btn-error' : 'btn-primary'
                  )}
                >
                  {isLoading ? (
                    <span className="loading text-white loading-spinner"></span>
                  ) : (
                    <Text.Subtitle className="text-white">
                      {info.buttonText}
                    </Text.Subtitle>
                  )}
                </button>
              )}
            </form>
          </div>
        </>
      </motion.div>
    </motion.div>
  );
}

export default forwardRef<AlertInfo>(Alert);
