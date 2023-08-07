import * as utl from "./utils.js";
const RE_DATE = /^20\d{2}\/\d{1,2}\/\d{1,2}\(.+\)\r?$/g;
const RE_YEAR = /^20\d{2}/g;
const RE_MONTH_DAY = /\d{2}/g;
const RE_DATE_NO_WEEK = /^20\d{2}\/\d{1,2}\/\d{1,2}$/g;
const RE_TIME = /^(\d{2}):(\d{2}).*/;
export let currentDate;
export function newLineHistory(data) {
    const _data = data
        .replace(/\r/g, "")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .split("\n");
    const indices = calcDateIndices(_data);
    return {
        historyData: _data,
        dateIndices: indices,
        dateArray: Object.keys(indices),
    };
}
export function lineHistoryExists(history) {
    return history.historyData != null
        && history.historyData != undefined
        && history.historyData.length != 0;
}
export function searchByDate(lineHistory, dateString) {
    const dateInput = currentDate = generateDate(dateString);
    const localeString = dateInput.toLocaleDateString();
    let result = "";
    const startLineNum = lineHistory.dateIndices[localeString];
    if (startLineNum == undefined) {
        return "この日の履歴はありません。<br>";
    }
    const nextIndex = lineHistory.dateArray[lineHistory.dateArray.indexOf(localeString) + 1];
    const nextLineNum = lineHistory.dateIndices[nextIndex] ?? lineHistory.historyData.length;
    lineHistory.historyData.slice(startLineNum, nextLineNum).forEach((line, index) => {
        result += createLineWithTime(line, index, currentDate);
    });
    result += `${nextLineNum - startLineNum}行<br>`;
    return result;
}
export function searchByKeyword(lineHistory, keyword) {
    currentDate = undefined;
    let counter = 0;
    let result = "";
    let date = new Date(0);
    let countStart = -1;
    if (keyword.length == 1) {
        result += "注意: 1文字検索は大量にヒットする可能性があり、リソースの消費量が多くなる可能性があります。<br><br>";
    }
    keyword = keyword.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    lineHistory.historyData.forEach((line, index) => {
        if (RE_DATE.test(line)) {
            const dateTmp = generateDate(line.substring(0, 10));
            if (dateTmp.getTime() >= date.getTime()) {
                date = generateDate(line.substring(0, 10));
                countStart = index;
            }
        }
        else if (line.search(keyword) != -1) {
            counter++;
            if (RE_TIME.test(line)) {
                line = line.substring(6);
            }
            if (line.length >= 60) {
                line = `${line.substring(0, 60)}...`;
            }
            const lineCount = index - countStart;
            const dateString = date.toLocaleDateString();
            result += `<a href="javascript:runSearchByDate('${dateString}', '${lineCount}');" id="dateLink"><spam style="font-weight: bold;">${dateString}@${lineCount}</spam></a> ${line} <br>`;
        }
    });
    result = (result == "") ? "見つかりませんでした。" : result;
    return `<h3 style="display:inline">${counter}件</h3><br><br>${result}`;
}
export function searchByRandom(lineHistory) {
    const dates = Object.keys(lineHistory.dateIndices);
    const randomDate = dates[Math.floor(Math.random() * dates.length)];
    const dateString = generateDate(randomDate).toLocaleDateString();
    return searchByDate(lineHistory, dateString);
}
function calcDateIndices(lines) {
    const result = {};
    let current = new Date(1, 1, 1);
    lines.forEach((line, index) => {
        if (RE_DATE.test(line) == false)
            return;
        const dateTmp = generateDate(line.substring(0, 10));
        if (dateTmp.getTime() >= current.getTime()) {
            current = dateTmp;
            result[dateTmp.toLocaleDateString()] = index;
        }
    });
    return result;
}
function createLineWithTime(line, lineCount, currentDate) {
    const lineInfo = line.split("\t");
    if (lineInfo.length >= 2) {
        lineInfo[0] = `<a href="javascript:showLineInfoAlert('${currentDate?.toLocaleDateString()}',${lineCount});">${lineInfo[0]}</a>`;
    }
    return `<span id="${lineCount}">${lineInfo.join("\t")}</span><br>`;
}
// function checkDate(year: number = 1970, month: number = 1, day: number = 1): boolean {
//     return year >= 1970
//         && 1 <= month && month <= 12
//         && 1 <= day && day <= 31;
// }
function checkDate(ymd) {
    return ymd.year >= 1970
        && 1 <= ymd.month && ymd.month <= 12
        && 1 <= ymd.day && ymd.day <= 31;
}
function generateDate(dateString) {
    const dateInfo = dateString.split("/").map(value => parseInt(value));
    if (dateInfo.length != 3) {
        return new Date(0);
    }
    const ymd = {
        year: dateInfo[0],
        month: dateInfo[1],
        day: dateInfo[2],
    };
    let result;
    if (checkDate(ymd)) {
        result = utl.ymdToDate(ymd);
    }
    else {
        result = new Date(0);
    }
    return result;
}
