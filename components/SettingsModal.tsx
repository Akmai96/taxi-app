
import React, { useState } from 'react';
import { Theme, themes } from '../hooks/useTheme';

const TermsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-lg w-full m-4 space-y-4 text-slate-700 dark:text-slate-300 relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                    ✕
                </button>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white pr-6">Правила Пользования</h2>
                <div className="space-y-3 text-sm">
                    <p><strong>1. Статус приложения:</strong> Данное приложение является независимым инструментом для учета доходов и расходов и никак <strong>не связано</strong> с сервисами Яндекс Про или другими агрегаторами.</p>
                    <p><strong>2. Хранение данных:</strong> Все данные (информация о сменах, доходах, расходах), сохраняются локально в хранилище вашего браузера или в Telegram CloudStorage. Разработчик не имеет к ним доступа.</p>
                    <p><strong>3. Налоги:</strong> Приложение не платит налоги за вас. Вы несете полную ответственность за декларирование своих доходов и уплату налога (например, Налог на Профессиональный Доход - СМЗ). Сумма налога в приложении служит только для вашего расчетного удобства.</p>
                    <p><strong>4. Алгоритм расчетов:</strong> Формулы расчета приближены к Яндекс Про: комиссии вычитаются из совокупного "грязного" дохода (включая бонусы), а чаевые добавляются к чистой прибыли без комиссий и процентов.</p>
                    <p><strong>5. Ответственность и гарантии:</strong> Разработчик не несет ответственности за потерю данных, ошибки в расчетах или косвенные убытки. Приложение предоставляется «как есть».</p>
                </div>
                <button onClick={onClose} className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Понятно
                </button>
            </div>
        </div>
    );
};


interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTheme: Theme;
    onThemeChange: (theme: Theme) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentTheme, onThemeChange }) => {
    const [isTermsVisible, setIsTermsVisible] = useState(false);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40" onClick={onClose}>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full m-4 space-y-6 relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                        ✕
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white pr-6">Настройки</h2>

                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">Тема оформления</h3>
                        <div className="flex space-x-2">
                            {themes.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => onThemeChange(theme.id)}
                                    className={`w-full py-2 rounded-lg font-semibold border-2 transition-colors ${currentTheme === theme.id
                                        ? 'border-green-500 text-green-600'
                                        : 'border-transparent bg-gray-200 dark:bg-gray-700 text-slate-700 dark:text-slate-300'
                                        }`}
                                >
                                    {theme.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">Приложение на экране</h3>
                        <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-xl text-sm space-y-2">
                            <p className="font-bold">Как добавить ярлык на телефон:</p>
                            <p>1. Нажмите на иконку в углу (три точки или стрелка вверх).</p>
                            <p>2. Выберите пункт <span className="text-green-500 font-bold">"Добавить на главный экран"</span>.</p>
                            <p>3. Теперь Таксометр будет запускаться как обычное приложение!</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">Помощь проекту</h3>
                        <a href="https://tips.yandex.ru/guest/payment/6618450" target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                            Поддержать разработчика
                        </a>
                    </div>

                    <div className="text-center">
                        <button onClick={() => setIsTermsVisible(true)} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                            Правила пользования
                        </button>
                    </div>

                </div>
            </div>
            {isTermsVisible && <TermsModal onClose={() => setIsTermsVisible(false)} />}
        </>
    );
};

export default SettingsModal;