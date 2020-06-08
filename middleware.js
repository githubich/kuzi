const { importJSON, saveJSON } = require('./utils')
function utils(req, res, next) {

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

    next()
}
function log(req, res, next) {
    // Log everything
    console.log(`[Kuzi|${req.connection.remoteAddress}] ${req.method} ${req.url}`)
    next()
}

// Export everything
module.exports = { utils, log }