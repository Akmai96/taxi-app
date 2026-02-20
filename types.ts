
export interface Fine {
    id: string;
    name: string;
    amount: number;
}

export interface Shift {
    id: string;
    date: Date;
    odometerStart: number;
    odometerEnd: number;
    rangeStart: number;
    rangeEnd: number;
    cardEarnings: number;
    cashEarnings: number;
    fuelCost: number;
    yandexCommission: number;
    parkCommission: number;
    rentCost: number;
    deductRent: boolean;
    fines: Fine[];
    selfEmployedTax: number;
}

export enum Period {
    Day = 'День',
    Week = 'Неделя',
    Month = 'Месяц'
}
