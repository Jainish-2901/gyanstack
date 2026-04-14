export const pageVariants = {
    initial: {
        opacity: 0,
        y: 8,
        scale: 0.99
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1], 
            staggerChildren: 0.1
        }
    },
    exit: {
        opacity: 0,
        y: -8,
        transition: {
            duration: 0.2,
            ease: "easeIn"
        }
    }
};

export const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

export const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.08
        }
    }
};

export const hoverScale = {
    whileHover: { scale: 1.02, y: -2 },
    whileTap: { scale: 0.98 }
};

export const sidebarVariants = {
    open: {
        x: 0,
        transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    closed: {
        x: "-100%",
        transition: { type: "spring", stiffness: 300, damping: 30 }
    }
};
