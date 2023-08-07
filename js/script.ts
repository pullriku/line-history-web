/**
 * @fileoverview 履歴ファイルを読み込み、コマンドを実行するためのスクリプト
 * aa
 */

import * as utl from "./utils.js";
import * as his from "./history.js";


const outputField = document.getElementById("outputField") as HTMLElement;
const currentDateField = document.getElementById("currentDateField") as HTMLInputElement;
let lineHistory: his.LineHistory;
main();


function main() {
    initEventListeners();
    initGlobalFunctions();
    initSpecialMessageIfNeeded();
    initCurrentDateField();
    initOutputField();
}

function initEventListeners() {
    const fileField = document.getElementById("file");
    fileField?.addEventListener("change", (e) => {
        const file = (e.target as HTMLInputElement)?.files ?? new FileList();
        const reader = new FileReader();
        reader.readAsText(file[0]);
    
        reader.onload = (e) => {
            const text = reader.result ?? "";
            if (typeof text == "string") {
                lineHistory = his.newLineHistory(text);
            }
    
        }
    }, false);
    
    const wordInputField = document.getElementById("wordInput");
    const wordSubmitButton = document.getElementById("wordSubmitButton");
    wordSubmitButton?.addEventListener("click", () => {
        const inputWord = (wordInputField as HTMLInputElement)?.value;
        drawErrorMessageIfNeeded();
        const result = his.searchByKeyword(lineHistory, inputWord);
        writeResult(result, outputField);
    });
    
    wordInputField?.addEventListener("keyup", (e) => {
        if (e.key == "Enter")
            wordSubmitButton?.dispatchEvent(new Event("click"));
    });
    
    const randomSubmitButton = document.getElementById("randomSubmitButton");
    randomSubmitButton?.addEventListener("click", () => {
        drawErrorMessageIfNeeded();
        const result = his.searchByRandom(lineHistory);
        writeResult(result, outputField);
    });
    
    const previousDateButton = document.getElementById("previousDateButton");
    previousDateButton?.addEventListener("click", () => {
        const current = his.currentDate;
        
        if(current != undefined){
            const date = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 1);
            drawErrorMessageIfNeeded();
            const result = his.searchByDate(lineHistory, date.toLocaleString().split(' ')[0]);
            writeResult(result, outputField);
        }
    });
    
    const nextDateButton = document.getElementById("nextDateButton");
    nextDateButton?.addEventListener("click", () => {
        const current = his.currentDate;
    
        if(current != undefined){
            const date = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
            drawErrorMessageIfNeeded();
            const result = his.searchByDate(lineHistory, date.toLocaleString().split(' ')[0]);
            writeResult(result, outputField);
        }
    });
    
    currentDateField?.addEventListener("change", () => {
        drawErrorMessageIfNeeded();
        const result = his.searchByDate(lineHistory, currentDateField?.value.replace(/-/g, "/"));
        writeResult(result, outputField);
    });
}

declare global {
    interface Window {
        runSearchByDate: Function;
        showLineInfoAlert: Function;
    }
}

function initGlobalFunctions() {
    window.runSearchByDate = (date: string, id?: string): void => {
        const outputField = document.getElementById("outputField") as HTMLElement;
        drawErrorMessageIfNeeded();
        const result = his.searchByDate(lineHistory, date);
        writeResult(result, outputField);
    
        if(id == undefined) return;
        document.getElementById(id)?.scrollIntoView(true);
    };
    
    window.showLineInfoAlert = (date: string, lineNumber: number): void => {
        const info = date
            .split("/")
            .slice(0, 3)
            .map((value) => parseInt(value))
            .map(value => utl.zeroPadding(value, 2));
    
        alert(`この行の情報:\n${info[0]}/${info[1]}/${info[2]}@${lineNumber}`);
    };
}

function initOutputField() {
    if(outputField?.innerHTML == undefined) return;
    outputField.innerHTML = `
        <br>
        Welcome back<br>
        <br>
    `;
}

function initCurrentDateField() {
    const ymd = utl.newYMDString(new Date());
    currentDateField.value = `${ymd.year}-${ymd.month}-${ymd.day}`;
}

/**
 * @description 特別なメッセージを表示する
 */
function initSpecialMessageIfNeeded() {
    const specialMessage = document.getElementById("specialMessage");
    if (specialMessage == undefined) return;
    specialMessage.style.display = "block";

    /*
    n周年記念日の表示
    毎年2/10から2/16に表示
    */
//    const today = new Date(2020,1-1,1);
    const today = new Date();
    const ymd = utl.newYMDInt(today);
    const year = ymd.year;
    const month = ymd.month;
    const day = ymd.day;
    const yearDiff = year - 2022;

    let message = "";
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
    } else if (month == 1 && day <= 2 && day <= 3) {
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
    } else if (month == 6 && day <= 21 && day <= 22) {
        message = "☀️"; // 夏至
    } else if (month == 7 && day == 7) {
        message = "🎋🌠";
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
    } else if (month == 12 && day <= 21 && day <= 22) {
        message = "🌉🌙"; // 冬至
    } else if (month == 12 && day == 25) {
        message = "🎄🎁";
    } else if (month == 12 && day <= 26 && day <= 31) {
        message = "今年もありがとうございました";
    } else {
        specialMessage.style.display = "none";
    }
    specialMessage.innerHTML = message;
}

function drawErrorMessageIfNeeded() {
    if (lineHistory == undefined || his.lineHistoryExists(lineHistory) == false) {
        outputField.innerHTML = "⚠️履歴ファイルを選択してください。";
    }
}

function writeResult(result: string, htmlElement: HTMLElement): void {
    const addAsterisk = (message: string): string => {
        let result = "";
        message.split("<br>").forEach((line) => {
            result += `＊${line}<br>`;
        });
        return result;
    };

    if (htmlElement?.innerHTML && result != "") {
        htmlElement.innerHTML = addAsterisk(result);
    }

    const currentDate = his.currentDate;
    if (currentDate == undefined) {
        currentDateField.value = "";
        return;
    }

    const ymd = utl.newYMDString(currentDate);
    currentDateField.value = `${ymd.year}-${ymd.month}-${ymd.day}`;
}