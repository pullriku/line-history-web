class LogText{

    constructor(logText = "", userInputText = ""){
        this.logText = logText;
        this.userInput = userInputText.split(" ");
        console.log("type: " + typeof this.userInput);
        console.log(this.userInputText);
        this.countStart = 0;
        this.countStop = 0;
        this.daynumber = 0;
        this.output = "";
        this.dateSelected = new Date();
        this.logTextSplited = [];

        for(let i = 0; i < (5 - this.userInput.length); i++){
            this.userInput.push("");
        }

        // Python: 20\d{2}/\d{2}/\d{2}
        // 形式: 2020/01/12
        const reInputDate = /^20\d{2}\/\d{2}\/\d{2}/;
        if(reInputDate.test(this.userInput[0])){
            const year = this.userInput[0].match(/20\d{2}/g);
            const monthAndDay = this.userInput[0].match(/\d{2}/g);
            this.dateSelected = new Date(year[0], monthAndDay[2] - 1, monthAndDay[3]);
        }
        if(/^20\d{2}\/\d{1,2}\/\d{1,2}/.test(this.userInput[0])){
            console.log("0なし表記の日付");
            let splitDate = this.userInput[0].split("/");
            const year = splitDate[0];
            const month = splitDate[1];
            const day = splitDate[2];
            this.dateSelected = new Date(year, month - 1, day);
        }

        this.logTextSplited = logText.split("\n");
        this.logTextSplited.splice(0, 3);
    }

    getOutput(){
        if(this.logText == ""){
            this.output = "履歴ファイルを選択してください。";
        }else if(this.output == ""){
            this.output = "見つかりませんでした。";
        }
        return this.output
    }

    analysis(){
        const datePattern = /^20\d{2}\/\d{2}\/\d{2}.*/;
        let countStart = 0;
        let countStop = 0;
        let countToggle = false;
        let daynumber = 0;
        
        for(let i = 0; i < this.logTextSplited.length; i++){
            var log = this.logTextSplited[i];

            if(datePattern.test(log)){
                daynumber += 1;
                
                var year = log.match(/^20\d{2}/g);
                var monthAndDay = log.match(/\d{2}/g);
                if(year == null || monthAndDay == null){
                    ;
                }else{
                    var date_ = new Date(year[0], monthAndDay[2] - 1, monthAndDay[3]);
                }
            
                if(date_.getTime() === this.dateSelected.getTime()){
                    countStart = i;
                    countToggle = true;
                    this.output += "＊" + log + "<br>";
                    continue;
                }else if(countToggle == true && i > countStart){
                    countStop = i;
                    break;
                }else{
                    continue;
                }
            }else if(countToggle == true){
                this.output += "＊" + log.replace("\t", "&#009;") + "<br>";
                if((i + 1) == this.logTextSplited.length){
                    countStop = i;
                    daynumber += 1;
                    break;
                }
                continue;
            }
        }

        if((countStart - countStop) == 0){
            daynumber = 1;
        }

        this.countStart = countStart;
        this.countStop = countStop;
        this.daynumber = daynumber;
    }

    wordSearch(searchWord = ""){
        let maxDate = new Date(2000, 1, 1);
        let day = new Date(2000, 1, 1);
        let counter = 0;

        if(searchWord.length >= 1){
            if(searchWord.length == 1) this.output += "⚠️一文字検索は非推奨です。<br><br>";
            this.logTextSplited.forEach((log) =>{
                if(/^20\d{2}\/\d{2}\/\d{2}.*/.test(log)){
                    if(new Date(log.substring(0, 10)).getTime() > maxDate.getTime()){
                        maxDate = new Date(log.substring(0, 10));
                        day =  new Date(log.substring(0, 10));
                    }
                }else{
                    if(log.includes(searchWord)){
                        counter++;
                        if(/\d{2}:\d{2}.*/.test(log)){
                            log = log.substring(6);
                        }
                        if(log.length >= 61){
                            log = log.substring(0, 60) + "...";
                        }
                        // this.output += "<a href='javascript:wordSearch();'><spam style='font-weight: bold;'>"
                        //  + day.toLocaleString("ja-jp").substring(0, 10).replace(/-/g, "/") + "</spam>" + " " + log  + "<br>";
                        let spaceRemoveCounter = 0;
                        if(day.getMonth() <= 8)spaceRemoveCounter++;
                        if(day.getDate() <= 9)spaceRemoveCounter++;
                        let dateOutput = day.toLocaleString("ja-jp").substring(0, 10 - spaceRemoveCounter).replace(/-/g, "/");
                        console.log(dateOutput);
                        this.output += `
                        <a href="javascript:dateSearch('${dateOutput}');"><spam style='font-weight: bold;'>${dateOutput}</spam></a> ${log}<br>
                        `
                    }
                }
            });
            this.output = counter + "件の検索結果:<br><br>" + this.output;
        }else{
            this.output = "1文字以上入力してください。";
        }
    }
}

