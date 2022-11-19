var darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
var isLightMode = !darkModeMediaQuery.matches;
setDisplayMode(isLightMode);
function setDisplayMode(isLightMode) {
    if (isLightMode) {
        document.documentElement.setAttribute("theme", "light");
    }
    else {
        document.documentElement.setAttribute("theme", "dark");
    }
}
