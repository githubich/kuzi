console.log(`[Kuzi] Starting... (${require('os').platform()} ${require('os').release()})`)

const express = require('express')
const app = express()
const expressFileUpload = require('express-fileupload')
const { extname } = require('path')
const { readFileSync, existsSync, unlinkSync, writeFileSync, mkdirSync } = require('fs')
const { newUUID, importJSON, saveJSON } = require('./utils')
const settings = importJSON('settings.json')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(expressFileUpload({ uriDecodeFileNames: true, createParentPath: true, preserveExtension: 4 }))
app.use(require('./middleware'))

if (!existsSync('active.cookies.json') || readFileSync('active.cookies.json') == "") writeFileSync('active.cookies.json', JSON.stringify([]))
if (!existsSync('events.json') || readFileSync('events.json') == "") writeFileSync('events.json', JSON.stringify([]))
if (!existsSync('marks.json') || readFileSync('marks.json') == "") writeFileSync('marks.json', JSON.stringify([]))
if (!existsSync('notifications/')) mkdirSync('notifications')



/////////////
//   GET   //
/////////////
app.get('/users/:id', (req, res) => {
	try {
		let id = req.params.id
		if (existsSync(`users/${id}.png`)) res.respond('', `users/${id}.png`, 'image/png', 200)
		else if (existsSync(`users/${id}.jpg`)) res.respond('', `users/${id}.jpg`, 'image/jpeg', 200)
		else if (existsSync(`users/${id}.jpeg`)) res.respond('', `users/${id}.jpeg`, 'image/jpeg', 200)
		else if (existsSync(`users/${id}.webp`)) res.respond('', `users/${id}.webp`, 'image/webp', 200)
		else res.respond('', 'users/noone.png', 'image/png', 200)
	} catch(e) { console.error(e) }
})
app.get('/remove_menus.css', (req, res) => {
	let content = "body {}"
	if (settings.disableAnnouncements) content = `${content}\n.announcements-action { display: none !important; }`
	if (settings.disableMarks) content = `${content}\n.marks-action { display: none !important; }`
	if (settings.disableTests) content = `${content}\n.tests-action { display: none !important; }`
	if (settings.disableResources) content = `${content}\n.resources-action { display: none !important; }`
	if (settings.disableMotivationalQuotes) content = `${content}\n.motivation-dash-block {	display: none !important; }	.dash-container { display: grid; gap: 20px; grid-template-areas: "marks marks events notifications" !important; } @media (max-width: 800px) { .dash-container { grid-template-areas: "events notifications" "marks marks" !important; } } @media (max-width: 600px) { .dash-container { grid-template-areas: "events" "notifications" "marks" !important; } }`
	res.respond(content, '', 'text/css', 200)
})
app.get('/', (req, res) => res.redirect("/login.html"))
app.get('*', (req, res) => {
	try {
		if (req.userInfo != {} || req.url === "/" || req.url === "/login" || extname(req.url) !== ".html") {
		  	if ((extname(req.url) == '.json' && existsSync(`.${req.url}`)) || req.url == '/base.html' || req.url == '/403.html' || req.url == '/404.html') res.respond('', '403.html', 'text/html', 200)
			else if (existsSync(`.${req.url}`)) {
				if (extname(req.url) == '.html' && req.url != '/login.html' && req.url != '/mark-graph.html') {
					res.respond(`${readFileSync('base.html').toString('utf8').replace('[{(TITLE)}]',readFileSync(`.${req.url}`).toString('utf8').split("\n")[0])}\n${readFileSync(`.${req.url}`).toString('utf8').split("\n").splice(1,Infinity).join("\n")}\n</div></main></body></html>`, '', 'text/html', 200)
				} else res.respond('', `.${req.url}`, '', 200)
			} else res.respond('', '404.html', 'text/html', 404)
		} else res.respond('<script>window.location = "/"</script>', '', 'text/html', 200)
	} catch(e) { console.error(e) }
})



//////////////
//   POST   //
//////////////

