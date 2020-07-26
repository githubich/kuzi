if (localStorage.getItem('theme')) document.documentElement.setAttribute('theme', localStorage.getItem('theme'))
else if (window.matchMedia) {
    if (window.matchMedia("(prefers-color-scheme: light)")) localStorage.setItem('theme', 'light')
    else localStorage.setItem('theme', 'dark')
    document.documentElement.setAttribute('theme', localStorage.getItem('theme'))
} else {
    localStorage.setItem('theme', 'dark')
    document.documentElement.setAttribute('theme', localStorage.getItem('theme'))
}