/**
 * @fileoverview 履歴ファイルを読み込み、コマンドを実行するためのスクリプト
 * aa
 */

import * as utl from "./utils.js";
import * as his from "./history.js";


const outputField = document.getElementById("outputField") as HTMLElement;
const scoreField = document.getElementById("scoreField");
const stageField = document.getElementById("stageField");
const datePicker = document.getElementById("datePicker");
// const currentDateField = document.getElementById("currentDateField") as HTMLInputElement;
let lineHistory: his.LineHistory;
let date: string | undefined;
let correctDateString: string | undefined;
let score: number = 0;
let stage: number = 1;
main();


function main() {
    initEventListeners();
    // initGlobalFunctions();
    // initCurrentDateField();
    initOutputField();
    writeScore(0);
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

            game();
        }
    }, false);

    datePicker?.addEventListener("change", (e) => {
        const _date = (e.target as HTMLInputElement)?.value ?? "";
        if(_date == "") return;
        date = _date.replace(/-/g, "/");
    }, false);

    const dateSubmitButton = document.getElementById("dateSubmitButton");
    dateSubmitButton?.addEventListener("click", () => {
        if(date == undefined) return;
        drawErrorMessageIfNeeded();
        
        if (correctDateString == undefined) return;
        const correctDate = new Date(correctDateString);
        const inputDate = new Date(date);

        const diff = Math.abs(correctDate.getTime() - inputDate.getTime());
        const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
        const sumScore = 1000 - diffDays;
        
        score += sumScore;
        writeScore(score);

        if(stage < 10) {
            stage += 1;
            writeScore(score);
            game();
        } else {
            flush();
            outputField.innerHTML = `
                <br>
                お疲れ様でした。<br>
                <br>
                スコア: ${score}<br>
                <br>
                <button id="restartButton">もう一度</button>
            `;
        }
    }, false);

    const restartButton = document.getElementById("restartButton");
    restartButton?.addEventListener("click", () => {
        restart();
    }, false);

    
    // const wordInputField = document.getElementById("wordInput");
    // const wordSubmitButton = document.getElementById("wordSubmitButton");
    // wordSubmitButton?.addEventListener("click", () => {
    //     const inputWord = (wordInputField as HTMLInputElement)?.value;
    //     if(inputWord == undefined || inputWord == "") return;
    //     drawErrorMessageIfNeeded();
    //     const result = his.searchByKeyword(lineHistory, inputWord);
    //     writeResult(result, outputField);
    // });
    
    // wordInputField?.addEventListener("keyup", (e) => {
    //     if (e.key == "Enter")
    //         wordSubmitButton?.dispatchEvent(new Event("click"));
    // });
    
    // const randomSubmitButton = document.getElementById("randomSubmitButton");
    // randomSubmitButton?.addEventListener("click", () => {
    //     drawErrorMessageIfNeeded();
    //     const result = his.searchByRandom(lineHistory);
    //     writeResult(result, outputField);
    // });
    
    // const previousDateButton = document.getElementById("previousDateButton");
    // previousDateButton?.addEventListener("click", () => {
    //     const current = his.currentDate;
        
    //     if(current != undefined){
    //         const date = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 1);
    //         drawErrorMessageIfNeeded();
    //         const result = his.searchByDate(lineHistory, date.toLocaleString().split(' ')[0]);
    //         writeResult(result, outputField);
    //     }
    // });
    
    // const nextDateButton = document.getElementById("nextDateButton");
    // nextDateButton?.addEventListener("click", () => {
    //     const current = his.currentDate;
    
    //     if(current != undefined){
    //         const date = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
    //         drawErrorMessageIfNeeded();
    //         const result = his.searchByDate(lineHistory, date.toLocaleString().split(' ')[0]);
    //         writeResult(result, outputField);
    //     }
    // });
    
    // currentDateField?.addEventListener("change", () => {
    //     drawErrorMessageIfNeeded();
    //     const result = his.searchByDate(lineHistory, currentDateField?.value.replace(/-/g, "/"));
    //     writeResult(result, outputField);
    // });
}

// declare global {
//     interface Window {
//         runSearchByDate: Function;
//         showLineInfoAlert: Function;
//     }
// }

// function initGlobalFunctions() {
//     window.runSearchByDate = (date: string, id?: string): void => {
//         const outputField = document.getElementById("outputField") as HTMLElement;
//         drawErrorMessageIfNeeded();
//         const result = his.searchByDate(lineHistory, date);
//         writeResult(result, outputField);
    
//         if(id == undefined) return;
//         document.getElementById(id)?.scrollIntoView(true);
//     };
    
//     window.showLineInfoAlert = (date: string, lineNumber: number): void => {
//         const info = date
//             .split("/")
//             .slice(0, 3)
//             .map((value) => parseInt(value))
//             .map(value => utl.zeroPadding(value, 2));
    
//         alert(`この行の情報:\n${info[0]}/${info[1]}/${info[2]}@${lineNumber}`);
//     };
// }

function game() {
    flush();
    const dates = lineHistory.dateArray;
    const randomDate: string = chooseOne(dates);
    
    correctDateString = randomDate.split("/").map(value => utl.zeroPadding(parseInt(value), 2)).join("/");
    const result = his.searchByDate(lineHistory, randomDate).split("<br>").slice(1, -3).join("<br>");
    writeResult(result, outputField);
    
}

function chooseOne<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function flush() {
    outputField.innerText = " ";
    datePicker?.setAttribute("value", "");
}

function initOutputField() {
    if(outputField?.innerHTML == undefined) return;
    outputField.innerHTML = `
        <br>
        Welcome back<br>
        <br>
    `;
}

// function initCurrentDateField() {
//     const ymd = utl.newYMDString(new Date());
//     currentDateField.value = `${ymd.year}-${ymd.month}-${ymd.day}`;
// }

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

    // const currentDate = his.currentDate;
    // if (currentDate == undefined) {
    //     currentDateField.value = "";
    //     return;
    // }

    // const ymd = utl.newYMDString(currentDate);
    // currentDateField.value = `${ymd.year}-${ymd.month}-${ymd.day}`;
}

function writeScore(score: number): void {
    if (scoreField?.innerHTML) {
        scoreField.innerHTML = `スコア: ${score}`;
    }
    if (stageField?.innerHTML) {
        stageField.innerHTML = `ステージ: ${stage}/10`;
    }
}

function restart(): void {
    score = 0;
    stage = 1;
    flush();
    writeScore(score);
    game();
}