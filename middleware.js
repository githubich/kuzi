const { importJSON, saveJSON, importLocale } = require('./utils')
const { readFileSync } = require('fs')
const { extensionToMime } = require('./utils')
const locales = importLocale()
function kuziMiddleware(req, res, next) {

    // Log everything
    console.log(`[Kuzi|${req.connection.remoteAddress}] ${req.method} ${req.url}`)

    // Import some files and declare variables
    let activeCookies = importJSON('active.cookies.json')
    let users = importJSON('users.json')
    let userIDfromCookie = 0
    let i = 0
	let modified = false

    // Parse the cookies to req.cookies
    if (req.headers.cookie !== undefined && req.headers.cookie !== null && req.headers.cookie !== '') {
        let cookies = {}
        req.headers.cookie.split('&').forEach(cookie => {
            eval(`cookies.${cookie.split('=')[0]}='${cookie.split('=')[1]}'`)
        })
        req.cookies = cookies
    } else {
        req.cookies = {}
    }
    
    // Look for the user performing the action and put their information in req.userInfo and update the expire time
    req.userInfo = {}
    activeCookies.forEach(cookie => {
		if (cookie.cookie == req.cookies.session) {
            userIDfromCookie = cookie.userID
            if (req.method == "POST") {
                cookie.expireTime = Date.now() + 3600000
                modified = true
            }
		}
	})
	users.forEach(user => {
		if (user.userID == userIDfromCookie) {
			req.userInfo = { username: user.username, password: user.password, prettyName: user.prettyName, userID: user.userID, role: user.role, isAdmin: user.isAdmin }
		}
	})

    // Shortcut, I'm lazy
    req.file = req.url.slice(1,req.url.length)

    // Clear the expired cookies and refresh the cookie
	activeCookies.forEach(cookie => {
		if (cookie.expireTime <= Date.now()) {
			activeCookies.splice(i,1)
			modified = true
		}
		i++
    })
	i = 0
	activeCookies.forEach(cookie => {
		if (cookie.expireTime <= Date.now()) {
			activeCookies.splice(i,1)
			modified = true
		}
		i++
	})
	if (modified) {
		saveJSON('active.cookies.json', activeCookies)
    }
    
    // Create a respond function to make everything faster and easier
    res.respond = (content, file, mime, statusCode) => {
        if (!mime && file) mime = extensionToMime(file)
        if (!mime && content) mime = 'text/html'
        if (!content) content = readFileSync(file)
        if ((mime == "text/html" || mime == "text/javascript") && !req.url.includes('/users/')) {
            content = content.toString('utf8')
            locales.forEach(locale => {
                content = content.split(locale.split('|')[0]).join(locale.split('|')[1])
            })
        }
        res.setHeader('Content-Type', mime)
        res.status(statusCode).send(content)
    }
    next()
}

// Export everything
module.exports = kuziMiddleware