let historyData: string[];
const DATE_PATTERN: RegExp = /^20\d{2}\/\d{2}\/\d{2}\(.+\)\r?$/g;
const YEAR_PATTERN: RegExp = /^20\d{2}/g;
const MONTH_DAY_PATTERN: RegExp = /\d{2}/g;

function runCommand(command_: string): string{
    let command: string[] = command_.split(" ");
    for (let i = 0; i < 5 - command.length; i++) {
        command.push("");
    }

    let commandName: string = command[0];
    let output: string = ""

    if (/^20\d{2}\/\d{2}\/\d{2}$/.test(commandName)){
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
                    
                    let outputElement = `${date.toLocaleString("ja-jp").substring(0, 10 - spaceRemoveCounter).replace(/-/g, "/")}`;
                    output += `<a href="javascript:runcommand(/search ${outputElement});"><spam style="font-weight: bold;">` + outputElement + `</spam></a> ${line}<br>`;
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

function main(): void{
    const fileField = document.getElementById("file");
    const dateInput = document.getElementById("dateTimeInput");
    const dateSubmitButton = document.getElementById("dateSubmitButton");
    const wordInputField = document.getElementById("wordInput");
    let inputWord = "";
    const wordSubmitButton = document.getElementById("wordSubmitButton");
    const displayModeSwitch = document.getElementById("displayModeSwitch");
    const outputField = document.getElementById("outputField");
    let isLightMode = true;

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
            outputField.innerHTML = result;
        }else{
            
        }
    })

    wordSubmitButton?.addEventListener("click", (e)=>{
        let result = runCommand(`/search ${inputWord}`);
        if(outputField?.innerHTML && result != ""){
            outputField.innerHTML = result;
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

    }
}
main()