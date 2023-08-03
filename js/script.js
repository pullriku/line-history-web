/**
 * @fileoverview 履歴ファイルを読み込み、コマンドを実行するためのスクリプト
 * aa
 */
import * as utl from "./utils.js";
import * as his from "./history.js";
const outputField = document.getElementById("outputField");
const currentDateField = document.getElementById("currentDateField");
// let lineHistory: his.LineHistory;
let lineHistory;
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
        const file = e.target?.files ?? new FileList();
        const reader = new FileReader();
        reader.readAsText(file[0]);
        reader.onload = (e) => {
            const text = reader.result ?? "";
            if (typeof text == "string") {
                // lineHistory = new his.LineHistory(text)
                lineHistory = his.newLineHistory(text);
            }
        };
    }, false);
    const wordInputField = document.getElementById("wordInput");
    const wordSubmitButton = document.getElementById("wordSubmitButton");
    wordSubmitButton?.addEventListener("click", () => {
        const inputWord = wordInputField?.value;
        drawErrorMessageIfNeeded();
        // const result = lineHistory.searchByKeyword(inputWord);
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
        // const result = lineHistory.searchByRandom();
        const result = his.searchByRandom(lineHistory);
        writeResult(result, outputField);
    });
    const previousDateButton = document.getElementById("previousDateButton");
    previousDateButton?.addEventListener("click", () => {
        // const current = lineHistory.currentDate
        const current = his.currentDate;
        if (current != undefined) {
            const date = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 1);
            drawErrorMessageIfNeeded();
            // const result = lineHistory.searchByDate(date.toLocaleString().split(' ')[0]);
            const result = his.searchByDate(lineHistory, date.toLocaleString().split(' ')[0]);
            writeResult(result, outputField);
        }
    });
    const nextDateButton = document.getElementById("nextDateButton");
    nextDateButton?.addEventListener("click", () => {
        // const current = lineHistory.currentDate
        const current = his.currentDate;
        if (current != undefined) {
            const date = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
            drawErrorMessageIfNeeded();
            // const result = lineHistory.searchByDate(date.toLocaleString().split(' ')[0]);
            const result = his.searchByDate(lineHistory, date.toLocaleString().split(' ')[0]);
            writeResult(result, outputField);
        }
    });
    currentDateField?.addEventListener("change", () => {
        drawErrorMessageIfNeeded();
        // const result = lineHistory.searchByDate(currentDateField?.value.replace(/-/g, "/"));
        const result = his.searchByDate(lineHistory, currentDateField?.value.replace(/-/g, "/"));
        writeResult(result, outputField);
    });
}
function initGlobalFunctions() {
    window.runSearchByDate = (date, id) => {
        const outputField = document.getElementById("outputField");
        drawErrorMessageIfNeeded();
        // const result = lineHistory.searchByDate(date);
        const result = his.searchByDate(lineHistory, date);
        writeResult(result, outputField);
        if (id != undefined) {
            document.getElementById(id)?.scrollIntoView(true);
        }
    };
    window.showLineInfoAlert = (date, lineNumber) => {
        const info = date.split("/").slice(0, 3);
        const year = Number.parseInt(info[0]);
        const month = utl.zeroPadding(Number.parseInt(info[1]), 2);
        const day = utl.zeroPadding(Number.parseInt(info[2]), 2);
        alert(`この行の情報:\n${year}/${month}/${day}@${lineNumber}`);
    };
}
function initOutputField() {
    if (outputField?.innerHTML) {
        outputField.innerHTML = `
            <br>
            Welcome back<br>
            <br>
            `;
    }
}
function initCurrentDateField() {
    const today = new Date();
    const monthString = utl.zeroPadding(today.getMonth() + 1, 2);
    const dayString = utl.zeroPadding(today.getDate(), 2);
    currentDateField.value = `${today.getFullYear()}-${monthString}-${dayString}`;
}
/**
 * @description 特別なメッセージを表示する
 */
function initSpecialMessageIfNeeded() {
    const specialMessage = document.getElementById("specialMessage");
    // n周年記念日の表示
    // 毎年2/10から2/16に表示
    // const today = new Date(2023,2-1,13);
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const yearDiff = year - 2022;
    if (month == 2 && 10 <= day && day <= 16 && specialMessage) {
        let ordinal; // 序数詞
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
        specialMessage.style.display = "block";
    }
    // 新年の表示
    if (month == 1 && day == 1 && specialMessage) {
        specialMessage.innerHTML = `HappyNewYear!`;
        specialMessage.style.display = "block";
    }
}
function drawErrorMessageIfNeeded() {
    // if (lineHistory == undefined || lineHistory.exists == false) {
    //     outputField.innerHTML = "⚠️履歴ファイルを選択してください。";
    // }
    if (lineHistory == undefined || his.lineHistoryExists(lineHistory) == false) {
        outputField.innerHTML = "⚠️履歴ファイルを選択してください。";
    }
}
function writeResult(result, htmlElement) {
    const addAsterisk = (message) => {
        let result = "";
        message.split("<br>").forEach((line) => {
            result += `＊${line}<br>`;
        });
        return result;
    };
    if (htmlElement?.innerHTML && result != "") {
        htmlElement.innerHTML = addAsterisk(result);
    }
    if (currentDateField) {
        // const currentDate = lineHistory.currentDate;
        const currentDate = his.currentDate;
        if (currentDate != undefined) {
            const month = utl.zeroPadding(currentDate.getMonth() + 1, 2);
            const date = utl.zeroPadding(currentDate.getDate(), 2);
            currentDateField.value = `${currentDate?.getFullYear()}-${month}-${date}`;
        }
        else {
            currentDateField.value = "";
        }
    }
}
