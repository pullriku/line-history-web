const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
let isLightMode = ! darkModeMediaQuery.matches;
setDisplayMode(isLightMode);

darkModeMediaQuery.addEventListener("change", (e)=>{
    setDisplayMode( ! darkModeMediaQuery.matches);
})

function setDisplayMode(isLightMode: boolean): void{
    if(isLightMode){
        document.documentElement.setAttribute("theme", "light");
    }else{
        document.documentElement.setAttribute("theme", "dark");
    }
}