const { importJSON, saveJSON, importLocale } = require('./utils')
const { readFileSync } = require('fs')
const { extensionToMime } = require('./utils')
const { userInfo } = require('os')
const locales = importLocale()
function kuziMiddleware(req, res, next) {

    console.log(`[Kuzi|${req.connection.remoteAddress}] ${req.method} ${req.url}`) // Log everything

    let activeCookies = importJSON('active.cookies.json') // Import some files and declare variables
    let classes = importJSON('classes.json')
    let subjects = importJSON('subjects.json')
    let subjectUserConnections = importJSON('subject-user.json')
    let users = importJSON('users.json')
    let userIDfromCookie = 0
    let i = 0
    let modified = false
    let currentTime = new Date()

    /* Parse the cookies to req.cookies */ if (req.headers.cookie !== undefined && req.headers.cookie !== null && req.headers.cookie !== '') {
        let cookies = {}
        req.headers.cookie.split('&').forEach(cookie => {
            eval(`cookies.${cookie.split('=')[0]}='${cookie.split('=')[1]}'`)
        })
        req.cookies = cookies
    } else req.cookies = {}
    req.userInfo = {} // Look for the user performing the action and put their information in req.userInfo and update the expire time
    activeCookies.forEach(cookie => {
		if (cookie.cookie == req.cookies.session) {
            userIDfromCookie = cookie.userID
            if (req.method == "POST") {
                cookie.expireTime = Date.now() + 3600000
                modified = true
            }
		}
    })
    req.userInfo.class = {}
	users.forEach(user => { if (user.userID == userIDfromCookie) req.userInfo = { username: user.username, password: user.password, prettyName: user.prettyName, userID: user.userID, role: user.role, isAdmin: user.isAdmin } })
    if (req.userInfo.role == "student") {
        classes.forEach(clas => { // I use clas because class is a reserved word
            clas.students.forEach(student => {
                if (req.userInfo.userID == student) {
                    req.userInfo.class = clas
                }
            })
        })
    }
    req.userInfo.currentSubject = {} // Error proofing
    subjectUserConnections.forEach(connection => { // Set userInfo.currentSubject to the current subject
        let start = new Date()
        let end = new Date()
        start.setHours(connection.time.hours)
        start.setMinutes(connection.time.minutes)
        start.setSeconds(0)
        start.setMilliseconds(0)
        end.setHours(connection.time.hours + connection.time.duration.hours)
        end.setMinutes(connection.time.minutes + connection.time.duration.minutes)
        end.setSeconds(0)
        end.setMilliseconds(0)
        if (connection.classID == req.userInfo.class.classID && start.getTime() <= currentTime.getTime() && end.getTime() > currentTime.getTime()) subjects.forEach(subject => {
            if (subject.subjectID == connection.subjectID) req.userInfo.currentSubject = subject
        })
    })
    req.file = req.url.slice(1, req.url.length) // Shortcut, I'm lazy
	activeCookies.forEach(cookie => { // Clear the expired cookies
		if (cookie.expireTime <= Date.now()) {
			activeCookies.splice(i,1)
			modified = true
		}
		i++
    })
	i = 0
	activeCookies.forEach(cookie => { // Update the cookie expireTime
		if (cookie.expireTime <= Date.now()) {
			activeCookies.splice(i,1)
			modified = true
		}
		i++
	})
	if (modified) saveJSON('active.cookies.json', activeCookies) // Save the file if it was modified
    res.respond = (content, file, mime, statusCode) => { // Create a respond function
        if (!mime && file) mime = extensionToMime(file)
        if (!mime && content) mime = 'text/html'
        if (!content) content = readFileSync(file)
        if ((mime == "text/html" || mime == "text/javascript") && !req.url.includes('/users/')) {
            content = content.toString('utf8')
            locales.forEach(locale => content = content.split(locale.split('|')[0]).join(locale.split('|')[1]))
        }
        res.setHeader('Content-Type', mime)
        res.status(statusCode).send(content)
    }
    next()
}
module.exports = kuziMiddleware // Export everything