// Common
app.post('/user/login', (req, res) => {
	try {
		let users = importJSON('users.json')
		let found = false
		let userID = 0
		users.forEach(userKey => {
			if (userKey.username == req.body.username && userKey.password == req.body.password) {
				found = true
				userID = userKey.userID
			}
		})
		if (found) {
			let activeCookies = importJSON('active.cookies.json')
			let newSession = newUUID()
			res.respond(JSON.stringify({ session: newSession }), '', 'application/json', 401)
			activeCookies.push({ cookie: newSession, expireTime: Date.now() + 3600000, userID: userID })
			saveJSON('active.cookies.json', activeCookies)
		} else res.respond(JSON.stringify({ message: 'not ok' }), '', 'application/json', 401)
	} catch(e) { console.error(e) }
})
app.post('/user/logout', (req, res) => {
	try {
		let activeCookies = importJSON('active.cookies.json')
		let i = 0
		activeCookies.forEach(cookie => {
			if (cookie.cookie == req.cookies.session) {
				activeCookies.splice(i, 1)
				saveJSON('active.cookies.json', activeCookies)
			}
			i++
		})
		res.respond(JSON.stringify({ message: 'ok' }), '', '', 200)
	} catch(e) { console.error(e) }
})
app.post('/user/getInfo', (req, res) => {
	if (!req.userInfo) return res.respond(JSON.stringify({ message: 'logout' }), '', 'application/json', 401)
	try {
		if (req.userInfo.userID) {
			delete req.userInfo.password
			res.respond(JSON.stringify({ userInfo: req.userInfo }), '', 'application/json', 200)
		} else res.respond(JSON.stringify({ message: 'logout' }), '', 'application/json', 401)
	} catch(e) { console.error(e) }
})
app.post('/user/changePicture', (req, res) => {
	if (!req.userInfo) return res.respond(JSON.stringify({ message: 'logout' }), '', 'application/json', 401)
	try {
		if (existsSync(`./users/${req.userInfo.userID}.png`)) unlinkSync(`./users/${req.userInfo.userID}.png`)
		else if (existsSync(`./users/${req.userInfo.userID}.jpg`)) unlinkSync(`./users/${req.userInfo.userID}.jpg`)
		else if (existsSync(`./users/${req.userInfo.userID}.jpeg`)) unlinkSync(`./users/${req.userInfo.userID}.jpeg`)
		else if (existsSync(`./users/${req.userInfo.userID}.webp`)) unlinkSync(`./users/${req.userInfo.userID}.webp`)
		req.files.photo.mv(`./users/${req.userInfo.userID}${extname(req.files.photo.name)}`)
		res.respond({ message: 'ok' }, '', 'application/json', 200)
	} catch(e) { console.error(e) }
})
app.post('/user/changePassword', (req, res) => {
	if (!req.userInfo) return res.respond(JSON.stringify({ message: 'logout' }), '', 'application/json', 401)
	try {
		let users = importJSON('users.json')
		let changed = false
		let i = 0
		users.forEach(user => {
			if (user.userID == req.body.userID && user.password == req.body.oldPassword) {
				changed = true
				userID = userKey.userID
				users[i].password = req.body.newPassword
			}
			i++
		})
		if (changed) {
			res.respond(JSON.stringify({ message: 'ok' }), '', 'application/json', 200)
			saveJSON('users.json', users)
		} else res.respond(JSON.stringify({ message: 'not ok' }), '', 'application/json', 401)
	} catch(e) { console.error(e) }
})

