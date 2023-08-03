import * as utl from "./utils.js";

const RE_DATE = /^20\d{2}\/\d{1,2}\/\d{1,2}\(.+\)\r?$/g;
const RE_YEAR = /^20\d{2}/g;
const RE_MONTH_DAY = /\d{2}/g;
const RE_DATE_NO_WEEK = /^20\d{2}\/\d{1,2}\/\d{1,2}$/g;


export type LineHistory = {
    readonly historyData: string[];
    readonly dateIndices: {[date: string]: number};
    readonly dateArray: string[];
};
export let currentDate: Date | undefined;


export function newLineHistory(data: String): LineHistory {
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

export function lineHistoryExists(history: LineHistory): boolean {
    return history.historyData != null 
        && history.historyData != undefined 
        && history.historyData.length != 0;
}

export function searchByDate(lineHistory: LineHistory, dateString: string): string {
    const dateInput = currentDate = generateDate(dateString);
    const localeString = dateInput.toLocaleDateString();
    let output: string = "";

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

export function searchByKeyword(lineHistory: LineHistory, keyword: string): string {
    let counter = 0;
    let output = "";
    let date: Date = new Date(1, 1, 1);
    let max_date = new Date(1970, 1, 1);
    let countStart: number = -1;

    if (keyword.length == 1) {
        output += "注意: 1文字検索は大量にヒットする可能性があり、リソースの消費量が多くなる可能性があります。<br><br>";
    }

    for (let i = 0; i < lineHistory.historyData.length; i++) {
        let line = lineHistory.historyData[i];

        if (RE_DATE.test(line)) {
            const dateTmp = generateDate(line.substring(0, 10));
            if (dateTmp.getTime() >= max_date.getTime()) {
                date = generateDate(line.substring(0, 10));
                max_date = date;
                countStart = i;
            }
        } else if (line.search(keyword) != -1) {
            counter++;
            if (/\d{2}:\d{2}.*/.test(line)) {
                line = line.substring(6);
            }
            if (line.length >= 60) {
                line = `${line.substring(0, 60)}...`;
            }


            const lineNum = i-countStart;
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

export function searchByRandom(lineHistory: LineHistory): string {
    const dates = Object.keys(lineHistory.dateIndices);
    const randomDate = dates[Math.floor(Math.random() * dates.length)];

    const dateString = generateDate(randomDate).toLocaleDateString();
    return searchByDate(lineHistory, dateString);
}

function calcDateIndices(lines: string[]): {[date: string]: number} {
    const result: {[date: string]: number} = {};
    let current: Date = new Date(1, 1, 1);

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

function createLineWithTime(line: string, lineNum: number, currentDate?: Date): string {
    const lineInfo = line.split("\t");
    if(lineInfo.length >= 2) {
        lineInfo[0] = `<a href="javascript:showLineInfoAlert('${currentDate?.toLocaleDateString()}',${lineNum});">${lineInfo[0]}</a>`;
    }
    console.log(`[${lineInfo.join("\t")}]`);
    
    return `<span id="${lineNum}">${lineInfo.join("\t")}</span><br>`;
}

function checkDate(year: number = 1970, month: number = 1, day: number = 1): boolean {
    return year >= 1970
        && 1 <= month && month <= 12
        && 1 <= day && day <= 31;
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