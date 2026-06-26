export const transitions = {
    smooth: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
    fast: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
};

export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: transitions.smooth,
};

export const fadeUp = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: transitions.smooth,
};

export const slideUp = {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: transitions.smooth,
};

export const scaleFade = {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
    transition: transitions.fast,
};

export const staggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.055,
        },
    },
};

export const staggerItem = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: transitions.smooth,
};

export const cardHover = {
    whileHover: { y: -4, transition: transitions.fast },
};

export const buttonMotion = {
    whileHover: { y: -1, transition: transitions.fast },
    whileTap: { scale: 0.98, transition: transitions.fast },
};
