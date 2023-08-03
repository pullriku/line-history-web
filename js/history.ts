import * as utl from "./utils.js";

const RE_DATE = /^20\d{2}\/\d{1,2}\/\d{1,2}\(.+\)\r?$/g;
const RE_YEAR = /^20\d{2}/g;
const RE_MONTH_DAY = /\d{2}/g;
const RE_DATE_NO_WEEK = /^20\d{2}\/\d{1,2}\/\d{1,2}$/g;

/** Typeに変更予定 */
// type _LineHistory = {
//     readonly historyData: string[];
//     readonly dateIndices: {[date: string]: number};
//     readonly dateArray: string[];
// };
// let _currentDate: Date | undefined;

/**
 * @classdesc 履歴ファイルを保持するクラス
 */
export class LineHistory {
    /** 履歴データを改行で区切った配列 */
    private historyData: string[];
    /** historyDataの各日付のインデックスを保持する配列 */
    private _dateIndices: {[date: string]: number};
    /** 日付の配列 */
    private _dateArray: string[];
    /** 現在の日付．過去の日付に反応させないため．dateChangeButtonを実装するため． */
    private _currentDate?: Date;


    constructor(data?: string) {
        if (data != null) {
            this.historyData = data
                .replace(/\r/g, "")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .split("\n");
        } else {
            this.historyData = [];
        }
        this._dateIndices = this.calcDateIndices();
        this._dateArray = Object.keys(this.dateIndices);
        this.currentDate = undefined;
    }

    public set currentDate(date: Date | undefined) {
        this._currentDate = date;
    }
    public get currentDate(): Date | undefined {
        return this._currentDate != undefined 
            ? new Date(this._currentDate) 
            : undefined;
    }

    public get dateIndices(): {[date: string]: number} {
        return this._dateIndices;
    }

    public get dateArray(): string[] { return this._dateArray; }

    public get exists(): boolean {
        return this.historyData != null 
            && this.historyData != undefined 
            && this.historyData.length != 0;
    }

    /**
     * 指定した日付の履歴を検索する
     * @param dateString 日付を表す文字列 yyyy/mm/dd
     * @returns 指定した日の履歴
     */
    public searchByDate(dateString: string): string {
        const dateInput = this.currentDate = generateDate(dateString);
        const localeString = dateInput.toLocaleDateString();
        let output: string = "";

        const startIndex = this.dateIndices[localeString];
        if (startIndex == undefined) {
            return "この日の履歴はありません。<br>";
        }

        const nextIndex = this.dateIndices[this.dateArray[this.dateArray.indexOf(localeString) + 1]] ?? this.historyData.length;

        this.historyData.slice(startIndex, nextIndex).forEach((line, index) => {
            output += createLineWithTime(line, index, this.currentDate);
        });
        output += `${nextIndex - startIndex}行<br>`;

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

        this.currentDate = undefined;
        return `<h3 style="display:inline">${counter}件</h3><br><br>${output}`;
    }

    public searchByRandom(): string {
        const dates = Object.keys(this.dateIndices);
        const randomDate = dates[Math.floor(Math.random() * dates.length)];

        const dateString = generateDate(randomDate).toLocaleDateString();
        return this.searchByDate(dateString);
    }

    private calcDateIndices(): {[date: string]: number} {
        const result: {[date: string]: number} = {};
        let current: Date = new Date(1, 1, 1);

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

function createLineWithTime(line: string, lineNum: number, currentDate?: Date): string {
    const lineInfo = line.split("\t");
    if(lineInfo.length >= 2) {
        lineInfo[0] = `
            <a href="javascript:showLineInfoAlert('${currentDate?.toLocaleDateString()}',${lineNum});">
                ${lineInfo[0]}
            </a>
        `;
    }
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