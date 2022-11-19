let historyData: string[];
const DATE_PATTERN: RegExp = /^20\d{2}\/\d{1,2}\/\d{1,2}\(.+\)\r?$/g;
const YEAR_PATTERN: RegExp = /^20\d{2}/g;
const MONTH_DAY_PATTERN: RegExp = /\d{2}/g;

function runCommand(command_: string): string{
    let command: string[] = command_.split(" ");
    for (let i = 0; i < 5 - command.length; i++) {
        command.push("");
    }

    let commandName: string = command[0];
    let output: string = ""

    console.log(command);
    if (/^20\d{2}\/\d{1,2}\/\d{1,2}$/.test(commandName)){
        output = searchByDate(commandName)
    }else if(commandName == "/help"){

    }else if(commandName == "/random"){

    }else if(commandName == "/search"){
        output = searchByKeyword(command[1]);
    }else{
        output = makeErrorMessage("command_error");
    }
    return output;
}

function generateDate(dateString: string): Date{
    const splitDate = dateString.split("/");
    let result: Date;
    if(splitDate.length != 3){
        result = new Date(2020, 1, 1);
    }else{
        const year = parseInt(splitDate[0]);
        const month = parseInt(splitDate[1]);
        const day = parseInt(splitDate[2]);
        result = new Date(year, month - 1, day);
    }
    
    return result;

}

function searchByDate(dateString: string): string{
    const dateInput = generateDate(dateString);
    let countStart: number = -1;
    let countStop: number = -1;
    let countFlag: boolean = false;
    let output: string = "";

    for (let i = 0; i < historyData.length; i++) {
        let line: string = historyData[i];

        if(DATE_PATTERN.test(line)){
            
            let dateTmp = generateDate(line.substring(0,10))

            if(dateTmp.getTime() == dateInput.getTime()){
                countStart = i;
                countFlag = true;
                output += `${line}<br>`;
            }else if(countFlag && dateInput.getTime() < dateTmp.getTime()){
                countStop = i;
                break;
            }
        }else if(countFlag){
            output += `${line}<br>`;
            if(i == historyData.length - 1){
                countStop = i;
                break;
            }
        }
    }
    if(countStart == -1){
        output = "この日の履歴はありません。<br>";
    }else{
        output += `${countStop - countStart}行<br>`;
    }
    return output;
}

function searchByKeyword(keyword: string): string{
    let counter = 0;
    let output = "";
    let date: Date = new Date(1,1,1);

    if(keyword.length > 1){
        for(let i = 0; i < historyData.length; i++){
            let line = historyData[i];
            let max_date = new Date(1970,1,1);
            
            if(DATE_PATTERN.test(line)){
                if(generateDate(line.substring(0, 10)).getTime() >= max_date.getTime()){
                    date = generateDate(line.substring(0, 10));
                    max_date = date;
                }
            }else{
                if(line.search(keyword) != -1){
                    counter++;
                    if(/\d{2}:\d{2}.*/.test(line)){
                        line = line.substring(6);
                    }
                    if(line.length >= 60){
                        line = `${line.substring(0, 60)}...`;
                    }
                    let spaceRemoveCounter = 0;
                    if(date.getMonth() <= 8)spaceRemoveCounter++;
                    if(date.getDate() <= 9)spaceRemoveCounter++;
                    
                    let outputElement = `${date.toLocaleDateString("ja-jp").substring(0, 10 - spaceRemoveCounter).replace(/-/g, "/")}`;
                    output += `<a href="javascript:runSearchByDate('${outputElement}');"><spam style="font-weight: bold;">` + outputElement + `</spam></a> ${line}<br>`;
                }
            }
        }
    }
    if(output == ""){
        output = "見つかりませんでした。";
    }
    return `${counter}件<br><br>${output}`;
}

function makeErrorMessage(message: string): string{
    let result = "コマンドエラーが発生しました。";
    if(message != ""){
        result += `type: ${message}`;
    }
    return result;
}

function addAsterisk(message: string): string{
    let result = "";
    let inputSplited = message.split("<br>");
    for(let i = 0; i < inputSplited.length; i++){
        let line = inputSplited[i];
        result += `＊${line}<br>`;
    }
    return result;
}

function runSearchByDate(date: string): void{
    console.log(date);
    const outputField = document.getElementById("outputField");
    let result = runCommand(date);
    if(outputField?.innerHTML && result != ""){
        outputField.innerHTML = addAsterisk(result);
    }
}


