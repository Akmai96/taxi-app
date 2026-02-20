
import { useState, useEffect, useCallback } from 'react';
import { getTelegramColorScheme } from './useTelegramStorage';

export type Theme = 'light' | 'dark';

export const themes: { id: Theme; name: string }[] = [
    { id: 'light', name: 'Светлая' },
    { id: 'dark', name: 'Тёмная' },
];

const useTheme = () => {
    const [theme, setThemeState] = useState<Theme>('dark');

    useEffect(() => {
        // Сначала проверяем Telegram
        const tgTheme = getTelegramColorScheme();

        // Затем сохранённую тему
        const storedTheme = localStorage.getItem('app-theme') as Theme;

        if (storedTheme && themes.some(t => t.id === storedTheme)) {
            setThemeState(storedTheme);
        } else {
            setThemeState(tgTheme);
        }
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove('light', 'dark');

        if (theme === 'light') {
            root.classList.add('light');
        } else {
            root.classList.add('dark');
        }

        localStorage.setItem('app-theme', theme);
    }, [theme]);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
    }, []);

    return { theme, setTheme };
};

export default useTheme;