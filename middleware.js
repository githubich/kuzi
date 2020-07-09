const { importJSON, saveJSON, importLocale } = require('./utils')
const { readFileSync } = require('fs')
const { extensionToMime } = require('./utils')
const locales = importLocale()
function verbose(req, r, next) {
    console.log(`[Kuzi|${req.connection.remoteAddress.replace('::ffff:','')}] ${req.method} ${req.url}`)
    next()
}
function kuziMiddleware(req, res, next) {
    let activeCookies = importJSON('active.cookies.json')
    let classes = importJSON('classes.json')
    let subjects = importJSON('subjects.json')
    let scheduling = importJSON('scheduling.json')
    let users = importJSON('users.json')
    let userIDfromCookie = 0
    let i = 0
    let modified = false
    let currentTime = new Date()

    if (req.url.includes("?")) req.url = req.url.split("?")[0]

    if (req.headers.cookie !== undefined && req.headers.cookie !== null && req.headers.cookie !== '') {
        let cookies = {}
        req.headers.cookie.split('&').forEach(cookie => {
            eval(`cookies.${cookie.split('=')[0]}='${cookie.split('=')[1]}'`)
        })
        req.cookies = cookies
    } else req.cookies = {}
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
	users.forEach(user => { if (user.userID == userIDfromCookie) req.userInfo = user })
    req.userInfo.class = {}
    if (req.userInfo.role == "student") {
        classes.forEach(clas => clas.students.forEach(student => {
            if (req.userInfo.userID == student) req.userInfo.class = clas
        }))
    }
    req.userInfo.currentSubject = {}
    scheduling.forEach(connection => {
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
        if (connection.classID == req.userInfo.class.classID && start.getTime() <= currentTime.getTime() && end.getTime() > currentTime.getTime() && currentTime.getDay() == connection.time.weekDay) subjects.forEach(subject => {
            if (subject.subjectID == connection.subjectID) req.userInfo.currentSubject = subject
        })
    })
	activeCookies.forEach(cookie => {
		if (cookie.expireTime <= Date.now()) {
			activeCookies.splice(i, 1)
			modified = true
		}
		i++
    })
	i = 0
	activeCookies.forEach(cookie => {
		if (cookie.expireTime <= Date.now()) {
			activeCookies.splice(i, 1)
			modified = true
		}
		i++
	})
	if (modified) saveJSON('active.cookies.json', activeCookies)
    res.respond = (content, file, mime, statusCode) => {
        if (!mime && file) mime = extensionToMime(file)
        if (!mime && content) mime = 'text/html'
        if (!content) content = readFileSync(file)
        if ((mime == "text/html" || mime == "text/javascript") && !req.url.includes('/users/')) {
            content = content.toString('utf8')
            locales.forEach(locale => content = content.split(`[{(${locale.split('|')[0]})}]`).join(locale.split('|')[1]))
        }
        res.setHeader('Content-Type', mime)
        res.status(statusCode).send(content)
    }
    next()
}
module.exports = { verbose, kuziMiddleware }