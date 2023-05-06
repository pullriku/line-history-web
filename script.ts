class Patterns {
    private constructor() { }

    static DATE = /^20\d{2}\/\d{1,2}\/\d{1,2}\(.+\)\r?$/g;
    static YEAR = /^20\d{2}/g;
    static MONTH_DAY = /\d{2}/g;
}

class LineHistory {
    private historyData: string[];
    public get isExist() {
        return this.historyData != null && this.historyData != undefined && this.historyData.length != 0;
    }

    constructor(data?: string) {
        if (data != null) {
            this.historyData = data.replace(/\r/, "").split("\n");
        } else {
            this.historyData = [];
        }
    }

    searchByDate(dateString: string): string {
        let dateInput = this.generateDate(dateString);
        let countStart: number = -1;
        let countStop: number = -1;
        let countFlag: boolean = false;
        let output: string = "";

        for (let i = 0; i < this.historyData.length; i++) {
            let line: string = this.historyData[i];

            if (Patterns.DATE.test(line)) {

                let dateTmp = this.generateDate(line.substring(0, 10))

                if (dateTmp.getTime() == dateInput.getTime()) {
                    countStart = i;
                    countFlag = true;
                    output += `<h3 style="display:inline;font-family: sans-serif;">${line}</h3><br>`;
                } else if (countFlag && dateInput.getTime() < dateTmp.getTime()) {
                    countStop = i;
                    break;
                }
            } else if (countFlag) {
                output += `${line}<br>`;
                if (i == this.historyData.length - 1) {
                    countStop = i;
                    break;
                }
            }
        }
        if (countStart == -1) {
            output = "この日の履歴はありません。<br>";
        } else {
            output += `${countStop - countStart}行<br>`;
        }
        return output;
    }

    searchByKeyword(keyword: string): string {
        let counter = 0;
        let output = "";
        let date: Date = new Date(1, 1, 1);
        let max_date = new Date(1970, 1, 1);

        if (keyword.length > 1) {
            for (let i = 0; i < this.historyData.length; i++) {
                let line = this.historyData[i];

                if (Patterns.DATE.test(line)) {
                    if (this.generateDate(line.substring(0, 10)).getTime() >= max_date.getTime()) {
                        date = this.generateDate(line.substring(0, 10));
                        max_date = date;
                    }
                } else {
                    if (line.search(keyword) != -1) {
                        counter++;
                        if (/\d{2}:\d{2}.*/.test(line)) {
                            line = line.substring(6);
                        }
                        if (line.length >= 60) {
                            line = `${line.substring(0, 60)}...`;
                        }
                        let spaceRemoveCounter = 0;
                        if (date.getMonth() <= 8) spaceRemoveCounter++;
                        if (date.getDate() <= 9) spaceRemoveCounter++;

                        let outputElement = `${date.toLocaleDateString("ja-jp").substring(0, 10 - spaceRemoveCounter).replace(/-/g, "/")}`;
                        output += `<a href="javascript:runSearchByDate('${outputElement}');" id="dateLink"><spam style="font-weight: bold;">` + outputElement + `</spam></a> ${line}<br>`;
                    }
                }
            }
        }
        if (output == "") {
            output = "見つかりませんでした。";
        }
        return `<h3 style="display:inline">${counter}件</h3><br><br>${output}`;
    }

    searchByRandom(tries: number = 1000): string {
        const today = new Date().getTime();
        let first = 0;

        for (let i = 0; i < this.historyData.length; i++) {
            let line = this.historyData[i];
            if (Patterns.DATE.test(line)) {
                first = this.generateDate(line.substring(0, 10)).getTime();
                break;
            }
        }

        let result = "この日の履歴はありません";
        let foundData = false;

        while (!foundData) {
            let randomNum = this.getRandom(first, today);
            let date = new Date(randomNum);
            result = this.searchByDate(`${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`);
            if (result.search("この日の履歴はありません") == -1) {
                foundData = true;
            } else {
                tries--;
                if (tries == 0) {
                    result = "見つかりませんでした。";
                    break;
                }
            }
        }
        return result;
    }

    private getRandom(n: number, m: number): number {
        let num = Math.floor(Math.random() * (m + 1 - n)) + n;
        return num;
    }

    private generateDate(dateString: string): Date {
        const splitDate = dateString.split("/");
        let result: Date;
        if (splitDate.length != 3) {
            result = new Date(1970, 1, 1);
        } else {
            const year = parseInt(splitDate[0]);
            const month = parseInt(splitDate[1]);
            const day = parseInt(splitDate[2]);
            if (this.checkDate(year, month, day)) {
                result = new Date(year, month - 1, day);
            } else {
                result = new Date(1970, 1, 1);
            }
        }
        return result;
    }
    
    private checkDate(year: number = 1970, month: number = 1, day: number = 1): boolean {
        return year > 0
            && 0 < month && month < 13
            && 0 < day && day < 32;
    }
}

