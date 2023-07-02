"use strict";
class Patterns {
    constructor() { }
}
Patterns.DATE = /^20\d{2}\/\d{1,2}\/\d{1,2}\(.+\)\r?$/g;
Patterns.YEAR = /^20\d{2}/g;
Patterns.MONTH_DAY = /\d{2}/g;
Patterns.DATE_NO_WEEK = /^20\d{2}\/\d{1,2}\/\d{1,2}$/g;
class LineHistory {
    constructor(data) {
        if (data != null) {
            this.historyData = data.replace(/\r/g, "").split("\n");
        }
        else {
            this.historyData = [];
        }
        this._currentDate = undefined;
    }
    get currentDate() {
        return this._currentDate != undefined
            ? new Date(this._currentDate)
            : undefined;
    }
    get isExist() {
        return this.historyData != null
            && this.historyData != undefined
            && this.historyData.length != 0;
    }
    searchByDate(dateString) {
        var _a;
        let dateInput = this.generateDate(dateString);
        let countStart = -1;
        let countStop = -1;
        let countFlag = false;
        let output = "";
        for (let i = 0; i < this.historyData.length; i++) {
            let line = this.historyData[i];
            if (Patterns.DATE.test(line)) {
                let dateTmp = this.generateDate(line.substring(0, 10));
                if (dateTmp.getTime() == dateInput.getTime()) {
                    countStart = i;
                    countFlag = true;
                    output += `${line}<br>`;
                    this._currentDate = dateTmp;
                }
                else if (countFlag && dateInput.getTime() < dateTmp.getTime()) {
                    countStop = i;
                    break;
                }
            }
            else if (countFlag) {
                let lineInfo = line.split("\t");
                let lineNum = i - countStart;
                if (lineInfo.length >= 2) {
                    lineInfo[0] = `<a href="javascript:showLineInfoAlert('${(_a = this._currentDate) === null || _a === void 0 ? void 0 : _a.toLocaleDateString()}',${lineNum});">${lineInfo[0]}</a>`;
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
        }
        else {
            output += `${countStop - countStart}行<br>`;
        }
        return output;
    }
    searchByKeyword(keyword) {
        let counter = 0;
        let output = "";
        let date = new Date(1, 1, 1);
        let max_date = new Date(1970, 1, 1);
        let countStart = -1;
        if (keyword.length == 1) {
            output += "注意: 1文字検索は大量にヒットする可能性があり、リソースの消費量が多くなる可能性があります。\n";
        }
        for (let i = 0; i < this.historyData.length; i++) {
            let line = this.historyData[i];
            if (Patterns.DATE.test(line)) {
                if (this.generateDate(line.substring(0, 10)).getTime() >= max_date.getTime()) {
                    date = this.generateDate(line.substring(0, 10));
                    max_date = date;
                    countStart = i;
                }
            }
            else {
                if (line.search(keyword) != -1) {
                    counter++;
                    if (/\d{2}:\d{2}.*/.test(line)) {
                        line = line.substring(6);
                    }
                    if (line.length >= 60) {
                        line = `${line.substring(0, 60)}...`;
                    }
                    let lineNum = i - countStart;
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
    searchByRandom(tries = 1000) {
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
        let isFound = false;
        while (isFound == false && tries > 0) {
            let randomNum = this.getRandom(first, today);
            let date = new Date(randomNum);
            result = this.searchByDate(`${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`);
            if (result.search("この日の履歴はありません") == -1) {
                isFound = true;
            }
            tries--;
        }
        if (tries == 0)
            result = "見つかりませんでした。";
        return result;
    }
    getRandom(n, m) {
        let num = Math.floor(Math.random() * (m + 1 - n)) + n;
        return num;
    }
    generateDate(dateString) {
        const splitDate = dateString.split("/");
        let result;
        if (splitDate.length != 3) {
            result = new Date(1970, 1, 1);
        }
        else {
            const year = parseInt(splitDate[0]);
            const month = parseInt(splitDate[1]);
            const day = parseInt(splitDate[2]);
            if (this.checkDate(year, month, day)) {
                result = new Date(year, month - 1, day);
            }
            else {
                result = new Date(1970, 1, 1);
            }
        }
        return result;
    }
    checkDate(year = 1970, month = 1, day = 1) {
        return year > 0
            && 0 < month
            && month < 13
            && 0 < day
            && day < 32;
    }
}
function addAsterisk(message) {
    let result = "";
    let inputSplitted = message.split("<br>");
    for (let i = 0; i < inputSplitted.length; i++) {
        let line = inputSplitted[i];
        result += `＊${line}<br>`;
    }
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
    let command = command_.split(" ");
    if (command.length < 5) {
        for (let i = 0; i < 5 - command.length; i++) {
            command.push("");
        }
    }
    let commandName = command[0];
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
    if (history.isExist == false) {
        output = "⚠️履歴ファイルを選択してください。";
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
    let result = runCommand(date, lineHistory);
    writeResult(result, outputField);
    if (id) {
        (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.scrollIntoView(true);
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
const nextDateButton = document.getElementById("nextDateButton");
const previousDateButton = document.getElementById("previousDateButton");
const currentDateField = document.getElementById("currentDateField");
let lineHistory = new LineHistory();
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
let isLightMode = !mediaQuery.matches;
setManualDisplayMode(isLightMode);
if (outputField === null || outputField === void 0 ? void 0 : outputField.innerHTML) {
    outputField.innerHTML = `
        <br>
        Welcome back<br>
        <br>
        `;
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
//////////////////////////////////////////////////////
wordInputField === null || wordInputField === void 0 ? void 0 : wordInputField.addEventListener("keyup", (e) => {
    inputWord = e.target.value;
});
dateSubmitButton === null || dateSubmitButton === void 0 ? void 0 : dateSubmitButton.addEventListener("click", (e) => {
    let result = runCommand(dateInput === null || dateInput === void 0 ? void 0 : dateInput.value.replace(/-/g, "/"), lineHistory);
    writeResult(result, outputField);
});
wordSubmitButton === null || wordSubmitButton === void 0 ? void 0 : wordSubmitButton.addEventListener("click", (e) => {
    let result = runCommand(`/search ${inputWord}`, lineHistory);
    writeResult(result, outputField);
});
randomSubmitButton === null || randomSubmitButton === void 0 ? void 0 : randomSubmitButton.addEventListener("click", (e) => {
    let result = runCommand(`/random`, lineHistory);
    writeResult(result, outputField);
});
previousDateButton === null || previousDateButton === void 0 ? void 0 : previousDateButton.addEventListener("click", (e) => {
    let current = lineHistory.currentDate;
    if (current != undefined) {
        let date = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 1);
        let result = runCommand(date.toLocaleString().split(' ')[0], lineHistory);
        writeResult(result, outputField);
    }
});
nextDateButton === null || nextDateButton === void 0 ? void 0 : nextDateButton.addEventListener("click", (e) => {
    let current = lineHistory.currentDate;
    if (current != undefined) {
        let date = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
        let result = runCommand(date.toLocaleString().split(' ')[0], lineHistory);
        writeResult(result, outputField);
    }
});
currentDateField === null || currentDateField === void 0 ? void 0 : currentDateField.addEventListener("change", (e) => {
    let result = runCommand(currentDateField === null || currentDateField === void 0 ? void 0 : currentDateField.value.replace(/-/g, "/"), lineHistory);
    writeResult(result, outputField);
});
function writeResult(result, htmlElement) {
    if ((htmlElement === null || htmlElement === void 0 ? void 0 : htmlElement.innerHTML) && result != "") {
        htmlElement.innerHTML = addAsterisk(result);
    }
    if (currentDateField) {
        let currentDate = lineHistory.currentDate;
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
let file;
let text;
fileField === null || fileField === void 0 ? void 0 : fileField.addEventListener("change", (e) => {
    var _a, _b;
    file = (_b = (_a = e.target) === null || _a === void 0 ? void 0 : _a.files) !== null && _b !== void 0 ? _b : new FileList();
    let reader = new FileReader();
    reader.readAsText(file[0]);
    reader.onload = (e) => {
        var _a;
        text = (_a = reader.result) !== null && _a !== void 0 ? _a : "";
        if (typeof text == "string") {
            lineHistory = new LineHistory(text);
        }
    };
}, false);
displayModeSwitch === null || displayModeSwitch === void 0 ? void 0 : displayModeSwitch.addEventListener("click", () => {
    isLightMode = !isLightMode;
    setManualDisplayMode(isLightMode);
});
function setManualDisplayMode(isLightMode) {
    if (displayModeSwitch != null) {
        if (isLightMode) {
            document.documentElement.setAttribute("theme", "light");
            displayModeSwitch.innerHTML = "🌚<br>ダーク";
        }
        else {
            document.documentElement.setAttribute("theme", "dark");
            displayModeSwitch.innerHTML = "🌝<br>ライト";
        }
    }
}
