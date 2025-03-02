export function getRandomDarkColor(): string {
    // 色相は0-360の間でランダム
    const hue = Math.floor(Math.random() * 360);
    // 彩度は50-100%でランダム（鮮やかな色）
    const saturation = Math.floor(Math.random() * 80 + 80);
    // 明度は15-45%でランダム（暗い色だが完全な黒ではない）
    const lightness = Math.floor(Math.random() * 40 + 15);
    
    return `hsl(${hue},${saturation}%,${lightness}%)`;
};
