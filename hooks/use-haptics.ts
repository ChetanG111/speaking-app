export const useHaptics = () => {
    const trigger = (pattern: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
        if (typeof navigator === 'undefined' || !navigator.vibrate) return;

        switch (pattern) {
            case 'light':
                navigator.vibrate(10); // Subtle tick
                break;
            case 'medium':
                navigator.vibrate(40); // Standard feedback
                break;
            case 'heavy':
                navigator.vibrate(70); // Strong feedback
                break;
            case 'success':
                navigator.vibrate([30, 50, 30]); // Da-da-da
                break;
            case 'warning':
                navigator.vibrate([50, 30, 50]); // Warning buzz
                break;
            case 'error':
                navigator.vibrate([50, 100, 50, 100]); // Long buzzes
                break;
        }
    };

    return { trigger };
};

