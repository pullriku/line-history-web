var darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
var isLightMode = !darkModeMediaQuery.matches;
setDisplayMode(isLightMode);
darkModeMediaQuery.addEventListener("change", function (e) {
    setDisplayMode(!darkModeMediaQuery.matches);
});
function setDisplayMode(isLightMode) {
    if (isLightMode) {
        document.documentElement.setAttribute("theme", "light");
    }
    else {
        document.documentElement.setAttribute("theme", "dark");
    }
}
