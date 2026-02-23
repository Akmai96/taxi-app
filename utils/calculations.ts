
import { Shift } from '../types';

export const calculateShiftNet = (shift: Shift): number => {
    const gross = shift.cardEarnings + shift.cashEarnings + (shift.bonuses || 0);
    const commissions = shift.yandexCommission + shift.parkCommission;
    const finesTotal = shift.fines?.reduce((sum, fine) => sum + fine.amount, 0) ?? 0;
    const rent = shift.deductRent ? shift.rentCost : 0;
    const tax = shift.selfEmployedTax || 0;
    const expenses = shift.fuelCost + commissions + finesTotal + rent + tax;
    return gross + (shift.tips || 0) - expenses;
};
