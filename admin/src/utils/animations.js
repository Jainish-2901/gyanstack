export const pageVariants = {
    initial: {
        opacity: 0,
        x: -4,
        scale: 0.995
    },
    animate: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
            staggerChildren: 0.05
        }
    },
    exit: {
        opacity: 0,
        x: 4,
        transition: {
            duration: 0.15,
            ease: "easeIn"
        }
    }
};

export const fadeInUp = {
    initial: { opacity: 0, y: 15 },
    animate: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    }
};

export const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.05
        }
    }
};

export const hoverScale = {
    whileHover: { scale: 1.01, y: -1 },
    whileTap: { scale: 0.99 }
};

export const sidebarVariants = {
    open: {
        x: 0,
        transition: { type: "spring", stiffness: 400, damping: 40 }
    },
    closed: {
        x: "-100%",
        transition: { type: "spring", stiffness: 400, damping: 40 }
    }
};

export const metricVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
        scale: 1, 
        opacity: 1,
        transition: { type: "spring", stiffness: 260, damping: 20 }
    }
};
