import { motion } from 'framer-motion';

export default function UserTaskSheet(): JSX.Element {
  return (
    <motion.div
      initial="hidden"
      variants={{
        hidden: { translateY: '80%' },
        visible: { translateY: 0 },
      }}
      className="absolute rounded-xl bottom-0 right-0 left-0 xl:right-20 xl:left-20 bg-white h-[90%]"
    ></motion.div>
  );
}
