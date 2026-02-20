
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Shift } from './types';
import Stats, { Period } from './components/Stats';
import ShiftList from './components/ShiftList';
import ShiftForm from './components/ShiftForm';
import { PlusIcon } from './components/icons/PlusIcon';
import PeriodDetail from './components/PeriodDetail';
import { isSameDay, getStartOfWeek, getStartOfMonth, getEndOfWeek, getEndOfMonth } from './utils/dateUtils';
import { SettingsIcon } from './components/icons/SettingsIcon';
import SettingsModal from './components/SettingsModal';
import useTheme from './hooks/useTheme';
import { useTelegramStorage, initTelegramApp, hapticFeedback, hapticImpact } from './hooks/useTelegramStorage';

const App: React.FC = () => {
    // Инициализация Telegram
    useEffect(() => {
        initTelegramApp();
    }, []);

    // Данные смен — хранятся в Telegram CloudStorage (или localStorage как fallback)
    const { data: rawShifts, setData: setRawShifts, isLoaded } = useTelegramStorage<Shift[]>('taxiShifts', []);

    const [shifts, setShifts] = useState<Shift[]>([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [detailView, setDetailView] = useState<{ period: Period, date: Date } | null>(null);
    const [editingShift, setEditingShift] = useState<Shift | null>(null);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const { theme, setTheme } = useTheme();

    // Парсинг дат из хранилища
    useEffect(() => {
        if (isLoaded && rawShifts.length > 0) {
            const shiftsWithDateObjects = rawShifts.map(shift => ({
                ...shift,
                date: new Date(shift.date),
                fines: shift.fines || [],
                selfEmployedTax: shift.selfEmployedTax || 0,
            }));
            setShifts(shiftsWithDateObjects);
        }
    }, [isLoaded, rawShifts]);

    // Сохранение в хранилище при изменении
    const saveShifts = useCallback((newShifts: Shift[]) => {
        setShifts(newShifts);
        setRawShifts(newShifts);
    }, [setRawShifts]);

    const handleSaveShift = useCallback((savedShift: Shift) => {
        const updatedShifts = (() => {
            const isEditing = shifts.some(s => s.id === savedShift.id);
            if (isEditing) {
                return shifts.map(s => (s.id === savedShift.id ? savedShift : s));
            } else {
                return [...shifts, savedShift];
            }
        })();
        const sorted = updatedShifts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        saveShifts(sorted);
        hapticFeedback('success');
        setIsFormVisible(false);
        setEditingShift(null);
    }, [shifts, saveShifts]);

    const handleDeleteShift = useCallback((id: string) => {
        const updatedShifts = shifts.filter(shift => shift.id !== id);
        saveShifts(updatedShifts);
        hapticImpact('medium');
    }, [shifts, saveShifts]);

    const handleShowDetails = useCallback((period: Period, date: Date) => {
        setDetailView({ period, date });
        hapticImpact('light');
    }, []);

    const handleClearDetails = useCallback(() => {
        setDetailView(null);
    }, []);

    const handleStartEdit = (shift: Shift) => {
        setEditingShift(shift);
        setIsFormVisible(true);
        hapticImpact('light');
    };

    const handleAddNew = () => {
        setEditingShift(null);
        setIsFormVisible(true);
        hapticImpact('light');
    };

    const handleCancelForm = () => {
        setIsFormVisible(false);
        setEditingShift(null);
    };

    const sortedShifts = useMemo(() => {
        return [...shifts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [shifts]);

    const getShiftsForPeriod = useMemo(() => {
        if (!detailView) return [];

        const { period, date } = detailView;

        if (period === 'day') {
            return shifts.filter(s => isSameDay(new Date(s.date), date));
        }
        if (period === 'week') {
            const start = getStartOfWeek(date);
            const end = getEndOfWeek(date);
            return shifts.filter(s => {
                const shiftDate = new Date(s.date);
                return shiftDate >= start && shiftDate <= end;
            });
        }
        if (period === 'month') {
            const start = getStartOfMonth(date);
            const end = getEndOfMonth(date);
            return shifts.filter(s => {
                const shiftDate = new Date(s.date);
                return shiftDate >= start && shiftDate <= end;
            });
        }
        return [];
    }, [shifts, detailView]);

    // Показываем загрузку пока данные не подгрузились
    if (!isLoaded) {
        return (
            <div className={theme}>
                <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-slate-500 dark:text-slate-400">Загрузка данных...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={theme}>
            <div className="min-h-screen bg-gray-50 text-slate-800 dark:bg-black dark:text-slate-300 font-sans transition-colors">
                <div className="container mx-auto max-w-2xl p-4 pb-24">
                    <header className="py-6 text-center relative">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Таксометр</h1>
                        <p className="text-slate-500 dark:text-slate-400">Ваш личный учет смен</p>
                        <button onClick={() => setIsSettingsVisible(true)} className="absolute top-6 right-0 p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                            <SettingsIcon className="w-6 h-6" />
                        </button>
                    </header>

                    <main>
                        {isFormVisible ? (
                            <ShiftForm
                                initialData={editingShift}
                                onSave={handleSaveShift}
                                onCancel={handleCancelForm}
                            />
                        ) : (
                            <>
                                <Stats shifts={shifts} onPeriodSelect={() => { }} />
                                <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8">
                                    <h3 className="text-lg font-bold mb-4 px-2 text-slate-900 dark:text-slate-100">Последние смены</h3>
                                    <ShiftList shifts={sortedShifts} onDelete={handleDeleteShift} onEdit={handleStartEdit} />
                                </div>
                            </>
                        )}
                    </main>

                    {!isFormVisible && (
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 dark:from-black to-transparent">
                            <div className="max-w-2xl mx-auto">
                                <button
                                    onClick={handleAddNew}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center text-lg transition-transform transform active:scale-95"
                                >
                                    <PlusIcon className="w-6 h-6 mr-2" />
                                    Добавить запись
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <SettingsModal
                    isOpen={isSettingsVisible}
                    onClose={() => setIsSettingsVisible(false)}
                    currentTheme={theme}
                    onThemeChange={setTheme}
                />
            </div>
        </div>
    );
};

export default App;