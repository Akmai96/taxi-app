
import React, { useState, useMemo, useEffect } from 'react';
import { Shift, Fine } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface ShiftFormProps {
    onSave: (shift: Shift) => void;
    onCancel: () => void;
    initialData?: Shift | null;
}

interface ShiftFormData {
    date: string;
    odometerStart: number | null;
    odometerEnd: number | null;
    rangeStart: number | null;
    rangeEnd: number | null;
    cardEarnings: number | null;
    cashEarnings: number | null;
    fuelCost: number | null;
    yandexCommission: number | null;
    parkCommission: number | null;
    rentCost: number | null;
    selfEmployedTax: number | null;
    tips: number | null;
    bonuses: number | null;
    deductRent: boolean;
    fines: Omit<Fine, 'id'>[];
}

const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const InputField: React.FC<{ label: string; id: string; type?: string; value: string | number | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string, unit?: string, info?: string }> =
    ({ label, id, type = 'text', value, onChange, placeholder, unit, info }) => (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</label>
            <div className="relative">
                <input
                    id={id}
                    type={type}
                    value={value ?? ''}
                    onChange={onChange}
                    placeholder={placeholder || '0'}
                    className="w-full bg-gray-100 dark:bg-gray-700 text-slate-900 dark:text-slate-100 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    step={type === 'number' ? '0.01' : undefined}
                />
                {unit && <span className="absolute inset-y-0 right-3 flex items-center text-slate-500 dark:text-slate-400">{unit}</span>}
            </div>
            {info && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{info}</p>}
        </div>
    );

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-900/50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">{title}</h3>
        {children}
    </div>
);

