export function zeroPadding(number: number | String, length: number): string {
    const numberString = number.toString();
    if(numberString.length >= length) return numberString;
    return (Array(length).join('0') + numberString).slice(-length);
}