function addAsterisk(message: string): string {
    let result = "";
    let inputSplitted = message.split("<br>");
    for (let i = 0; i < inputSplitted.length; i++) {
        let line = inputSplitted[i];
        result += `＊${line}<br>`;
    }
    return result;
}

function runCommand(command_: string, history: LineHistory): string {
    let command: string[] = command_.split(" ");
    if (command.length < 5) {
        for (let i = 0; i < 5 - command.length; i++) {
            command.push("");
        }
    }

    let commandName: string = command[0];
    let output: string = ""

    if (/^20\d{2}\/\d{1,2}\/\d{1,2}$/.test(commandName)) {
        output = history.searchByDate(commandName);
    } else if (commandName == "/help") {

    } else if (commandName == "/random") {
        output = history.searchByRandom();
    } else if (commandName == "/search") {
        output = history.searchByKeyword(command[1]);
    } else {
        output = makeErrorMessage("command_error");
    }

    if (history.isExist == false) {
        output = "⚠️履歴ファイルを選択してください。"
    }
    return output;
}

function makeErrorMessage(message: string): string {
    let result = "コマンドエラーが発生しました。";
    if (message != "") {
        result += `type: ${message}`;
    }
    return result;
}

function runSearchByDate(date: string): void {
    console.log(date);
    const outputField = document.getElementById("outputField");
    let result = runCommand(date, lineHistory);
    if (outputField?.innerHTML && result != "") {
        outputField.innerHTML = addAsterisk(result);
    }
}

const title = document.getElementById("title");
const fileField = document.getElementById("file");
const dateInput = document.getElementById("dateTimeInput");
const dateSubmitButton = document.getElementById("dateSubmitButton");
const wordInputField = document.getElementById("wordInput");
let inputWord = "";
const wordSubmitButton = document.getElementById("wordSubmitButton");
const randomSubmitButton = document.getElementById("randomSubmitButton");
const displayModeSwitch = document.getElementById("displayModeSwitch");
const outputField = document.getElementById("outputField");
const specialMessage = document.getElementById("specialMessage");

let lineHistory = new LineHistory();

const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
let isLightMode = !mediaQuery.matches;
setManualDisplayMode(isLightMode);

if (outputField?.innerHTML) {
    outputField.innerHTML = `
        <br>
        Welcome back<br>
        <br>
        `
}

// 特別な表示の処理
// 毎年2/10から2/16に表示
// const today = new Date(2023,2-1,13);
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;
const day = today.getDate();
const yearDiff = year - 2022;


let ordinal: string; // 序数詞
if (month == 2 && 10 <= day && day <= 16 && specialMessage) {
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
    specialMessage.innerHTML = `🎉${yearDiff}${ordinal} Anniv!`;
    specialMessage.style.display = "block"

}

if (month == 1 && day == 1 && specialMessage) {
    specialMessage.innerHTML = `HappyNewYear!`;
    specialMessage.style.display = "block"
}


wordInputField?.addEventListener("keyup", (e) => {
    inputWord = (e.target as HTMLInputElement).value;
})

dateSubmitButton?.addEventListener("click", (e) => {
    let result = runCommand((dateInput as HTMLInputElement)?.value.replace(/-/g, "/"), lineHistory);
    if (outputField?.innerHTML && result != "") {
        outputField.innerHTML = addAsterisk(result);
    }
})

wordSubmitButton?.addEventListener("click", (e) => {
    let result = runCommand(`/search ${inputWord}`, lineHistory);
    if (outputField?.innerHTML && result != "") {
        outputField.innerHTML = addAsterisk(result);
    }
})

randomSubmitButton?.addEventListener("click", (e) => {
    let result = runCommand(`/random`, lineHistory);
    if (outputField?.innerHTML && result != "") {
        outputField.innerHTML = addAsterisk(result);
    }
})

let file: FileList;
let text: string | ArrayBuffer;

fileField?.addEventListener("change", (e) => {
    file = (e.target as HTMLInputElement)?.files ?? new FileList();
    let reader = new FileReader();
    reader.readAsText(file[0]);

    reader.onload = (e) => {
        text = reader.result ?? "";
        if (typeof text == "string") {
            lineHistory = new LineHistory(text)
        }

    }
}, false);

displayModeSwitch?.addEventListener("click", () => {
    isLightMode = !isLightMode;
    setManualDisplayMode(isLightMode);
})

function setManualDisplayMode(isLightMode: boolean): void {
    if (displayModeSwitch != null) {
        if (isLightMode) {
            document.documentElement.setAttribute("theme", "light");
            displayModeSwitch.innerHTML = "🌚<br>ダーク";
        } else {
            document.documentElement.setAttribute("theme", "dark");
            displayModeSwitch.innerHTML = "🌝<br>ライト";
        }
    }
}