const { importJSON, saveJSON, importLocale } = require('./utils')
const { readFileSync } = require('fs')
const { extensionToMime } = require('./utils')
const locales = importLocale()
function kuziMiddleware(req, res, next) {
    console.log(`[Kuzi|${req.connection.remoteAddress.replace('::ffff:','')}|${(new Date()).getHours()}:${(new Date()).getMinutes()}:${(new Date()).getSeconds()}] ${req.method} ${req.url}`)
    let activeCookies = importJSON('active.cookies.json')
    let classes = importJSON('classes.json')
    let subjects = importJSON('subjects.json')
    let scheduling = importJSON('scheduling.json')
    let users = importJSON('users.json')
    let userIDfromCookie = 0
    let i = 0
    let modified = false

    if (req.url.includes("?")) req.url = req.url.split("?")[0]
    req.userInfo = {}
    if (req.headers.cookie) {
        let cookies = {}
        req.headers.cookie.split('&').forEach(cookie => {
            eval(`cookies.${cookie.split('=')[0]} = '${cookie.split('=')[1]}'`)
        })
        req.cookies = cookies
    } else req.cookies = {}
    if (req.headers.cookie) {
        activeCookies.forEach(cookie => {
            if (cookie.cookie == req.cookies.session) {
                userIDfromCookie = cookie.userID
                if (req.method == "POST") { cookie.expireTime = Date.now() + 3600000; modified = true }
            }
        })
        req.userInfo = users.find(e => e.userID == userIDfromCookie)
    }    
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
    if (req.method == "POST" && (!req.userInfo && req.url != "/user/login")) return res.respond(JSON.stringify({ message: '' }), '', 'application/json', 401)
    if (req.userInfo) {
        req.userInfo.class = {}
        if (req.userInfo.role == "student") req.userInfo.class = classes.find(e => e.students.includes(req.userInfo.userID))
        req.userInfo.currentSubject = {}
        scheduling.forEach(connection => {
            let start = new Date()
            let end = new Date()
            start.setHours(connection.time.hours); start.setMinutes(connection.time.minutes); start.setSeconds(0); start.setMilliseconds(0)
            end.setHours(connection.time.hours + connection.time.duration.hours); end.setMinutes(connection.time.minutes + connection.time.duration.minutes); end.setSeconds(0); end.setMilliseconds(0)
            if (req.userInfo.role == "student") {
                if (connection.classID == req.userInfo.class.classID && start.getTime() <= (new Date()).getTime() && end.getTime() > (new Date()).getTime() && (new Date()).getDay() == connection.time.weekDay) subjects.forEach(subject => {
                    if (subject.subjectID == connection.subjectID) req.userInfo.currentSubject = subject
                })
            } else if (req.userInfo.role == "teacher") {
                if (connection.teacherID == req.userInfo.userID && start.getTime() <= (new Date()).getTime() && end.getTime() > (new Date()).getTime() && (new Date()).getDay() == connection.time.weekDay) subjects.forEach(subject => {
                    req.userInfo.class = { classID: connection.classID }
                    if (subject.subjectID == connection.subjectID) req.userInfo.currentSubject = subject
                })
                classes.forEach(clas => {
                    if (clas.classID == req.userInfo.class.classID) req.userInfo.class = clas
                })
            }
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
    }
    next()
}
module.exports = kuziMiddleware