const ShiftForm: React.FC<ShiftFormProps> = ({ onSave, onCancel, initialData }) => {
    const [formData, setFormData] = useState<ShiftFormData>({
        date: formatDateForInput(new Date()),
        odometerStart: null,
        odometerEnd: null,
        rangeStart: null,
        rangeEnd: null,
        cardEarnings: null,
        cashEarnings: null,
        fuelCost: null,
        yandexCommission: null,
        parkCommission: null,
        rentCost: null,
        selfEmployedTax: null,
        tips: null,
        bonuses: null,
        deductRent: false,
        fines: []
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                date: formatDateForInput(new Date(initialData.date)),
                odometerStart: initialData.odometerStart,
                odometerEnd: initialData.odometerEnd,
                rangeStart: initialData.rangeStart,
                rangeEnd: initialData.rangeEnd,
                cardEarnings: initialData.cardEarnings,
                cashEarnings: initialData.cashEarnings,
                fuelCost: initialData.fuelCost,
                yandexCommission: initialData.yandexCommission,
                parkCommission: initialData.parkCommission,
                rentCost: initialData.rentCost,
                selfEmployedTax: initialData.selfEmployedTax,
                tips: initialData.tips || null,
                bonuses: initialData.bonuses || null,
                deductRent: initialData.deductRent,
                fines: initialData.fines.map(({ id, ...rest }) => rest),
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? null : Number(value)) : value),
        }));
    };

    const handleFineChange = (index: number, field: 'name' | 'amount', value: string | number) => {
        const newFines = [...formData.fines];
        newFines[index] = { ...newFines[index], [field]: value };
        setFormData(prev => ({ ...prev, fines: newFines }));
    };

    const addFine = () => {
        setFormData(prev => ({ ...prev, fines: [...prev.fines, { name: '', amount: 0 }] }));
    };

    const removeFine = (index: number) => {
        setFormData(prev => ({ ...prev, fines: prev.fines.filter((_, i) => i !== index) }));
    };

    const calculations = useMemo(() => {
        const distance = (formData.odometerEnd ?? 0) - (formData.odometerStart ?? 0);
        const rangeChange = (formData.rangeStart ?? 0) - (formData.rangeEnd ?? 0);
        const gross = (formData.cardEarnings ?? 0) + (formData.cashEarnings ?? 0) + (formData.bonuses ?? 0);
        const commissions = (formData.yandexCommission ?? 0) + (formData.parkCommission ?? 0);
        const finesTotal = formData.fines.reduce((sum, fine) => sum + (Number(fine.amount) || 0), 0);
        const expenses = (formData.fuelCost ?? 0) + commissions + (formData.deductRent ? (formData.rentCost ?? 0) : 0) + finesTotal + (formData.selfEmployedTax ?? 0);
        const net = gross + (formData.tips ?? 0) - expenses;
        return { distance, rangeChange, gross, net };
    }, [formData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const shiftData: Shift = {
            id: initialData?.id || new Date().toISOString(),
            date: new Date(formData.date),
            odometerStart: formData.odometerStart ?? 0,
            odometerEnd: formData.odometerEnd ?? 0,
            rangeStart: formData.rangeStart ?? 0,
            rangeEnd: formData.rangeEnd ?? 0,
            cardEarnings: formData.cardEarnings ?? 0,
            cashEarnings: formData.cashEarnings ?? 0,
            fuelCost: formData.fuelCost ?? 0,
            yandexCommission: formData.yandexCommission ?? 0,
            parkCommission: formData.parkCommission ?? 0,
            rentCost: formData.rentCost ?? 0,
            selfEmployedTax: formData.selfEmployedTax ?? 0,
            tips: formData.tips ?? 0,
            bonuses: formData.bonuses ?? 0,
            deductRent: formData.deductRent,
            fines: formData.fines.map((f, i) => ({ ...f, id: initialData?.fines[i]?.id || (new Date().toISOString() + i), amount: Number(f.amount) || 0 }))
        };
        onSave(shiftData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pb-32">
            <Section title={initialData ? "Редактировать смену" : "Новая смена"}>
                <InputField label="Дата смены" id="date" type="date" value={formData.date} onChange={handleChange} />
            </Section>

            <Section title="Пробег и Запас Хода">
                <InputField label="Одометр до" id="odometerStart" type="number" value={formData.odometerStart} onChange={handleChange} unit="км" />
                <InputField label="Одометр после" id="odometerEnd" type="number" value={formData.odometerEnd} onChange={handleChange} unit="км" info={`Пробег: ${calculations.distance > 0 ? calculations.distance : 0} км`} />
                <InputField label="Запас хода до" id="rangeStart" type="number" value={formData.rangeStart} onChange={handleChange} unit="км" />
                <InputField label="Запас хода после" id="rangeEnd" type="number" value={formData.rangeEnd} onChange={handleChange} unit="км" info={`Изменение запаса хода: ${calculations.rangeChange > 0 ? calculations.rangeChange.toFixed(0) : 0} км`} />
            </Section>

            <Section title="Доходы">
                <InputField label="Оплата картой (безнал)" id="cardEarnings" type="number" value={formData.cardEarnings} onChange={handleChange} unit="₽" />
                <InputField label="Оплата наличными" id="cashEarnings" type="number" value={formData.cashEarnings} onChange={handleChange} unit="₽" />
                <InputField label="Бонусы" id="bonuses" type="number" value={formData.bonuses} onChange={handleChange} unit="₽" />
                <InputField label="Чаевые" id="tips" type="number" value={formData.tips} onChange={handleChange} unit="₽" info={`Итого грязными: ${calculations.gross.toFixed(2)} ₽`} />
            </Section>

            <Section title="Расходы">
                <InputField label="Топливо" id="fuelCost" type="number" value={formData.fuelCost} onChange={handleChange} unit="₽" />
                <InputField label="Комиссия Яндекса" id="yandexCommission" type="number" value={formData.yandexCommission} onChange={handleChange} unit="₽" />
                <InputField label="Комиссия парка" id="parkCommission" type="number" value={formData.parkCommission} onChange={handleChange} unit="₽" />
                <InputField label="Аренда" id="rentCost" type="number" value={formData.rentCost} onChange={handleChange} unit="₽" />
                <InputField label="Налог СМЗ" id="selfEmployedTax" type="number" value={formData.selfEmployedTax} onChange={handleChange} unit="₽" />
                <div className="flex items-center mt-4">
                    <input type="checkbox" id="deductRent" checked={formData.deductRent} onChange={handleChange} className="h-4 w-4 text-green-500 bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-green-600 focus:ring-offset-gray-800" />
                    <label htmlFor="deductRent" className="ml-2 block text-sm text-slate-800 dark:text-slate-300">Удержать аренду сегодня</label>
                </div>
            </Section>

            <Section title="Штрафы">
                {formData.fines.map((fine, index) => (
                    <div key={index} className="flex items-end space-x-2 mb-2">
                        <div className="flex-grow"><InputField label="Название штрафа" id={`fine_name_${index}`} value={fine.name} onChange={(e) => handleFineChange(index, 'name', e.target.value)} placeholder="Превышение скорости" /></div>
                        <div className="w-28"><InputField label="Сумма" id={`fine_amount_${index}`} type="number" value={fine.amount} onChange={(e) => handleFineChange(index, 'amount', e.target.value)} unit="₽" /></div>
                        <button type="button" onClick={() => removeFine(index)} className="mb-4 p-2 text-slate-500 hover:text-red-500 rounded-full"><TrashIcon className="w-5 h-5" /></button>
                    </div>
                ))}
                <button type="button" onClick={addFine} className="text-green-500 hover:text-green-400 dark:text-green-400 dark:hover:text-green-300 font-semibold text-sm">+ Добавить штраф</button>
            </Section>


            <div className="sticky bottom-0 bg-white dark:bg-gray-900 backdrop-blur-sm py-4 px-4 -mx-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center mb-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Итого за смену (чистыми)</p>
                    <p className={`text-3xl font-extrabold ${calculations.net >= 0 ? 'text-green-500' : 'text-red-500'}`}>{calculations.net.toFixed(2)} ₽</p>
                </div>
                <div className="flex space-x-3">
                    <button type="button" onClick={onCancel} className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-slate-800 dark:text-slate-200 font-bold py-3 px-4 rounded-lg transition-colors">Отмена</button>
                    <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">Сохранить</button>
                </div>
            </div>
        </form>
    );
};

export default ShiftForm;