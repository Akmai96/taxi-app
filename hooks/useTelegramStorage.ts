import { useState, useEffect, useCallback, useRef } from 'react';

// Типы для Telegram WebApp CloudStorage
declare global {
    interface Window {
        Telegram?: {
            WebApp: {
                ready: () => void;
                expand: () => void;
                close: () => void;
                colorScheme: 'light' | 'dark';
                themeParams: Record<string, string>;
                initDataUnsafe: {
                    user?: {
                        id: number;
                        first_name: string;
                    };
                };
                CloudStorage: {
                    setItem: (key: string, value: string, callback?: (err: Error | null, success?: boolean) => void) => void;
                    getItem: (key: string, callback: (err: Error | null, value?: string) => void) => void;
                    getItems: (keys: string[], callback: (err: Error | null, values?: Record<string, string>) => void) => void;
                    removeItem: (key: string, callback?: (err: Error | null) => void) => void;
                    getKeys: (callback: (err: Error | null, keys?: string[]) => void) => void;
                };
                onEvent: (eventType: string, callback: () => void) => void;
                offEvent: (eventType: string, callback: () => void) => void;
                HapticFeedback: {
                    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
                    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
                };
            };
        };
    }
}

const isTelegram = (): boolean => {
    return !!(window.Telegram?.WebApp?.initDataUnsafe?.user);
};

const getCloudStorage = () => {
    return window.Telegram?.WebApp?.CloudStorage;
};

/**
 * Хук для хранения данных.
 * В Telegram → использует CloudStorage (данные привязаны к пользователю).
 * Вне Telegram → fallback на localStorage.
 */
export function useTelegramStorage<T>(key: string, defaultValue: T) {
    const [data, setData] = useState<T>(defaultValue);
    const [isLoaded, setIsLoaded] = useState(false);
    const isFirstRender = useRef(true);

    // Загрузка данных при первом рендере
    useEffect(() => {
        if (isTelegram()) {
            const cs = getCloudStorage();
            if (cs) {
                cs.getItem(key, (err, value) => {
                    if (!err && value) {
                        try {
                            setData(JSON.parse(value));
                        } catch {
                            console.warn('Ошибка парсинга CloudStorage:', key);
                        }
                    }
                    setIsLoaded(true);
                });
            } else {
                setIsLoaded(true);
            }
        } else {
            // Fallback на localStorage
            try {
                const stored = localStorage.getItem(key);
                if (stored) {
                    setData(JSON.parse(stored));
                }
            } catch {
                console.warn('Ошибка парсинга localStorage:', key);
            }
            setIsLoaded(true);
        }
    }, [key]);

    // Сохранение данных при изменении
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (!isLoaded) return;

        const serialized = JSON.stringify(data);

        if (isTelegram()) {
            const cs = getCloudStorage();
            if (cs) {
                cs.setItem(key, serialized, (err) => {
                    if (err) console.error('Ошибка сохранения CloudStorage:', err);
                });
            }
        } else {
            try {
                localStorage.setItem(key, serialized);
            } catch {
                console.error('Ошибка сохранения localStorage');
            }
        }
    }, [data, isLoaded, key]);

    const updateData = useCallback((updater: T | ((prev: T) => T)) => {
        setData(updater);
    }, []);

    return { data, setData: updateData, isLoaded };
}

/**
 * Инициализация Telegram WebApp
 */
export function initTelegramApp() {
    const tg = window.Telegram?.WebApp;
    if (tg) {
        tg.ready();
        tg.expand(); // Раскрыть на весь экран
    }
}

/**
 * Получить цветовую схему Telegram
 */
export function getTelegramColorScheme(): 'light' | 'dark' {
    return window.Telegram?.WebApp?.colorScheme || 'dark';
}

/**
 * Тактильная обратная связь
 */
export function hapticFeedback(type: 'success' | 'error' | 'warning' = 'success') {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type);
}

export function hapticImpact(style: 'light' | 'medium' | 'heavy' = 'light') {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
}
