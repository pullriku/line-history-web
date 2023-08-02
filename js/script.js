"use strict";
/**
 * @fileoverview 履歴ファイルを読み込み、コマンドを実行するためのスクリプト
 * aa
 */
const RE_DATE = /^20\d{2}\/\d{1,2}\/\d{1,2}\(.+\)\r?$/g;
const RE_YEAR = /^20\d{2}/g;
const RE_MONTH_DAY = /\d{2}/g;
const RE_DATE_NO_WEEK = /^20\d{2}\/\d{1,2}\/\d{1,2}$/g;
/**
 * @classdesc 履歴ファイルを保持するクラス
 */
class LineHistory {
    constructor(data) {
        if (data != null) {
            this.historyData = data
                .replace(/\r/g, "")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .split("\n");
        }
        else {
            this.historyData = [];
        }
        this._dateIndices = this.calcDateIndices();
        this._dateArray = Object.keys(this.dateIndices);
        this.currentDate = undefined;
    }
    set currentDate(date) {
        this._currentDate = date;
    }
    get currentDate() {
        return this._currentDate != undefined
            ? new Date(this._currentDate)
            : undefined;
    }
    get dateIndices() {
        return this._dateIndices;
    }
    get dateArray() { return this._dateArray; }
    get exists() {
        return this.historyData != null
            && this.historyData != undefined
            && this.historyData.length != 0;
    }
    /**
     * 指定した日付の履歴を検索する
     * @param dateString 日付を表す文字列 yyyy/mm/dd
     * @returns 指定した日の履歴
     */
    searchByDate(dateString) {
        var _a;
        const dateInput = this.currentDate = generateDate(dateString);
        const localeString = dateInput.toLocaleDateString();
        let output = "";
        const startIndex = this.dateIndices[localeString];
        if (startIndex == undefined) {
            return "この日の履歴はありません。<br>";
        }
        const nextIndex = (_a = this.dateIndices[this.dateArray[this.dateArray.indexOf(localeString) + 1]]) !== null && _a !== void 0 ? _a : this.historyData.length;
        this.historyData.slice(startIndex, nextIndex).forEach((line, index) => {
            output += createLineWithTime(line, index, this.currentDate);
        });
        output += `${nextIndex - startIndex}行<br>`;
        return output;
    }
    searchByKeyword(keyword) {
        let counter = 0;
        let output = "";
        let date = new Date(1, 1, 1);
        let max_date = new Date(1970, 1, 1);
        let countStart = -1;
        if (keyword.length == 1) {
            output += "注意: 1文字検索は大量にヒットする可能性があり、リソースの消費量が多くなる可能性があります。<br><br>";
        }
        for (let i = 0; i < this.historyData.length; i++) {
            let line = this.historyData[i];
            if (RE_DATE.test(line)) {
                const dateTmp = generateDate(line.substring(0, 10));
                if (dateTmp.getTime() >= max_date.getTime()) {
                    date = generateDate(line.substring(0, 10));
                    max_date = date;
                    countStart = i;
                }
            }
            else if (line.search(keyword) != -1) {
                counter++;
                if (/\d{2}:\d{2}.*/.test(line)) {
                    line = line.substring(6);
                }
                if (line.length >= 60) {
                    line = `${line.substring(0, 60)}...`;
                }
                const lineNum = i - countStart;
                const year = date.getFullYear();
                const month = zeroPadding(date.getMonth() + 1, 2);
                const day = zeroPadding(date.getDate(), 2);
                const dateString = `${year}/${month}/${day}`;
                output += `<a href="javascript:runSearchByDate('${dateString}', '${lineNum}');" id="dateLink"><spam style="font-weight: bold;">${dateString}@${lineNum}</spam></a> ${line} <br>`;
            }
        }
        output = output == "" ? "見つかりませんでした。" : output;
        this.currentDate = undefined;
        return `<h3 style="display:inline">${counter}件</h3><br><br>${output}`;
    }
    searchByRandom() {
        const dates = Object.keys(this.dateIndices);
        const randomDate = dates[Math.floor(Math.random() * dates.length)];
        const dateString = generateDate(randomDate).toLocaleDateString();
        return this.searchByDate(dateString);
    }
    calcDateIndices() {
        const result = {};
        let current = new Date(1, 1, 1);
        this.historyData.forEach((line, index) => {
            if (RE_DATE.test(line)) {
                const dateTmp = generateDate(line.substring(0, 10));
                if (dateTmp.getTime() >= current.getTime()) {
                    current = dateTmp;
                    result[dateTmp.toLocaleDateString()] = index;
                }
            }
        });
        return result;
    }
}
function createLineWithTime(line, lineNum, currentDate) {
    const lineInfo = line.split("\t");
    if (lineInfo.length >= 2) {
        lineInfo[0] = `
            <a href="javascript:showLineInfoAlert('${currentDate === null || currentDate === void 0 ? void 0 : currentDate.toLocaleDateString()}',${lineNum});">
                ${lineInfo[0]}
            </a>
        `;
    }
    return `<span id="${lineNum}">${lineInfo.join("\t")}</span><br>`;
}
function checkDate(year = 1970, month = 1, day = 1) {
    return year >= 1970
        && 1 <= month && month <= 12
        && 1 <= day && day <= 31;
}
function generateDate(dateString) {
    const splitDate = dateString.split("/");
    let result;
    if (splitDate.length != 3) {
        result = new Date(1970, 1, 1);
    }
    else {
        const year = parseInt(splitDate[0]);
        const month = parseInt(splitDate[1]);
        const day = parseInt(splitDate[2]);
        if (checkDate(year, month, day)) {
            result = new Date(year, month - 1, day);
        }
        else {
            result = new Date(1970, 1, 1);
        }
    }
    return result;
}
function getRandom(n, m) {
    return Math.floor(Math.random() * (m + 1 - n)) + n;
}
function addAsterisk(message) {
    let result = "";
    message.split("<br>").forEach((line) => {
        result += `＊${line}<br>`;
    });
    return result;
}
function showLineInfoAlert(date, lineNumber) {
    const info = date.split("/").slice(0, 3);
    const year = Number.parseInt(info[0]);
    const month = zeroPadding(Number.parseInt(info[1]), 2);
    const day = zeroPadding(Number.parseInt(info[2]), 2);
    alert(`この行の情報:\n${year}/${month}/${day}@${lineNumber}`);
}
function runCommand(command_, history) {
    if (history == undefined || history.exists == false) {
        return "⚠️履歴ファイルを選択してください。";
    }
    const command = command_.split(" ");
    if (command.length < 5) {
        for (let i = 0; i < 5 - command.length; i++) {
            command.push("");
        }
    }
    const commandName = command[0];
    let output = "";
    if (/^20\d{2}\/\d{1,2}\/\d{1,2}$/.test(commandName)) {
        output = history.searchByDate(commandName);
    }
    else if (commandName == "/help") {
    }
    else if (commandName == "/random") {
        output = history.searchByRandom();
    }
    else if (commandName == "/search") {
        output = history.searchByKeyword(command[1]);
    }
    else {
        output = makeErrorMessage("command_error");
    }
    return output;
}
function makeErrorMessage(message) {
    let result = "コマンドエラーが発生しました。";
    if (message != "") {
        result += `type: ${message}`;
    }
    return result;
}
function zeroPadding(number, length) {
    const numberString = number.toString();
    if (numberString.length >= length)
        return numberString;
    return (Array(length).join('0') + numberString).slice(-length);
}
function runSearchByDate(date, id) {
    var _a;
    const outputField = document.getElementById("outputField");
    const result = runCommand(date, lineHistory);
    writeResult(result, outputField);
    if (id != undefined) {
        (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.scrollIntoView(true);
    }
}
const wordInputField = document.getElementById("wordInput");
const wordSubmitButton = document.getElementById("wordSubmitButton");
const outputField = document.getElementById("outputField");
const specialMessage = document.getElementById("specialMessage");
const currentDateField = document.getElementById("currentDateField");
let lineHistory;
function writeResult(result, htmlElement) {
    if ((htmlElement === null || htmlElement === void 0 ? void 0 : htmlElement.innerHTML) && result != "") {
        htmlElement.innerHTML = addAsterisk(result);
    }
    if (currentDateField) {
        const currentDate = lineHistory.currentDate;
        if (currentDate != undefined) {
            const month = zeroPadding(currentDate.getMonth() + 1, 2);
            const date = zeroPadding(currentDate.getDate(), 2);
            currentDateField.value = `${currentDate === null || currentDate === void 0 ? void 0 : currentDate.getFullYear()}-${month}-${date}`;
        }
        else {
            currentDateField.value = "";
        }
    }
}
function initOutputField() {
    if (outputField === null || outputField === void 0 ? void 0 : outputField.innerHTML) {
        outputField.innerHTML = `
            <br>
            Welcome back<br>
            <br>
            `;
    }
}
function initCurrentDateField() {
    const today = new Date();
    const monthString = zeroPadding(today.getMonth() + 1, 2);
    const dayString = zeroPadding(today.getDate(), 2);
    currentDateField.value = `${today.getFullYear()}-${monthString}-${dayString}`;
}
/**
 * @description 特別なメッセージを表示する
 */
function drawSpecialMessageIfNeeded() {
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
function initEventListeners() {
    const fileField = document.getElementById("file");
    fileField === null || fileField === void 0 ? void 0 : fileField.addEventListener("change", (e) => {
        var _a, _b;
        let file = (_b = (_a = e.target) === null || _a === void 0 ? void 0 : _a.files) !== null && _b !== void 0 ? _b : new FileList();
        let reader = new FileReader();
        reader.readAsText(file[0]);
        reader.onload = (e) => {
            var _a;
            let text = (_a = reader.result) !== null && _a !== void 0 ? _a : "";
            if (typeof text == "string") {
                lineHistory = new LineHistory(text);
            }
        };
    }, false);
    wordSubmitButton === null || wordSubmitButton === void 0 ? void 0 : wordSubmitButton.addEventListener("click", () => {
        const inputWord = wordInputField === null || wordInputField === void 0 ? void 0 : wordInputField.value;
        const result = runCommand(`/search ${inputWord}`, lineHistory);
        writeResult(result, outputField);
    });
    wordInputField === null || wordInputField === void 0 ? void 0 : wordInputField.addEventListener("keyup", (e) => {
        if (e.key == "Enter")
            wordSubmitButton === null || wordSubmitButton === void 0 ? void 0 : wordSubmitButton.dispatchEvent(new Event("click"));
    });
    const randomSubmitButton = document.getElementById("randomSubmitButton");
    randomSubmitButton === null || randomSubmitButton === void 0 ? void 0 : randomSubmitButton.addEventListener("click", (e) => {
        const result = runCommand(`/random`, lineHistory);
        writeResult(result, outputField);
    });
    const previousDateButton = document.getElementById("previousDateButton");
    previousDateButton === null || previousDateButton === void 0 ? void 0 : previousDateButton.addEventListener("click", (e) => {
        const current = lineHistory.currentDate;
        if (current != undefined) {
            const date = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 1);
            const result = runCommand(date.toLocaleString().split(' ')[0], lineHistory);
            writeResult(result, outputField);
        }
    });
    const nextDateButton = document.getElementById("nextDateButton");
    nextDateButton === null || nextDateButton === void 0 ? void 0 : nextDateButton.addEventListener("click", (e) => {
        const current = lineHistory.currentDate;
        if (current != undefined) {
            const date = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
            const result = runCommand(date.toLocaleString().split(' ')[0], lineHistory);
            writeResult(result, outputField);
        }
    });
    currentDateField === null || currentDateField === void 0 ? void 0 : currentDateField.addEventListener("change", (e) => {
        const result = runCommand(currentDateField === null || currentDateField === void 0 ? void 0 : currentDateField.value.replace(/-/g, "/"), lineHistory);
        writeResult(result, outputField);
    });
}
drawSpecialMessageIfNeeded();
initCurrentDateField();
initEventListeners();
initOutputField();