const dateTimeInput = document.getElementById("dateTimeInput");
const wordInput = document.getElementById("wordInput");
let inputWord = "";
const dateSubmitButton = document.getElementById("dateSubmitButton");
const wordSubmitButton = document.getElementById("wordSubmitButton");
const fileField = document.getElementById("file");
const displayModeSwitch = document.getElementById("displayModeSwitch");
const outputField = document.getElementById("outputField");
let isLightMode = true;
setDisplayMode();

outputField.innerHTML = `
<br>
<br>
Welcome back!<br>
<br>
<br>
`;

wordInput.addEventListener("keyup", (e) =>{
    inputWord = e.target.value;

});

dateSubmitButton.addEventListener("click", ()=>{
    dateSearch(dateTimeInput.value.replace(/-/g, "/"))
});
wordSubmitButton.addEventListener("click", ()=>{
    wordSearch(inputWord);
});

let file;
let text = "";
fileField.addEventListener("change", function(evt){
    file = evt.target.files;
    let reader = new FileReader();
    reader.readAsText(file[0]);

    reader.onload = function(ev){
        text = reader.result;
    }
}, false);

displayModeSwitch.addEventListener("click", ()=>{
    isLightMode = !isLightMode;
    setDisplayMode();
});

function dateSearch(input){
    let lineHistory = new LogText(text, input);
    lineHistory.analysis();
    outputField.innerHTML = `${lineHistory.getOutput()}`;
}

function wordSearch(input){
    let lineHistory = new LogText(text, "2020/01/01");
    lineHistory.wordSearch(input);
    outputField.innerHTML = lineHistory.getOutput();
}

function setDisplayMode(){
    if(isLightMode){
        document.getElementsByTagName("html")[0].style.backgroundColor = "#F2F2F7";
        document.getElementsByTagName("body")[0].style.backgroundColor = "#F2F2F7";
        document.getElementById("titleBar").style.backgroundColor = "white";
        document.getElementById("title").style.color = "black";
        document.getElementsByClassName("menu")[0].style.backgroundColor = "#e5e5fb"
        Array.prototype.forEach.call(document.getElementsByTagName("p"), (element)=>{
            // element.style.color = "black"
        });
        document.getElementById("ver").style.color = "black";
        let of = document.getElementById("outputField");
        of.style.backgroundColor = "white";
        of.style.color = "black";
        document.getElementsByTagName("small")[0].style.color = "black";
        displayModeSwitch.innerHTML = "🌚ダーク";
    }else{
        document.getElementsByTagName("html")[0].style.backgroundColor = "black";
        document.getElementsByTagName("body")[0].style.backgroundColor = "black";
        document.getElementById("titleBar").style.backgroundColor = "#1C1C1E";
        document.getElementById("title").style.color = "white";
        document.getElementsByClassName("menu")[0].style.backgroundColor = "#"
        Array.prototype.forEach.call(document.getElementsByTagName("p"), (element)=>{
            // element.style.color = "white"
        });
        document.getElementById("ver").style.color = "white";
        let of = document.getElementById("outputField");
        of.style.backgroundColor = "#1C1C1E";
        of.style.color = "white"
        document.getElementsByTagName("small")[0].style.color = "white";
        displayModeSwitch.innerHTML = "🌝ライト";
    }
}