/**
 * @fileoverview 履歴ファイルを読み込み、コマンドを実行するためのスクリプト
 */

/**
 * @classdesc 日付のパターンを保持するクラス
 */
class Patterns {
    private constructor() { }

    static readonly DATE = /^20\d{2}\/\d{1,2}\/\d{1,2}\(.+\)\r?$/g;
    static readonly YEAR = /^20\d{2}/g;
    static readonly MONTH_DAY = /\d{2}/g;
    static readonly DATE_NO_WEEK = /^20\d{2}\/\d{1,2}\/\d{1,2}$/g;
}

/**
 * @classdesc 履歴ファイルを保持するクラス
 */
class LineHistory {
    /** 履歴データを改行で区切った配列 */
    private historyData: string[];
    /** historyDataの各日付のインデックスを保持する配列 */
    private dateIndices: {[date: string]: number};
    /** 現在の日付．過去の日付に反応させないため．dateChangeButtonを実装するため． */
    private _currentDate?: Date;

    constructor(data?: string) {
        if (data != null) {
            this.historyData = data.replace(/\r/g, "").split("\n");
        } else {
            this.historyData = [];
        }
        this.dateIndices = this.calcDateIndices();
        this._currentDate = undefined;
        
    }

    public get currentDate(): Date | undefined {
        return this._currentDate != undefined 
            ? new Date(this._currentDate) 
            : undefined;
    }

    public get exists(): boolean {
        return this.historyData != null 
            && this.historyData != undefined 
            && this.historyData.length != 0;
    }

    public searchByDate(dateString: string): string { 
        return this.hashSearchByDate(dateString);
        // return this.seqSearchByDate(dateString);
    }

    public hashSearchByDate(dateString: string): string {
        const dateInput = generateDate(dateString);
        this._currentDate = dateInput;

        let output: string = "";
        let startIndex = this.dateIndices[dateInput.toLocaleDateString()];
        if (startIndex == undefined) {
            output = "この日の履歴はありません。<br>";
            return output;
        }

        let countStop: number = -1;
        for(let i = startIndex; i < this.historyData.length; i++){
            let line = this.historyData[i];
            if (i != startIndex && Patterns.DATE.test(line)) {
                countStop = i;
                break;
            }

            let lineInfo = line.split("\t");
            let lineNum = i-startIndex;
            if(lineInfo.length >= 2) {
                lineInfo[0] = `<a href="javascript:showLineInfoAlert('${this._currentDate?.toLocaleDateString()}',${lineNum});">${lineInfo[0]}</a>`;
            }
            output += `<span id="${lineNum}">${lineInfo.join("\t")}</span><br>`;

            if (i == this.historyData.length - 1) {
                countStop = i;
                break;
            }
        }

        output += `${countStop - startIndex}行<br>`;

        return output;
    }

