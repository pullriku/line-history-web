import * as utl from "./utils.js";
const RE_DATE = /^20\d{2}\/\d{1,2}\/\d{1,2}\(.+\)\r?$/g;
const RE_YEAR = /^20\d{2}/g;
const RE_MONTH_DAY = /\d{2}/g;
const RE_DATE_NO_WEEK = /^20\d{2}\/\d{1,2}\/\d{1,2}$/g;
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
    let output = "";
    const startIndex = lineHistory.dateIndices[localeString];
    if (startIndex == undefined) {
        return "この日の履歴はありません。<br>";
    }
    const nextIndex = lineHistory.dateIndices[lineHistory.dateArray[lineHistory.dateArray.indexOf(localeString) + 1]] ?? lineHistory.historyData.length;
    lineHistory.historyData.slice(startIndex, nextIndex).forEach((line, index) => {
        output += createLineWithTime(line, index, currentDate);
    });
    output += `${nextIndex - startIndex}行<br>`;
    return output;
}
export function searchByKeyword(lineHistory, keyword) {
    let counter = 0;
    let output = "";
    let date = new Date(1, 1, 1);
    let max_date = new Date(1970, 1, 1);
    let countStart = -1;
    if (keyword.length == 1) {
        output += "注意: 1文字検索は大量にヒットする可能性があり、リソースの消費量が多くなる可能性があります。<br><br>";
    }
    keyword = keyword.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    for (let i = 0; i < lineHistory.historyData.length; i++) {
        let line = lineHistory.historyData[i];
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
            const month = utl.zeroPadding(date.getMonth() + 1, 2);
            const day = utl.zeroPadding(date.getDate(), 2);
            const dateString = `${year}/${month}/${day}`;
            output += `<a href="javascript:runSearchByDate('${dateString}', '${lineNum}');" id="dateLink"><spam style="font-weight: bold;">${dateString}@${lineNum}</spam></a> ${line} <br>`;
        }
    }
    output = output == "" ? "見つかりませんでした。" : output;
    currentDate = undefined;
    return `<h3 style="display:inline">${counter}件</h3><br><br>${output}`;
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
function createLineWithTime(line, lineNum, currentDate) {
    const lineInfo = line.split("\t");
    if (lineInfo.length >= 2) {
        lineInfo[0] = `<a href="javascript:showLineInfoAlert('${currentDate?.toLocaleDateString()}',${lineNum});">${lineInfo[0]}</a>`;
    }
    console.log(`[${lineInfo.join("\t")}]`);
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
