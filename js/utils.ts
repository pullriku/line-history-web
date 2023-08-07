export function zeroPadding(number: number | String, length: number): string {
    const numberString = number.toString();
    if(numberString.length >= length) return numberString;
    return (Array(length).join('0') + numberString).slice(-length);
}

export type YMDString = {
    readonly year: string; 
    readonly month: string;
    readonly day: string;
};

export type YMDInt = {
    readonly year: number;
    readonly month: number;
    readonly day: number;
};

export function newYMDString(date: Date): YMDString {
    return {
        year: date.getFullYear().toString(),
        month: zeroPadding(date.getMonth() + 1, 2),
        day: zeroPadding(date.getDate(), 2),
    };
}

export function newYMDInt(date: Date): YMDInt {
    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
    };
}

export function ymdToDate(ymd: YMDInt): Date {
    return new Date(ymd.year, ymd.month - 1, ymd.day);
}