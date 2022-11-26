var historyData = [];
var DATE_PATTERN = /^20\d{2}\/\d{1,2}\/\d{1,2}\(.+\)\r?$/g;
var YEAR_PATTERN = /^20\d{2}/g;
var MONTH_DAY_PATTERN = /\d{2}/g;
function runCommand(command_) {
    var command = command_.split(" ");
    for (var i = 0; i < 5 - command.length; i++) {
        command.push("");
    }
    var commandName = command[0];
    var output = "";
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
    var splitDate = dateString.split("/");
    var result;
    if (splitDate.length != 3) {
        result = new Date(2020, 1, 1);
    }
    else {
        var year = parseInt(splitDate[0]);
        var month = parseInt(splitDate[1]);
        var day = parseInt(splitDate[2]);
        result = new Date(year, month - 1, day);
    }
    return result;
}
function searchByDate(dateString) {
    var dateInput = generateDate(dateString);
    var countStart = -1;
    var countStop = -1;
    var countFlag = false;
    var output = "";
    for (var i = 0; i < historyData.length; i++) {
        var line = historyData[i];
        if (DATE_PATTERN.test(line)) {
            var dateTmp = generateDate(line.substring(0, 10));
            if (dateTmp.getTime() == dateInput.getTime()) {
                countStart = i;
                countFlag = true;
                output += "".concat(line, "<br>");
            }
            else if (countFlag && dateInput.getTime() < dateTmp.getTime()) {
                countStop = i;
                break;
            }
        }
        else if (countFlag) {
            output += "".concat(line, "<br>");
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
        output += "".concat(countStop - countStart, "\u884C<br>");
    }
    return output;
}
function searchByKeyword(keyword) {
    var counter = 0;
    var output = "";
    var date = new Date(1, 1, 1);
    if (keyword.length > 1) {
        for (var i = 0; i < historyData.length; i++) {
            var line = historyData[i];
            var max_date = new Date(1970, 1, 1);
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
                        line = "".concat(line.substring(0, 60), "...");
                    }
                    var spaceRemoveCounter = 0;
                    if (date.getMonth() <= 8)
                        spaceRemoveCounter++;
                    if (date.getDate() <= 9)
                        spaceRemoveCounter++;
                    var outputElement = "".concat(date.toLocaleDateString("ja-jp").substring(0, 10 - spaceRemoveCounter).replace(/-/g, "/"));
                    output += "<a href=\"javascript:runSearchByDate('".concat(outputElement, "');\"><spam style=\"font-weight: bold;\">") + outputElement + "</spam></a> ".concat(line, "<br>");
                }
            }
        }
    }
    if (output == "") {
        output = "見つかりませんでした。";
    }
    return "".concat(counter, "\u4EF6<br><br>").concat(output);
}
function makeErrorMessage(message) {
    var result = "コマンドエラーが発生しました。";
    if (message != "") {
        result += "type: ".concat(message);
    }
    return result;
}
function addAsterisk(message) {
    var result = "";
    var inputSplited = message.split("<br>");
    for (var i = 0; i < inputSplited.length; i++) {
        var line = inputSplited[i];
        result += "\uFF0A".concat(line, "<br>");
    }
    return result;
}
function runSearchByDate(date) {
    console.log(date);
    var outputField = document.getElementById("outputField");
    var result = runCommand(date);
    if ((outputField === null || outputField === void 0 ? void 0 : outputField.innerHTML) && result != "") {
        outputField.innerHTML = addAsterisk(result);
    }
}
function main() {
    var title = document.getElementById("title");
    var fileField = document.getElementById("file");
    var dateInput = document.getElementById("dateTimeInput");
    var dateSubmitButton = document.getElementById("dateSubmitButton");
    var wordInputField = document.getElementById("wordInput");
    var inputWord = "";
    var wordSubmitButton = document.getElementById("wordSubmitButton");
    var displayModeSwitch = document.getElementById("displayModeSwitch");
    var outputField = document.getElementById("outputField");
    var darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    var isLightMode = !darkModeMediaQuery.matches;
    setDisplayMode(isLightMode);
    darkModeMediaQuery.addEventListener("change", function (e) {
        isLightMode = !e.matches;
        setDisplayMode(isLightMode);
    });
    if (outputField === null || outputField === void 0 ? void 0 : outputField.innerHTML) {
        outputField.innerHTML = "\n        <br>\n        Welcome back<br>\n        <br>\n        ";
    }
    // 特別な表示の処理
    // 毎年2/10から2/16に表示
    var today = new Date(2046, 2 - 1, 13);
    // const today  = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var day = today.getDate();
    var yearDiff = year - 2022;
    var ordinal; // 序数詞
    if (month == 2 && 10 <= day && day <= 16) {
        var onesPlace = yearDiff % 10;
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
        if (title) {
            title.innerHTML += "<br><spam id=\"specialMessage\">\uD83C\uDF89".concat(yearDiff).concat(ordinal, " Anniv!</spam>");
        }
    }
    wordInputField === null || wordInputField === void 0 ? void 0 : wordInputField.addEventListener("keyup", function (e) {
        inputWord = e.target.value;
    });
    dateSubmitButton === null || dateSubmitButton === void 0 ? void 0 : dateSubmitButton.addEventListener("click", function (e) {
        var result = runCommand(dateInput === null || dateInput === void 0 ? void 0 : dateInput.value.replace(/-/g, "/"));
        if ((outputField === null || outputField === void 0 ? void 0 : outputField.innerHTML) && result != "") {
            outputField.innerHTML = addAsterisk(result);
        }
    });
    wordSubmitButton === null || wordSubmitButton === void 0 ? void 0 : wordSubmitButton.addEventListener("click", function (e) {
        var result = runCommand("/search ".concat(inputWord));
        if ((outputField === null || outputField === void 0 ? void 0 : outputField.innerHTML) && result != "") {
            outputField.innerHTML = addAsterisk(result);
        }
    });
    var file;
    var text;
    fileField === null || fileField === void 0 ? void 0 : fileField.addEventListener("change", function (e) {
        var _a, _b;
        file = (_b = (_a = e.target) === null || _a === void 0 ? void 0 : _a.files) !== null && _b !== void 0 ? _b : new FileList();
        var reader = new FileReader();
        reader.readAsText(file[0]);
        reader.onload = function (e) {
            var _a;
            text = (_a = reader.result) !== null && _a !== void 0 ? _a : "";
            if (typeof text == "string") {
                historyData = text.replace(/\r/, "").split("\n");
            }
        };
    }, false);
    displayModeSwitch === null || displayModeSwitch === void 0 ? void 0 : displayModeSwitch.addEventListener("click", function () {
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
