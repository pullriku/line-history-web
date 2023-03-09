"use strict";
let historyData = [];
const DATE_PATTERN = /^20\d{2}\/\d{1,2}\/\d{1,2}\(.+\)\r?$/g;
const YEAR_PATTERN = /^20\d{2}/g;
const MONTH_DAY_PATTERN = /\d{2}/g;
function runCommand(command_) {
    let command = command_.split(" ");
    if (command.length < 5) {
        for (let i = 0; i < 5 - command.length; i++) {
            command.push("");
        }
    }
    let commandName = command[0];
    let output = "";
    console.log(command);
    if (/^20\d{2}\/\d{1,2}\/\d{1,2}$/.test(commandName)) {
        output = searchByDate(commandName);
    }
    else if (commandName == "/help") {
    }
    else if (commandName == "/random") {
    }
    else if (commandName == "/search") {
        output = searchByKeyword(command[1]);
    }
    else {
        output = makeErrorMessage("command_error");
    }
    if (historyData.length == 0) {
        output = "⚠️履歴ファイルを選択してください。";
    }
    return output;
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
function checkDate(year = 1970, month = 1, day = 1) {
    return year > 0
        && 0 < month && month < 13
        && 0 < day && day < 32;
}
function searchByDate(dateString) {
    const dateInput = generateDate(dateString);
    let countStart = -1;
    let countStop = -1;
    let countFlag = false;
    let output = "";
    for (let i = 0; i < historyData.length; i++) {
        let line = historyData[i];
        if (DATE_PATTERN.test(line)) {
            let dateTmp = generateDate(line.substring(0, 10));
            if (dateTmp.getTime() == dateInput.getTime()) {
                countStart = i;
                countFlag = true;
                output += `${line}<br>`;
            }
            else if (countFlag && dateInput.getTime() < dateTmp.getTime()) {
                countStop = i;
                break;
            }
        }
        else if (countFlag) {
            output += `${line}<br>`;
            if (i == historyData.length - 1) {
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
function searchByKeyword(keyword) {
    let counter = 0;
    let output = "";
    let date = new Date(1, 1, 1);
    let max_date = new Date(1970, 1, 1);
    if (keyword.length > 1) {
        for (let i = 0; i < historyData.length; i++) {
            let line = historyData[i];
            if (DATE_PATTERN.test(line)) {
                if (generateDate(line.substring(0, 10)).getTime() >= max_date.getTime()) {
                    date = generateDate(line.substring(0, 10));
                    max_date = date;
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
                    let spaceRemoveCounter = 0;
                    if (date.getMonth() <= 8)
                        spaceRemoveCounter++;
                    if (date.getDate() <= 9)
                        spaceRemoveCounter++;
                    let outputElement = `${date.toLocaleDateString("ja-jp").substring(0, 10 - spaceRemoveCounter).replace(/-/g, "/")}`;
                    output += `<a href="javascript:runSearchByDate('${outputElement}');" id="dateLink"><spam style="font-weight: bold;">` + outputElement + `</spam></a> ${line}<br>`;
                }
            }
        }
    }
    if (output == "") {
        output = "見つかりませんでした。";
    }
    return `${counter}件<br><br>${output}`;
}
function getRandom(n, m) {
    let num = Math.floor(Math.random() * (m + 1 - n)) + n;
    return num;
}
function searchByRandom() {
    const today = new Date().getTime();
    let first = 0;
    for (let i = 0; i < historyData.length; i++) {
        let line = historyData[i];
        if (DATE_PATTERN.test(line)) {
            first = generateDate(line.substring(0, 10)).getTime();
            break;
        }
    }
    let result = "この日の履歴はありません";
    while (result.indexOf("この日の履歴はありません") != -1) {
        let randomNum = getRandom(first, today);
        let date = new Date(randomNum);
        result = searchByDate(`${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`);
    }
    return result;
}
function searchByRandom2() {
    const today = new Date().getTime();
    let first = 0;
    for (let i = 0; i < historyData.length; i++) {
        let line = historyData[i];
        if (DATE_PATTERN.test(line)) {
            // Assuming generateDate is a separate function that returns a Date object
            first = generateDate(line.substring(0, 10)).getTime();
            break;
        }
    }
    let result = "この日の履歴はありません";
    let foundData = false;
    while (!foundData) {
        let randomNum = getRandom(first, today);
        let date = new Date(randomNum);
        // Assuming searchByDate is a separate function that takes a date string and returns data
        result = searchByDate(`${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`);
        if (result !== "この日の履歴はありません") {
            foundData = true;
        }
    }
    return result;
}
function makeErrorMessage(message) {
    let result = "コマンドエラーが発生しました。";
    if (message != "") {
        result += `type: ${message}`;
    }
    return result;
}
function addAsterisk(message) {
    let result = "";
    let inputSplited = message.split("<br>");
    for (let i = 0; i < inputSplited.length; i++) {
        let line = inputSplited[i];
        result += `＊${line}<br>`;
    }
    return result;
}
function runSearchByDate(date) {
    console.log(date);
    const outputField = document.getElementById("outputField");
    let result = runCommand(date);
    if ((outputField === null || outputField === void 0 ? void 0 : outputField.innerHTML) && result != "") {
        outputField.innerHTML = addAsterisk(result);
    }
}
function main() {
    const title = document.getElementById("title");
    const fileField = document.getElementById("file");
    const dateInput = document.getElementById("dateTimeInput");
    const dateSubmitButton = document.getElementById("dateSubmitButton");
    const wordInputField = document.getElementById("wordInput");
    let inputWord = "";
    const wordSubmitButton = document.getElementById("wordSubmitButton");
    const displayModeSwitch = document.getElementById("displayModeSwitch");
    const outputField = document.getElementById("outputField");
    const specialMessage = document.getElementById("specialMessage");
    const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    let isLightMode = !darkModeMediaQuery.matches;
    setDisplayMode(isLightMode);
    darkModeMediaQuery.addEventListener("change", (e) => {
        isLightMode = !e.matches;
        setDisplayMode(isLightMode);
    });
    if (outputField === null || outputField === void 0 ? void 0 : outputField.innerHTML) {
        outputField.innerHTML = `
        <br>
        Welcome back<br>
        <br>
        `;
    }
    // 特別な表示の処理
    // 毎年2/10から2/16に表示
    // const today = new Date(2023,2-1,13);
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const yearDiff = year - 2022;
    let ordinal; // 序数詞
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
        // title.innerHTML += `<span id="specialMessage">🎉${yearDiff}${ordinal} Anniv!</span>`;
        specialMessage.innerHTML = `🎉${yearDiff}${ordinal} Anniv!`;
        specialMessage.style.display = "block";
    }
    if (month == 1 && day == 1 && specialMessage) {
        // title.innerHTML += `<span id="specialMessage">HappyNewYear!</span>`
        specialMessage.innerHTML = `HappyNewYear!`;
        specialMessage.style.display = "block";
    }
    wordInputField === null || wordInputField === void 0 ? void 0 : wordInputField.addEventListener("keyup", (e) => {
        inputWord = e.target.value;
    });
    dateSubmitButton === null || dateSubmitButton === void 0 ? void 0 : dateSubmitButton.addEventListener("click", (e) => {
        let result = runCommand(dateInput === null || dateInput === void 0 ? void 0 : dateInput.value.replace(/-/g, "/"));
        if ((outputField === null || outputField === void 0 ? void 0 : outputField.innerHTML) && result != "") {
            outputField.innerHTML = addAsterisk(result);
        }
    });
    wordSubmitButton === null || wordSubmitButton === void 0 ? void 0 : wordSubmitButton.addEventListener("click", (e) => {
        let result = runCommand(`/search ${inputWord}`);
        if ((outputField === null || outputField === void 0 ? void 0 : outputField.innerHTML) && result != "") {
            outputField.innerHTML = addAsterisk(result);
        }
    });
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
                historyData = text.replace(/\r/, "").split("\n");
            }
        };
    }, false);
    displayModeSwitch === null || displayModeSwitch === void 0 ? void 0 : displayModeSwitch.addEventListener("click", () => {
        isLightMode = !isLightMode;
        setDisplayMode(isLightMode);
    });
    function setDisplayMode(isLightMode) {
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
}
main();