// Students
app.post('/students/marks/get', (req, res) => {
	if (!req.userInfo || req.userInfo.role != "student") return res.respond(JSON.stringify({ message: 'logout' }), '', 'application/json', 401)
	try {
		let exists = false
		let marks = importJSON('marks.json')
		let resContent = importJSON('periods.json')
		let subjects = importJSON('subjects.json')
		let i = 0
		let j = 0

		resContent.forEach(a => {
			delete resContent[i].startDate
			delete resContent[i].endDate
			resContent[i].subjects = []
			let usefulSubjects = []
			marks.forEach(mark => {
				exists = false
				if (mark.periodID == a.periodID && mark.marks.findIndex(i => i.studentID == req.userInfo.userID) != -1) {
					usefulSubjects.forEach(usefulSubject => {
						if (mark.subjectID == usefulSubject) exists = true
					})
					if (!exists) usefulSubjects.push(mark.subjectID)
				}
			})
			j = 0
			usefulSubjects.forEach(usefulSubject => {
				resContent[i].subjects.push({ subjectID: usefulSubject, marks: [] })
				marks.forEach(mark => {
					if (mark.periodID == a.periodID && mark.subjectID == usefulSubject && mark.marks.findIndex(i => i.studentID == req.userInfo.userID) != -1) {
						let pMark = mark.marks.find(i => i.studentID == req.userInfo.userID)
						delete pMark.studentID
						pMark.name = mark.name
						pMark.markID = mark.markID
						resContent[i].subjects[j].marks.push(pMark)
					}
				})
				j++
			})
			j = 0
			resContent[i].subjects.forEach(subjectResContent => {
				subjects.forEach(subjectJSON => {
					if (subjectJSON.subjectID == subjectResContent.subjectID) resContent[i].subjects[j].subjectName = subjectJSON.prettyName
				})
				j++
			})
			i++
		})
		i = 0
		
		res.respond(JSON.stringify(resContent), '', 'application/json', 200)
	} catch(e) { console.error(e) }
})
app.post('/students/marks/graph', (req, res) => {
	if (!req.userInfo || req.userInfo.role != "student") return res.respond(JSON.stringify({ message: 'logout' }), '', 'application/json', 401)
	try {
		let exists = false
		let marks = importJSON('marks.json')
		let resContent = []
		let subjects = importJSON('subjects.json')
		let i = 0
		let usefulSubjects = []

		marks.forEach(mark => {
			exists = false
			if (mark.marks.findIndex(item => item.studentID == req.userInfo.userID) != -1) {
				usefulSubjects.forEach(usefulSubject => {
					if (mark.subjectID == usefulSubject) exists = true
				})
				if (!exists) usefulSubjects.push(mark.subjectID)
			}
		})
		i = 0
		usefulSubjects.forEach(usefulSubject => {
			resContent.push({ subjectID: usefulSubject, marks: [] })
			marks.forEach(mark => {
				if (mark.subjectID == usefulSubject && mark.marks.findIndex(item => item.studentID == req.userInfo.userID) != -1) {
					let pMark = mark.marks.find(i => i.studentID == req.userInfo.userID)
					delete pMark.studentID
					pMark.name = mark.name
					resContent[i].marks.push(pMark)
				}
			})
			i++
		})
		i = 0
		resContent.forEach(subjectResContent => {
			subjects.forEach(subjectJSON => {
				if (subjectJSON.subjectID == subjectResContent.subjectID) resContent[i].subjectName = subjectJSON.prettyName
			})
			i++
		})
		
		res.respond(JSON.stringify(resContent), '', 'application/json', 200)
	} catch(e) { console.error(e) }
})

// Teachers
app.post('/teachers/marks/create', (req, res) => {
	if (!req.userInfo || req.userInfo.role != "teacher") return res.respond(JSON.stringify({ message: '' }), '', 'application/json', 401)
	try {
		let marks = importJSON('marks.json')
		req.body.markID = marks.length
		marks.push(req.body)
		saveJSON('marks.json', marks)
		res.respond({ message: 'ok' }, '', 'application/json', 200)
		req.body.marks.forEach(mark => {
			let notifications = importJSON(`notifications/${mark.studentID}.json`)
			notifications.push({ title: "[{(notification.newMark)}]", details: `${req.body.name}: ${mark.mark}%`, action: `window.location = "/marks.html?highlightID=${req.body.markID}"` })
			saveJSON(`notifications/${mark.studentID}.json`, notifications)
		})
	} catch(e) { console.error(e) }
})
app.post('/teachers/getInfo', (req, res) => {
	if (!req.userInfo || req.userInfo.role != "teacher") return res.respond(JSON.stringify({ message: '' }), '', 'application/json', 401)
	try {
		let classes = importJSON('classes.json')
		let exists = false
		let i = 0
		let j = 0
		let k = 0
		let subjects = importJSON('subjects.json')
		let scheduling = importJSON('scheduling.json')
		let resClasses = []
		let users = importJSON('users.json')
		scheduling.forEach(connection => {
			if (connection.teacherID == req.userInfo.userID) {
				exists = false
				i = 0
				resClasses.forEach(resClass => {
					if (resClass.classID == connection.classID) {
						exists = true
						resClasses[i].subjects.push({ subjectID: connection.subjectID })
					}
					i++
				})
				if (!exists) classes.forEach(clas => {
					if (clas.classID == connection.classID) {
						resClasses.push({ classID: connection.classID, classStudents: [], subjects: [ { subjectID: connection.subjectID } ] })
						clas.students.forEach(student => resClasses[resClasses.length - 1].classStudents.push({ studentID: student }))
					}
				})
			}
		})
		i = 0
		resClasses.forEach(resClass => {
			j = 0
			k = 0
			resClass.classStudents.forEach(student => {
				users.forEach(user => {
					if (user.userID == student.studentID) resClasses[i].classStudents[k].studentName = user.prettyName
				})
				k++
			})
			classes.forEach(clas => { if (clas.classID == resClass.classID) resClasses[i].className = clas.prettyName })
			resClass.subjects.forEach(subjectFromRawClasses => {
				subjects.forEach(subject => {
					if (subject.subjectID == subjectFromRawClasses.subjectID) resClasses[i].subjects[j].subjectName = subject.prettyName
				})
				j++
			})
			i++
		})
		res.respond(JSON.stringify(resClasses), '', 'application/json', 200)
	} catch(e) { console.error(e) }
})

