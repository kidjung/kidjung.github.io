/* assets/js/custom/dark-theme.js */
const defaultTheme = [...document.styleSheets].find(style => /(main.css)$/.test(style.href));
const darkTheme = [...document.styleSheets].find(style => /(main_dark.css)$/.test(style.href));

let setDarkMode = (isDark) => {
    darkTheme.disabled = isDark !== true;
    defaultTheme.disabled = isDark === true;
    localStorage.setItem('theme', isDark ? 'dark' : 'default');
}



if (darkTheme) {
    // console.log(darkTheme);
    let currentTheme = localStorage.getItem('theme');
    let isDarkMode = false;

    // isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // if (currentTheme) {
    //     isDarkMode = currentTheme === 'dark';
    // } else {
    //     isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // }
    isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDarkMode);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        isDarkMode = e.matches ? "dark" : "light";
        if (isDarkMode == "dark"){
            isDarkMode = true
        } else {
            isDarkMode = false
        }
        console.log(isDarkMode)
        setDarkMode(isDarkMode);
    });

    // let toggleThemeBtn = document.getElementById("toggle_dark_theme")
    // if (toggleThemeBtn) {
    //     toggleThemeBtn.checked = isDarkMode
    // }

    // let changeTheme = (e) => {
    //     setDarkMode(e.target.checked);
    // }

    // toggleThemeBtn.addEventListener('click', changeTheme)
}