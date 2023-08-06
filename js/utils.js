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
