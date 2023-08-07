export function zeroPadding(number, length) {
    const numberString = number.toString();
    if (numberString.length >= length)
        return numberString;
    return (Array(length).join('0') + numberString).slice(-length);
}
export function newYMDString(date) {
    return {
        year: date.getFullYear().toString(),
        month: zeroPadding(date.getMonth() + 1, 2),
        day: zeroPadding(date.getDate(), 2),
    };
}
export function newYMDInt(date) {
    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
    };
}
export function ymdToDate(ymd) {
    return new Date(ymd.year, ymd.month - 1, ymd.day);
}
