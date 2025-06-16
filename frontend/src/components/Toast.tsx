import { motion } from 'framer-motion';

const ExampleComponent = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="example"
    >
      <h1>Hello, world!</h1>
    </motion.div>
  );
};

export default ExampleComponent;
