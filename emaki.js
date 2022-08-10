class LogText{
    constructor(logText, userInputText){
        this.logText = logText;
        this.userInput = userInputText.split(" ");
        this.countStart = 0;
        this.countStop = 0;
        this.daynumber = 0;
        this.output = "";
        this.dateSelected = new Date();
        this.logTextSplited = [];

        if(logText == ""){
            this.output = "error: 履歴ファイルが正しく読み込まれませんでした。";
        }

        for(let i = 0; i < (5 - this.userInput.length); i++){
            this.userInput.push("");
        }
        console.log(this.userInput);
        // Python: 20\d{2}/\d{2}/\d{2}
        // 形式: 2020/01/12
        const reInputDate = /^20\d{2}\/\d{2}\/\d{2}/;
        if(reInputDate.test(this.userInput[0])){
            const year = this.userInput[0].match(/20\d{2}/g);
            const monthAndDay = this.userInput[0].match(/\d{2}/g);
            this.dateSelected = new Date(year[0], monthAndDay[2] - 1, monthAndDay[3]);
            console.log(this.dateSelected);
        }

        this.logTextSplited = logText.split("\n");
        this.logTextSplited.splice(0, 3);
        //debug
        /*
        this.logTextSplited.forEach((element, i) => {
            if(i < 20){
                console.log(element);
            }
        });
        */
    }

    analysis(){
        const datePattern = /20\d{2}\/\d{2}\/\d{2}.*/;
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
                    console.log(date_);
                }
                /*
                console.log(year);
                console.log(monthAndDay);
                */
            
                if(date_.getTime() === this.dateSelected.getTime()){
                    console.log(date_);
                    console.log(this.dateSelected);
                    countStart = i;
                    countToggle = true;
                    this.output += "＊" + log + "<br>";
                }else if(countToggle == true && i > countStart){
                    countStop = i;
                    break;
                }
            }else if(countToggle == true){
                this.output += "＊" + log + "<br>";
                if((i + 1) == this.logTextSplited.length){
                    countStop = i;
                    daynumber += 1;
                    break;
                }
            }
        }

        if((countStart - countStop) == 0){
            daynumber = 1;
        }

        this.countStart = countStart;
        this.countStop = countStop;
        this.daynumber = daynumber;
    }
}

console.log("ieieeeeieieiei");
let div = document.getElementById("outputField");
const dateTimeInput = document.getElementById("dateTimeInput");
const inputField = document.getElementById("inputText");
const inputField2 = document.getElementById("inputText2");
const button = document.getElementById("submitButton");
const button2 = document.getElementById("submitButton2");
const dateSubmitButton = document.getElementById("dateSubmitButton");
const fileField = document.getElementById("file");

div.innerHTML = "Welcome back!<br>";
let inputText = "";
let inputText2 = "";

const test = new Date(2020, 2, 3);
console.log(test.getFullYear() + "/" + test.getMonth() + "/" + test.getDay());

button.addEventListener("click", onButtonClick);
button2.addEventListener("click", onButtonClick2);
dateSubmitButton.addEventListener("click", onDateButtonClick);

let file;
let text = "";
fileField.addEventListener("change", function(evt){
    file = evt.target.files;
    var reader = new FileReader();
    reader.readAsText(file[0]);

    reader.onload = function(ev){
        text = reader.result;
    }
}, false)

function onButtonClick(){
    console.log("button clicked!");
    emakiMain(inputText);
}

function onButtonClick2(){
    console.log("button2 clicked!!");
    emakiMain(inputText2)
}

function onDateButtonClick(){
    emakiMain(dateTimeInput.value.replace(/-/g, "/"));
}

// Debug
function linkTest() {
    console.log("BTN test!!!");
}

function emakiMain(input){
    const reader = new FileReader();   
    let lineHistory = new LogText(text, input);
    lineHistory.analysis();
    div.innerHTML = `${lineHistory.output}`;
}