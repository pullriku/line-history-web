{
    const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    let isLightMode = !darkModeMediaQuery.matches;
    setDisplayMode(isLightMode);

    darkModeMediaQuery.addEventListener("change", (e) => {
        setDisplayMode(!darkModeMediaQuery.matches);
    })

    function setDisplayMode(isLightMode: boolean): void {
        const displayModeSwitch = document.getElementById("displayModeSwitch");
        if (isLightMode) {
            document.documentElement.setAttribute("theme", "light");
            if(displayModeSwitch) {
                displayModeSwitch.innerHTML = "🌚<br>ダーク";
            }
        } else {
            document.documentElement.setAttribute("theme", "dark");
            if(displayModeSwitch) {
                displayModeSwitch.innerHTML = "🌝<br>ライト";
            }
        }
    }
}