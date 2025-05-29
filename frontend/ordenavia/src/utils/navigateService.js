let navigator;

export const setNavigator = (navFn) => {
    navigator = navFn;
};

export const navigateTo = (path) => {
    if (navigator) {
        navigator(path);
    } else {
        console.warn('Navigator not set');
    }
};