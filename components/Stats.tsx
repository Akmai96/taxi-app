
import React, { useMemo, useState } from 'react';
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
                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors w-full ${
                        selected === key
                            ? 'bg-white text-slate-900 dark:bg-slate-600 dark:text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-gray-300 dark:hover:bg-gray-700'
                    }`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
};

const Stats: React.FC<StatsProps> = ({ shifts, onPeriodSelect }) => {
    const [period, setPeriod] = useState<Period>('day');

    const chartData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (period === 'day') {
            const data = Array.from({ length: 7 }).map((_, i) => {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                return { date, net: 0, label: date.getDate().toString() };
            }).reverse();

            shifts.forEach(shift => {
                const shiftDate = new Date(shift.date);
                shiftDate.setHours(0,0,0,0);
                const dayData = data.find(d => d.date.getTime() === shiftDate.getTime());
                if (dayData) dayData.net += calculateShiftNet(shift);
            });
            return data;
        }

        if (period === 'week') {
            const data = Array.from({ length: 4 }).map((_, i) => {
                const date = getStartOfWeek(new Date());
                date.setDate(date.getDate() - i * 7);
                const weekEnd = new Date(date);
                weekEnd.setDate(date.getDate() + 6);
                return {
                    date: date,
                    net: 0,
                    label: `${date.getDate()}-${weekEnd.getDate()}`
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
             const data = Array.from({ length: 6 }).map((_, i) => {
                const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
                date.setHours(0,0,0,0);
                return {
                    date: date,
                    net: 0,
                    label: date.toLocaleDateString('ru-RU', { month: 'short' })
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
    
    const totalNetForPeriod = useMemo(() => {
         if (period === 'day') {
            const todayData = shifts.filter(s => isSameDay(new Date(s.date), new Date()));
            return todayData.reduce((sum, shift) => sum + calculateShiftNet(shift), 0);
        }
        // For week and month, we just sum up the last period's data for a relevant total.
        if(chartData.length > 0) {
            return chartData[chartData.length-1].net
        }
        return 0
    }, [shifts, period, chartData]);

    const maxNet = useMemo(() => Math.max(1, ...chartData.map(d => d.net)), [chartData]);
    
    const getPeriodLabel = () => {
        switch (period) {
            case 'week': return `Чистыми за текущую неделю`;
            case 'month': return `Чистыми за текущий месяц`;
            default: return `Сегодня • ${shifts.filter(s => isSameDay(new Date(s.date), new Date())).length} смен`;
        }
    }

    return (
        <div className="mb-8 bg-gray-100 dark:bg-gray-900/50 p-4 rounded-xl">
            <PeriodSelector selected={period} onSelect={setPeriod} />

            <div className="text-center mb-6">
                <p className="text-slate-500 dark:text-slate-400">{getPeriodLabel()}</p>
                <p className="text-5xl font-bold tracking-tighter text-slate-900 dark:text-white">{totalNetForPeriod.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ₽</p>
            </div>

            <div className={`flex items-end h-48 px-2 ${period === 'month' ? 'space-x-4' : 'space-x-2'}`}>
                {chartData.map(({ date, net, label }) => {
                    const height = Math.max((net / maxNet) * 100, 0);
                    const isToday = isSameDay(date, new Date());

                    return (
                        <div key={date.toISOString()} className="flex flex-col items-center flex-1 h-full justify-end cursor-pointer group" onClick={() => onPeriodSelect(period, date)}>
                            <p className="text-xs text-slate-700 dark:text-slate-300 mb-1 transition-opacity font-semibold">{net > 0 ? net.toFixed(0) : '0'}</p>
                            <div className={`w-full max-w-[40px] rounded transition-all ${isToday && period === 'day' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700 group-hover:bg-gray-400 dark:group-hover:bg-gray-600'}`} style={{ height: `${height}%` }}></div>
                            <p className={`text-xs mt-2 ${isToday && period === 'day' ? 'text-blue-500 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>{label}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Stats;