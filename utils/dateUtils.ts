
// Returns the date for the most recent Monday.
// If today is Sunday, it returns the Monday of the current week.
export const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay(); // Sunday - 0, Monday - 1, ...
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    d.setDate(diff);
    return d;
};

export const getEndOfWeek = (date: Date): Date => {
    const d = getStartOfWeek(date);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
};

// Returns the date for the first day of the current month.
export const getStartOfMonth = (date: Date): Date => {
    const d = new Date(date.getFullYear(), date.getMonth(), 1);
    d.setHours(0,0,0,0);
    return d;
};

export const getEndOfMonth = (date: Date): Date => {
    const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    d.setHours(23, 59, 59, 999);
    return d;
}

// Checks if two dates are on the same day, ignoring time.
export const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};
