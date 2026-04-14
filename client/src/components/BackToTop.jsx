import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    const scrolled = window.scrollY || document.documentElement.scrollTop;
    if (scrolled > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1, translateY: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="btn shadow-lg rounded-circle d-flex align-items-center justify-content-center"
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '30px',
            width: '45px',
            height: '45px',
            zIndex: 99999,
            background: 'rgba(16, 185, 129, 0.2)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid var(--glass-border)',
            color: 'var(--primary)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          }}
          aria-label="Back to top"
        >
          <i className="bi bi-arrow-up fs-4"></i>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