// Misc
app.post('/misc/periods/list', (req, res) => {
	if (!req.userInfo) return res.respond(JSON.stringify({ message: '' }), '', 'application/json', 401)
	try {
		let periods = importJSON('periods.json')
		let i = 0
		periods.forEach(period => {
			let startDate = new Date(); startDate.setMonth(period.startDate.month); startDate.setDate(period.startDate.day); startDate.setHours(0); startDate.setMinutes(0); startDate.setSeconds(0); startDate.setMilliseconds(0)
			let now = new Date()
			let endDate = new Date(); endDate.setMonth(period.endDate.month); endDate.setDate(period.endDate.day); endDate.setHours(0); endDate.setMinutes(0); endDate.setSeconds(0); endDate.setMilliseconds(0)
			if (startDate.getTime() <= now.getTime() && now.getTime() <= endDate.getTime()) { periods[i].current = true }
			i++
		})
		res.respond(JSON.stringify(periods), '', 'application/json', 200)
	} catch(e) { console.error(e) }
})
app.post('/misc/notifications/get', (req, res) => {
	if (!req.userInfo) return res.respond(JSON.stringify({ message: '' }), '', 'application/json', 401)
	try {
		let content = JSON.stringify(importJSON(`notifications/${req.userInfo.userID}.json`))
		let locales = eval(`importJSON('localization.json').${settings.language}`)
		locales.forEach(locale => content = content.split(`[{(${locale.split('|')[0]})}]`).join(locale.split('|')[1]))
		res.respond(content, '', 'application/json', 200)
	} catch(e) { console.error(e) }
})
app.post('/misc/notifications/discard', (req, res) => {
	console.log(req.body)
	if (req.body.notificationI == "all") {
		writeFileSync(`notifications/${req.userInfo.userID}.json`, JSON.stringify([]))
		res.respond(JSON.stringify({ message: 'ok' }), '', 'application/json', 200)
	} else {
		let notifications = importJSON(`notifications/${req.userInfo.userID}.json`)
		notifications.splice(req.body.notificationI, 1)
		saveJSON(`notifications/${req.userInfo.userID}.json`, notifications)
		res.respond(JSON.stringify({ message: 'ok' }), '', 'application/json', 200)
	}
})
function runAtMidnight() {
	let now = new Date()
	if (now.getHours() == 0 &&
		now.getMinutes() == 1 &&
		now.getSeconds() == 0 &&
		now.getMilliseconds() <= 10 ) {
		console.log("[Kuzi|Daily Tasks] Starting...")
		console.log("[Kuzi|Daily Tasks] Done!")
	}
	setTimeout(runAtMidnight, 10)
}
setTimeout(runAtMidnight, 0)
app.listen(settings.serverPort, () => console.log(`[Kuzi] Listening on port ${settings.serverPort}`))