function main(): void{
    const fileField = document.getElementById("file");
    const dateInput = document.getElementById("dateTimeInput");
    const dateSubmitButton = document.getElementById("dateSubmitButton");
    const wordInputField = document.getElementById("wordInput");
    let inputWord = "";
    const wordSubmitButton = document.getElementById("wordSubmitButton");
    const displayModeSwitch = document.getElementById("displayModeSwitch");
    const outputField = document.getElementById("outputField");
    
    const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    let isLightMode = ! darkModeMediaQuery.matches;
    setDisplayMode(isLightMode);

    darkModeMediaQuery.addEventListener("change", (e)=>{
        isLightMode = ! e.matches;
        setDisplayMode(isLightMode);
    })

    if(outputField?.innerHTML){
        outputField.innerHTML = `
        <br>
        <br>
        Welcome back
        <br>
        <br>
        `
    }

    wordInputField?.addEventListener("keyup", (e)=>{
        inputWord = (e.target as HTMLInputElement).value;
    })

    dateSubmitButton?.addEventListener("click", (e) => {
        let result = runCommand((dateInput as HTMLInputElement)?.value.replace(/-/g, "/"));
        if(outputField?.innerHTML && result != ""){
            outputField.innerHTML = addAsterisk(result);
        }
    })

    wordSubmitButton?.addEventListener("click", (e)=>{
        let result = runCommand(`/search ${inputWord}`);
        if(outputField?.innerHTML && result != ""){
            outputField.innerHTML = addAsterisk(result);
        }
    })

    let file: FileList;
    let text: string | ArrayBuffer;

    fileField?.addEventListener("change", (e)=>{
        file = (e.target as HTMLInputElement)?.files ?? new FileList();
        let reader = new FileReader();
        reader.readAsText(file[0]);

        reader.onload = (e)=>{
            text = reader.result ?? "";
            if(typeof text == "string"){
                historyData = text.replace(/\r/, "").split("\n");
            }

        }
    }, false);

    displayModeSwitch?.addEventListener("click", ()=>{
        isLightMode = !isLightMode;
        setDisplayMode(isLightMode);
    })

    function setDisplayMode(isLightMode: boolean): void{
        if(displayModeSwitch != null) {
            if(isLightMode){
                document.documentElement.setAttribute("theme", "light");
                displayModeSwitch.innerHTML = "🌚ダーク";
            }else{
                document.documentElement.setAttribute("theme", "dark");
                displayModeSwitch.innerHTML = "🌝ライト";
            }
        }
    }
    // function setDisplayMode(isLightMode: boolean): void{
    //     const head = document.getElementsByTagName("head")[0];
    //     let cssSelector = document.querySelector("#cssSelector");
    //     if(head && cssSelector){
    //         head.removeChild(cssSelector);
    //     }

    //     let child = document.createElement("link");
    //     child.id = "cssSelector";
    //     child.rel = "stylesheet";

    //     if(displayModeSwitch){
    //         if(isLightMode){
    //             child.href = "./light.css";
    //             displayModeSwitch.innerHTML = "🌚ダーク";
    //         }else{
    //             child.href = "./dark.css";
    //             displayModeSwitch.innerHTML = "🌝ライト";
    //         }
    //         head.appendChild(child);
    //     }
    // }
    // function setDisplayMode(isLightMode: boolean): void{
    //     if(isLightMode){
    //         document.getElementsByTagName("html")[0].style.backgroundColor = "#F2F2F7";
    //         document.getElementsByTagName("body")[0].style.backgroundColor = "#F2F2F7";
    //         document.getElementById("titleBar")!.style.backgroundColor = "white";
    //         document.getElementById("title")!.style.color = "black";
    //         (document.getElementsByClassName("menu")[0] as HTMLElement).style.backgroundColor = "rgba(158, 195, 255, 0.791)"
    //         Array.prototype.forEach.call(document.getElementsByTagName("p"), (element: { style: { color: string; }; })=>{
    //             element.style.color = "black"
    //         });
    //         document.getElementById("ver")!.style.color = "black";
    //         let of = document.getElementById("outputField");
    //         of!.style.backgroundColor = "white";
    //         of!.style.color = "black";
    //         document.getElementsByTagName("small")[0].style.color = "black";
    //         displayModeSwitch!.innerHTML = "🌚ダーク";
    //     }else{
    //         document.getElementsByTagName("html")[0].style.backgroundColor = "black";
    //         document.getElementsByTagName("body")[0].style.backgroundColor = "black";
    //         document.getElementById("titleBar")!.style.backgroundColor = "#1C1C1E";
    //         document.getElementById("title")!.style.color = "white";
    //         (document.getElementsByClassName("menu")[0] as HTMLElement).style.backgroundColor = "rgb(62, 67, 116)"
    //         Array.prototype.forEach.call(document.getElementsByTagName("p"), (element: { style: { color: string; }; })=>{
    //             element.style.color = "white"
    //         });
    //         document.getElementById("ver")!.style.color = "white";
    //         let of = document.getElementById("outputField");
    //         of!.style.backgroundColor = "#1C1C1E";
    //         of!.style.color = "white"
    //         document.getElementsByTagName("small")[0].style.color = "white";
    //         displayModeSwitch!.innerHTML = "🌝ライト";
    //     }
    // }
}

main();