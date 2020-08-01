const { importJSON, saveJSON, importLocale } = require('./utils')
const { readFileSync } = require('fs')
const { extname } = require('path')
const { extensionToMime } = require('./utils')
const locales = importLocale()
function kuziMiddleware(req, res, next) {
    console.log(`[Kuzi|${req.connection.remoteAddress.replace('::ffff:','')}|${(new Date()).getHours()}:${(new Date()).getMinutes()}:${(new Date()).getSeconds()}] ${req.method} ${req.url}`)
    res.respond = (content, file, mime, statusCode) => {
        if (!mime && file) mime = extensionToMime(file)
        if (!mime && content) mime = 'text/html'
        else if (!content) content = readFileSync(file)
        if ((mime == "text/html" || mime == "text/javascript") && !req.url.includes('/users/')) {
            content = content.toString('utf8')
            locales.forEach(locale => content = content.split(`[{(${locale.split('|')[0]})}]`).join(locale.split('|')[1]))
        }
        res.setHeader('Content-Type', mime)
        res.status(statusCode).send(content)
    }
    if (req.url.includes("?")) { req.fullUrl = req.url.split()[0]; req.url = req.url.split("?")[0] }
    if (req.url == '/' || req.url == '/login.html' || (req.method == 'GET' && extname(req.url) != '.html')) return next()
    
    let activeCookies = importJSON('active.cookies.json')
    let classes = importJSON('classes.json')
    let subjects = importJSON('subjects.json')
    let scheduling = importJSON('scheduling.json')
    let users = importJSON('users.json')
    let userIDfromCookie = 0
    let i = 0
    let modified = false

    req.userInfo = {}
    if (req.headers.cookie) {
        let cookies = {}
        req.headers.cookie.split('; ').forEach(cookie => {
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
    if (req.userInfo) {
        req.userInfo.class = {}
        req.userInfo.currentSubject = {}
        if (req.userInfo.role == "student") req.userInfo.class = classes.find(e => e.students.includes(req.userInfo.userID))
        else if (req.userInfo.role == "parent" && req.userInfo.childrenIDs != undefined && req.userInfo.childrenIDs != []) {
            req.userInfo.children = []
            req.userInfo.childrenIDs.forEach(childID => {
                let child = users.find(e => e.userID == childID)
                delete child.password
                delete child.role
                child.class = classes.find(e => e.students.includes(childID))
                child.currentSubject = {}
                scheduling.forEach(connection => {
                    let now = new Date()
                    let start = new Date(`${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${connection.time.hours}:${connection.time.minutes}`)
                    let end = new Date(`${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${connection.time.hours + connection.time.duration.hours}:${connection.time.minutes + connection.time.duration.minutes}`)
                    if (connection.classID == child.class.classID && start.getTime() <= now.getTime() && end.getTime() > now.getTime() && now.getDay() == connection.time.weekDay) subjects.forEach(subject => {
                        if (subject.subjectID == connection.subjectID) child.currentSubject = subject
                    })
                })
                req.userInfo.children.push(child)
            })
            delete req.userInfo.childrenIDs
        }
        if (req.userInfo.role != "parent") scheduling.forEach(connection => {
            let now = new Date()
            let start = new Date(`${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${connection.time.hours}:${connection.time.minutes}`)
            let end = new Date(`${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${connection.time.hours + connection.time.duration.hours}:${connection.time.minutes + connection.time.duration.minutes}`)
            if (req.userInfo.role == "student") {
                if (connection.classID == req.userInfo.class.classID && start.getTime() <= now.getTime() && end.getTime() > now.getTime() && now.getDay() == connection.time.weekDay) subjects.forEach(subject => {
                    if (subject.subjectID == connection.subjectID) req.userInfo.currentSubject = subject
                })
            } else if (req.userInfo.role == "teacher") {
                if (connection.teacherID == req.userInfo.userID && start.getTime() <= now.getTime() && end.getTime() > now.getTime() && now.getDay() == connection.time.weekDay) subjects.forEach(subject => {
                    req.userInfo.class = { classID: connection.classID }
                    if (subject.subjectID == connection.subjectID) req.userInfo.currentSubject = subject
                })
                classes.forEach(clas => {
                    if (clas.classID == req.userInfo.class.classID) req.userInfo.class = clas
                })
            }
        })
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