    /**
     * 指定した日付の履歴を検索する
     * @param dateString 日付を表す文字列 yyyy/mm/dd
     * @returns 指定した日の履歴
     */
    public seqSearchByDate(dateString: string): string {
        const dateInput = generateDate(dateString);
        let countStart: number = -1;
        let countStop: number = -1;
        let countFlag: boolean = false;
        let output: string = "";

        for (let i = 0; i < this.historyData.length; i++) {
            let line: string = this.historyData[i];

            if (Patterns.DATE.test(line)) {

                let dateTmp = generateDate(line.substring(0, 10))

                if (dateTmp.getTime() == dateInput.getTime()) {
                    countStart = i;
                    countFlag = true;
                    output += `${line}<br>`;
                    this._currentDate = dateTmp;
                } else if (countFlag && dateInput.getTime() < dateTmp.getTime()) {
                    countStop = i;
                    break;
                }
            } else if (countFlag) {
                let lineInfo = line.split("\t");
                let lineNum = i-countStart;
                if(lineInfo.length >= 2) {
                    lineInfo[0] = `<a href="javascript:showLineInfoAlert('${this._currentDate?.toLocaleDateString()}',${lineNum});">${lineInfo[0]}</a>`;
                }
                output += `<span id="${lineNum}">${lineInfo.join("\t")}</span><br>`;
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

    public searchByKeyword(keyword: string): string {
        let counter = 0;
        let output = "";
        let date: Date = new Date(1, 1, 1);
        let max_date = new Date(1970, 1, 1);
        let countStart: number = -1;

        if (keyword.length == 1) {
            output += "注意: 1文字検索は大量にヒットする可能性があり、リソースの消費量が多くなる可能性があります。<br><br>";
        }

        for (let i = 0; i < this.historyData.length; i++) {
            let line = this.historyData[i];

            if (Patterns.DATE.test(line)) {
                if (generateDate(line.substring(0, 10)).getTime() >= max_date.getTime()) {
                    date = generateDate(line.substring(0, 10));
                    max_date = date;
                    countStart = i;
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


                    let lineNum = i-countStart;
                    const year = date.getFullYear();
                    const month = zeroPadding(date.getMonth() + 1, 2);
                    const day = zeroPadding(date.getDate(), 2);
                    const dateString = `${year}/${month}/${day}`;
                    output += `<a href="javascript:runSearchByDate('${dateString}', '${lineNum}');" id="dateLink"><spam style="font-weight: bold;">${dateString}@${lineNum}</spam></a> ${line}<br>`;
                }
            }
        }
        
        output = output == "" ? "見つかりませんでした。" : output;

        this._currentDate = undefined;
        return `<h3 style="display:inline">${counter}件</h3><br><br>${output}`;
    }

    public searchByRandom(tries: number = 1000): string {
        const dates = Object.keys(this.dateIndices);
        const randomDate = dates[Math.floor(Math.random() * dates.length)];

        const dateString = generateDate(randomDate).toLocaleDateString();
        return this.searchByDate(dateString);
    }

    private calcDateIndices(): {[date: string]: number} {
        let result: {[date: string]: number} = {};
        let current: Date = new Date(1, 1, 1);

        for (let i = 0; i < this.historyData.length; i++) {
            let line = this.historyData[i];
            if (Patterns.DATE.test(line)) {
                let dateTmp = generateDate(line.substring(0, 10))
                if (dateTmp.getTime() >= current.getTime()) {
                    current = dateTmp;
                    result[dateTmp.toLocaleDateString()] = i;
                }
            }
        }
        return result;
    }
}

function checkDate(year: number = 1970, month: number = 1, day: number = 1): boolean {
    return year > 0
        && 0 < month 
        && month < 13
        && 0 < day 
        && day < 32;
}

function generateDate(dateString: string): Date {
    const splitDate = dateString.split("/");
    let result: Date;
    if (splitDate.length != 3) {
        result = new Date(1970, 1, 1);
    } else {
        const year = parseInt(splitDate[0]);
        const month = parseInt(splitDate[1]);
        const day = parseInt(splitDate[2]);
        if (checkDate(year, month, day)) {
            result = new Date(year, month - 1, day);
        } else {
            result = new Date(1970, 1, 1);
        }
    }
    return result;
}

function getRandom(n: number, m: number): number {
    let num = Math.floor(Math.random() * (m + 1 - n)) + n;
    return num;
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

function showLineInfoAlert(date: string, lineNumber: number): void {
    const info = date.split("/").slice(0, 3);

    const year = Number.parseInt(info[0]);
    const month = zeroPadding(Number.parseInt(info[1]), 2);
    const day = zeroPadding(Number.parseInt(info[2]), 2);

    alert(`この行の情報:\n${year}/${month}/${day}@${lineNumber}`);
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
        // output = history.searchByDate(commandName);
        output = history.searchByDate(commandName);
    } else if (commandName == "/help") {

    } else if (commandName == "/random") {
        output = history.searchByRandom();
    } else if (commandName == "/search") {
        output = history.searchByKeyword(command[1]);
    } else {
        output = makeErrorMessage("command_error");
    }

    if (history.exists == false) {
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

function zeroPadding(number: number | String, length: number): string {
    const numberString = number.toString();
    if(numberString.length >= length) return numberString;
    return (Array(length).join('0') + numberString).slice(-length);
}

function runSearchByDate(date: string, id?: string): void {
    const outputField = document.getElementById("outputField");
    let result = runCommand(date, lineHistory);
    writeResult(result, outputField);

    if(id) {
        document.getElementById(id)?.scrollIntoView(true);
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
const outputField = document.getElementById("outputField");
const specialMessage = document.getElementById("specialMessage");
const nextDateButton = document.getElementById("nextDateButton");
const previousDateButton = document.getElementById("previousDateButton");
const currentDateField = document.getElementById("currentDateField") as HTMLInputElement;

let lineHistory = new LineHistory();

const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
let isLightMode = !mediaQuery.matches;

if (outputField?.innerHTML) {
    outputField.innerHTML = `
        <br>
        Welcome back<br>
        <br>
        `
}

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;
const day = today.getDate();
const yearDiff = year - 2022;

const monthString = zeroPadding(month, 2);
const dayString = zeroPadding(day, 2);
currentDateField.value = `${year}-${monthString}-${dayString}`;


// 特別な表示の処理 ///////////////////////////

// n周年記念日の表示
// 毎年2/10から2/16に表示
// const today = new Date(2023,2-1,13);

if (month == 2 && 10 <= day && day <= 16 && specialMessage) {
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
    specialMessage.innerHTML = `🎉${yearDiff}${ordinal} Anniv!`;
    specialMessage.style.display = "block"

}

// 新年の表示
if (month == 1 && day == 1 && specialMessage) {
    specialMessage.innerHTML = `HappyNewYear!`;
    specialMessage.style.display = "block"
}

//////////////////////////////////////////////////////


wordInputField?.addEventListener("keyup", (e) => {
    inputWord = (e.target as HTMLInputElement).value;
})

dateSubmitButton?.addEventListener("click", (e) => {
    let result = runCommand((dateInput as HTMLInputElement)?.value.replace(/-/g, "/"), lineHistory);
    writeResult(result, outputField);
})

wordSubmitButton?.addEventListener("click", (e) => {
    let result = runCommand(`/search ${inputWord}`, lineHistory);
    writeResult(result, outputField);
})

randomSubmitButton?.addEventListener("click", (e) => {
    let result = runCommand(`/random`, lineHistory);
    writeResult(result, outputField);
})

previousDateButton?.addEventListener("click", (e) => {
    let current = lineHistory.currentDate
    
    if(current != undefined){
        let date = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 1);
        let result = runCommand(date.toLocaleString().split(' ')[0], lineHistory);
        writeResult(result, outputField);
    }
});

nextDateButton?.addEventListener("click", (e) => {
    let current = lineHistory.currentDate

    if(current != undefined){
        let date = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
        let result = runCommand(date.toLocaleString().split(' ')[0], lineHistory);
        writeResult(result, outputField);
    }
});

currentDateField?.addEventListener("change", (e) => {
    let result = runCommand((currentDateField as HTMLInputElement)?.value.replace(/-/g, "/"), lineHistory);
    writeResult(result, outputField);
});

function writeResult(result: string, htmlElement?: HTMLElement | null): void {
    if (htmlElement?.innerHTML && result != "") {
        htmlElement.innerHTML = addAsterisk(result);
    }
    
    if(currentDateField){
        let currentDate = lineHistory.currentDate;
        if(currentDate != undefined){
            const month = zeroPadding(currentDate.getMonth() + 1, 2);
            const date = zeroPadding(currentDate.getDate(), 2);
            currentDateField.value = `${currentDate?.getFullYear()}-${month}-${date}`;
        } else {
            currentDateField.value = "";
        }
    }
}

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
