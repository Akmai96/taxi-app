
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Shift } from '../types';
import { isSameDay, getStartOfWeek, getStartOfMonth } from '../utils/dateUtils';
import { calculateShiftNet } from '../utils/calculations';

export type Period = 'day' | 'week' | 'month';

interface StatsProps {
    shifts: Shift[];
    onPeriodSelect: (period: Period, date: Date) => void;
}

const PeriodSelector: React.FC<{ selected: Period; onSelect: (period: Period) => void }> = ({ selected, onSelect }) => {
    const periods: { key: Period; label: string }[] = [
        { key: 'day', label: 'День' },
        { key: 'week', label: 'Неделя' },
        { key: 'month', label: 'Месяц' },
    ];

    return (
        <div className="flex justify-center bg-gray-200 dark:bg-gray-800 p-1 rounded-full mb-6">
            {periods.map(({ key, label }) => (
                <button
                    key={key}
                    onClick={() => onSelect(key)}
                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors w-full ${selected === key
                        ? 'bg-white text-slate-900 dark:bg-slate-600 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-gray-300 dark:hover:bg-gray-700'
                        }`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
};

const StatPill: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = "bg-gray-200 dark:bg-gray-800" }) => (
    <div className={`${color} px-4 py-2 rounded-full flex items-center shadow-sm`}>
        <span className="text-sm font-medium whitespace-nowrap mr-2 text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-sm font-bold whitespace-nowrap text-slate-900 dark:text-white">{value}</span>
    </div>
);

const Stats: React.FC<StatsProps> = ({ shifts, onPeriodSelect }) => {
    const [period, setPeriod] = useState<Period>('day');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const scrollRef = useRef<HTMLDivElement>(null);

    // Устанавливаем текущую дату при смене периода
    useEffect(() => {
        setSelectedDate(new Date());
    }, [period]);

    const chartData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (period === 'day') {
            const data = Array.from({ length: 14 }).map((_, i) => {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                return { date, net: 0, label: date.getDate().toString(), subLabel: date.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '') };
            }).reverse();

            shifts.forEach(shift => {
                const shiftDate = new Date(shift.date);
                shiftDate.setHours(0, 0, 0, 0);
                const dayData = data.find(d => d.date.getTime() === shiftDate.getTime());
                if (dayData) dayData.net += calculateShiftNet(shift);
            });
            return data;
        }

        if (period === 'week') {
            const data = Array.from({ length: 8 }).map((_, i) => {
                const date = getStartOfWeek(new Date());
                date.setDate(date.getDate() - i * 7);
                const weekEnd = new Date(date);
                weekEnd.setDate(date.getDate() + 6);
                return {
                    date: date,
                    net: 0,
                    label: `${date.getDate()}`,
                    subLabel: `${weekEnd.getDate()} ${date.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '')}`
                };
            }).reverse();

            shifts.forEach(shift => {
                const shiftWeekStart = getStartOfWeek(new Date(shift.date));
                const weekData = data.find(d => d.date.getTime() === shiftWeekStart.getTime());
                if (weekData) {
                    weekData.net += calculateShiftNet(shift);
                }
            });
            return data;
        }

        if (period === 'month') {
            const data = Array.from({ length: 12 }).map((_, i) => {
                const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
                date.setHours(0, 0, 0, 0);
                return {
                    date: date,
                    net: 0,
                    label: date.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', ''),
                    subLabel: date.getFullYear().toString()
                };
            }).reverse();

            shifts.forEach(shift => {
                const shiftMonthStart = getStartOfMonth(new Date(shift.date));
                const monthData = data.find(d => d.date.getTime() === shiftMonthStart.getTime());
                if (monthData) {
                    monthData.net += calculateShiftNet(shift);
                }
            });
            return data;
        }

        return [];
    }, [shifts, period]);

    // Прокрутка к концу списка при загрузке
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
    }, [chartData]);

    const selectedShifts = useMemo(() => {
        if (period === 'day') {
            return shifts.filter(s => isSameDay(new Date(s.date), selectedDate));
        }
        if (period === 'week') {
            const start = getStartOfWeek(selectedDate);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
            return shifts.filter(s => {
                const d = new Date(s.date);
                return d >= start && d <= end;
            });
        }
        if (period === 'month') {
            const start = getStartOfMonth(selectedDate);
            const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
            end.setHours(23, 59, 59, 999);
            return shifts.filter(s => {
                const d = new Date(s.date);
                return d >= start && d <= end;
            });
        }
        return [];
    }, [shifts, period, selectedDate]);

    const breakdown = useMemo(() => {
        return selectedShifts.reduce((acc, s) => {
            acc.card += s.cardEarnings;
            acc.cash += s.cashEarnings;
            acc.tips += s.tips || 0;
            acc.bonuses += s.bonuses || 0;
            acc.yandexCommission += s.yandexCommission;
            acc.parkCommission += s.parkCommission;
            acc.tax += s.selfEmployedTax || 0;
            acc.fuel += s.fuelCost;
            acc.fines += s.fines?.reduce((sum, f) => sum + f.amount, 0) ?? 0;
            return acc;
        }, { card: 0, cash: 0, tips: 0, bonuses: 0, yandexCommission: 0, parkCommission: 0, tax: 0, fuel: 0, fines: 0 });
    }, [selectedShifts]);

    const totalNet = useMemo(() => selectedShifts.reduce((sum, s) => sum + calculateShiftNet(s), 0), [selectedShifts]);

    const maxNet = useMemo(() => Math.max(1, ...chartData.map(d => d.net)), [chartData]);

    return (
        <div className="mb-8">
            <PeriodSelector selected={period} onSelect={setPeriod} />

            <div className="text-center mb-8">
                <p className="text-5xl font-bold tracking-tighter text-slate-900 dark:text-white">
                    {totalNet.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
                </p>
            </div>

            <div
                ref={scrollRef}
                className="flex items-end h-48 px-2 overflow-x-auto space-x-3 mb-8 no-scrollbar scroll-smooth"
                style={{ scrollSnapType: 'x mandatory' }}
            >
                {chartData.map(({ date, net, label, subLabel }) => {
                    const height = Math.max((net / maxNet) * 100, 2);
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, new Date());

                    return (
                        <div
                            key={date.toISOString()}
                            className="flex flex-col items-center flex-shrink-0 w-16 h-full justify-end cursor-pointer transition-all snap-center"
                            onClick={() => setSelectedDate(date)}
                        >
                            <p className={`text-[10px] mb-1 font-bold ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                {net > 0 ? Math.round(net) : '0'}
                            </p>
                            <div
                                className={`w-full rounded-xl transition-all duration-300 ${isSelected
                                    ? 'bg-blue-500 shadow-lg shadow-blue-500/30'
                                    : 'bg-gray-200 dark:bg-gray-800'
                                    }`}
                                style={{ height: `${height}%`, minHeight: '8px' }}
                            ></div>
                            <div className="text-center mt-2">
                                <p className={`text-xs font-bold leading-none ${isSelected ? 'text-blue-500' : 'text-slate-600 dark:text-slate-400'}`}>{label}</p>
                                <p className={`text-[10px] uppercase font-medium ${isSelected ? 'text-blue-500/70' : 'text-slate-400 dark:text-slate-500'}`}>{subLabel}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
                <StatPill label="Картой" value={`${breakdown.card.toLocaleString()} ₽`} color="bg-zinc-100 dark:bg-zinc-800" />
                <StatPill label="Наличными" value={`${breakdown.cash.toLocaleString()} ₽`} color="bg-zinc-100 dark:bg-zinc-800" />
                <StatPill label="Чаевые" value={`${breakdown.tips.toLocaleString()} ₽`} color="bg-zinc-100 dark:bg-zinc-800" />
                {breakdown.bonuses > 0 && <StatPill label="Бонусы" value={`+${breakdown.bonuses.toLocaleString()} ₽`} color="bg-green-50 dark:bg-green-900/30 text-green-600" />}
                <StatPill label="Комиссия Я" value={`-${breakdown.yandexCommission.toLocaleString()} ₽`} color="bg-zinc-100 dark:bg-zinc-800 text-red-500" />
                <StatPill label="Комиссия П" value={`-${breakdown.parkCommission.toLocaleString()} ₽`} color="bg-zinc-100 dark:bg-zinc-800 text-red-500" />
                <StatPill label="Налог" value={`-${breakdown.tax.toLocaleString()} ₽`} color="bg-zinc-100 dark:bg-zinc-800 text-red-500" />
                <StatPill label="Топливо" value={`-${breakdown.fuel.toLocaleString()} ₽`} color="bg-zinc-100 dark:bg-zinc-800 text-red-500" />
                {breakdown.fines > 0 && <StatPill label="Штрафы" value={`-${breakdown.fines.toLocaleString()} ₽`} color="bg-red-50 dark:bg-red-900/30 text-red-600" />}
            </div>
        </div>
    );
};

export default Stats;