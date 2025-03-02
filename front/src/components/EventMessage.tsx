export default function EventMessage(): JSX.Element {
    const message = eventMessage(new Date());
    return (
        <div class="mb-4 text-center text-red-500 font-black text-xl">
            {message}
        </div>
    );
}

function eventMessage(today: Date): string | null {
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const yearDiff = year - 2022;

    let message: string | null;
    if (month == 2 && 10 <= day && day <= 16) {
        let ordinal: string; // 序数詞
        const onesPlace = yearDiff % 10;
        switch (onesPlace) {
            case 1:
                ordinal = "st";
                break;
            case 2:
                ordinal = "nd";
                break;
            case 3:
                ordinal = "rd";
                break;
            default:
                ordinal = "th";
                break;
        }
        message = `🎉${yearDiff}${ordinal} Anniv!`;
    } else if (month == 1 && day == 1) {
        message = "HappyNewYear!";
    } else if (month == 1 && 2 <= day && day <= 3) {
        message = "🎍🌅🎍";
    } else if (month == 2 && day == 3) {
        message = "👹 🥜🥜🥜ミ";
    } else if (month == 2 && day == 23) {
        message = "天皇誕生日";
    } else if (month == 3 && day == 3) {
        message = "🎎🍡🌸";
    } else if (month == 4 && day == 29) {
        message = "昭和の日";
    } else if (month == 5 && day == 3) {
        message = "憲法記念日";
    } else if (month == 5 && day == 4) {
        message = "みどりの日";
    } else if (month == 5 && day == 5) {
        message = "こどもの日";
    } else if (month == 6 && 21 <= day && day <= 22) {
        message = "☀️"; // 夏至
    } else if (month == 7 && day == 7) {
        message = "🎋🌠";
    } else if (month == 8 && day == 10) {
        message = `Web版HistoryViewerの日(${yearDiff}周年)`;
    } else if (month == 8 && day == 11) {
        message = "山の日";
    } else if (month == 8 && today.getDay() == 0){
        message = "🎆🏮👘🎇";
    } else if (month == 9 && day == 3){
        message = "草の日";
    } else if (month == 10 && day == 31) {
        message = "🎃👻💀";
    } else if (month == 11 && day == 3) {
        message = "文化の日";
    } else if (month == 11 && day == 23) {
        message = "勤労感謝の日";
    } else if (month == 12 && 21 <= day && day <= 22) {
        message = "🌉🌙"; // 冬至
    } else if (month == 12 && day == 25) {
        message = "🎄🎁";
    } else if (month == 12 && 26 <= day && day <= 31) {
        message = "今年もありがとうございました";
    } else {
        message = null;
    }

    return message;
}
