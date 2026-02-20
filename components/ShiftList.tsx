
import React from 'react';
import { Shift } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { calculateShiftNet } from '../utils/calculations';

interface ShiftListProps {
    shifts: Shift[];
    onDelete: (id: string) => void;
    onEdit: (shift: Shift) => void;
}

const ShiftItem: React.FC<{ shift: Shift; onDelete: (id: string) => void; onEdit: (shift: Shift) => void; }> = ({ shift, onDelete, onEdit }) => {
    const net = calculateShiftNet(shift);

    const date = new Date(shift.date);
    const formattedDate = date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Вы уверены, что хотите удалить эту смену?')) {
            onDelete(shift.id);
        }
    }

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(shift);
    }

    return (
        <li className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg flex justify-between items-center transition-colors hover:bg-gray-200 dark:hover:bg-gray-800/60">
            <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{formattedDate}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Пробег: {shift.odometerEnd - shift.odometerStart} км
                </p>
            </div>
            <div className="flex items-center space-x-2">
                <p className={`text-lg font-bold ${net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {net.toFixed(2)} ₽
                </p>
                <button onClick={handleEdit} className="text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 p-2 rounded-full transition-colors">
                     <PencilIcon className="w-5 h-5"/>
                </button>
                <button onClick={handleDelete} className="text-slate-500 hover:text-red-500 p-2 rounded-full transition-colors">
                     <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
        </li>
    );
};

const ShiftList: React.FC<ShiftListProps> = ({ shifts, onDelete, onEdit }) => {
    if (shifts.length === 0) {
        return (
            <div className="text-center py-10 px-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-300">Нет записей</h3>
                <p className="text-slate-500 dark:text-slate-500 mt-1">Добавьте свою первую смену, чтобы начать учет.</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200 mb-4">История смен</h2>
            <ul className="space-y-3">
                {shifts.map(shift => (
                    <ShiftItem key={shift.id} shift={shift} onDelete={onDelete} onEdit={onEdit} />
                ))}
            </ul>
        </div>
    );
};

export default ShiftList;