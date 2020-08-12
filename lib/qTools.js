$ = q => q ? document.querySelector(q) : document.body
$$ = q => q ? document.querySelectorAll(q) : undefined
$parseURLArgs = () => {
    if (!window.location.toString().includes('?')) return null
    let parameters = {}
    window.location.toString().split("?")[1].split("&").forEach(t => parameters[t.split("=")[0]] = t.split("=")[1])
    return parameters
}
$parseCookies = cs => {
    let parsedCookies = {};
    (cs ? cs : document.cookie).split("; ").forEach(c => {
        parsedCookies[c.split('=')[0]] = c.split('=')[1]
    })
    return parsedCookies
}