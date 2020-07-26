console.log(`[Kuzi] Starting... (${require('os').platform()} ${require('os').release()})`)

const express = require('express')
const app = express()
const { extname } = require('path')
const { readFileSync, existsSync, unlinkSync, writeFileSync, mkdirSync } = require('fs')
const { newUUID, importJSON, saveJSON } = require('./utils')
const settings = importJSON('settings.json')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('express-fileupload')({ createParentPath: true }))
app.use(require('./middleware'))

if (!existsSync('active.cookies.json') || readFileSync('active.cookies.json') == "") writeFileSync('active.cookies.json', JSON.stringify([]))
if (!existsSync('events.json') || readFileSync('events.json') == "") writeFileSync('events.json', JSON.stringify([]))
if (!existsSync('marks.json') || readFileSync('marks.json') == "") writeFileSync('marks.json', JSON.stringify([]))
if (!existsSync('tests.json') || readFileSync('tests.json') == "") writeFileSync('tests.json', JSON.stringify([]))
if (!existsSync('notifications/')) mkdirSync('notifications')
if (!existsSync('test-progress/')) mkdirSync('test-progress')
if (!existsSync('upload/')) mkdirSync('upload')
if (!existsSync('upload/messages/')) mkdirSync('upload/messages')
if (!existsSync('upload/messages/index.json') || readFileSync('upload/messages/index.json') == "") writeFileSync('upload/messages/index.json', JSON.stringify([]))
if (!existsSync('upload/resources/')) mkdirSync('upload/resources')
if (!existsSync('upload/resources/index.json') || readFileSync('upload/resources/index.json') == "") writeFileSync('upload/resources/index.json', JSON.stringify([]))



/////////////
//   GET   //
/////////////
app.get('/users/:id', (req, res) => {
	let id = req.params.id
	if (existsSync(`users/${id}.png`)) res.respond('', `users/${id}.png`, 'image/png', 200)
	else if (existsSync(`users/${id}.jpg`)) res.respond('', `users/${id}.jpg`, 'image/jpeg', 200)
	else if (existsSync(`users/${id}.jpeg`)) res.respond('', `users/${id}.jpeg`, 'image/jpeg', 200)
	else if (existsSync(`users/${id}.webp`)) res.respond('', `users/${id}.webp`, 'image/webp', 200)
	else res.respond('', 'users/noone.png', 'image/png', 200)
})
app.get('/resources/download/:uuid', (req, res) => {
	let file = importJSON('upload/resources/index.json').find(e => e.uuid == req.params.uuid)
	if (req.userInfo.userID == file.ownerID || req.userInfo.class.classID == file.classID) res.download(`upload/resources/${file.name}`, file.display.name)
	else res.respond({ message: 'not allowed' }, '', 'application/json', 403)
})
app.get('/new-test.html', (req, res) => {
	if (req.userInfo.role != "teacher") return res.respond('<script>history.back()</script>', '', 'text/html', 403)
	let scheduling = importJSON('scheduling.json')
	let tests = importJSON('tests.json')
	let i = 0
	scheduling.forEach(connection => {
		if (connection.teacherID != req.userInfo.userID) scheduling.splice(i, 1)
		i++
	})
	let schedule = scheduling[0]
	let ID = 0
	if (tests.length > 0) ID = tests[tests.length - 1].testID + 1
	tests.push({
		name: "Test",
        subjectID: schedule.subjectID,
		classID: schedule.classID,
		ownerID: req.userInfo.userID,
        testID: ID,
        startTime: { "year": 2020, "month": 7, "day": 22, "hours": 0, "minutes": 0 },
        dueTime: { "year": 2020, "month": 7, "day": 27, "hours": 23, "minutes": 59 },
		visible: false,
		questions: [
            { question: "Question 1", type: "open" },
            {
                question: "Question 2",
                type: "single-choice",
                options: [ "Choice 1", "Choice 2", "Choice 3" ],
                correctAnswer: 0,
                value: 1
            },
            {
                question: "Question 3",
                type: "multiple-choice",
                options: [
                    { text: "Choice 1", value: 1 },
                    { text: "Choice 2", value: 0 },
                    { text: "Choice 3", value: -1 }
                ]
            }
        ]
	})
	saveJSON('tests.json', tests)
	res.redirect(`/edit-test.html?ID=${ID}`)
})
app.get('/remove_menus.css', (req, res) => {
	let content = ""
	if (settings.disableAnnouncements) content = `${content}\n.announcements-action { display: none !important; }`
	if (settings.disableMarks) content = `${content}\n.marks-action { display: none !important; }`
	if (settings.disableTests) content = `${content}\n.tests-action { display: none !important; }`
	if (settings.disableResources) content = `${content}\n.resources-action { display: none !important; }`
	if (settings.disableMotivationalQuotes) content = `${content}\n.motivation-dash-block {	display: none !important; }` 
	res.respond(content, '', 'text/css', 200)
})
app.get('/', (req, res) => res.redirect("/login.html"))
app.get('*', (req, res) => {
	if ((req.userInfo && req.userInfo.userID) || req.url === "/login.html" || extname(req.url) !== ".html") {
		if ((extname(req.url) == '.json' && existsSync(`.${req.url}`)) || req.url == '/base.html' || req.url == '/403.html' || req.url == '/404.html') res.respond('', '403.html', 'text/html', 200)
		else if (existsSync(`.${req.url}`)) {
			if (extname(req.url) == '.html' && req.url != '/login.html' && req.url != '/mark-graph.html') res.respond(`${readFileSync('base.html')}\n${readFileSync(`.${req.url}`)}\n</div></main></body></html>`, '', 'text/html', 200)
			else res.respond('', `.${req.url}`, '', 200)
		} else res.respond('', '404.html', 'text/html', 404)
	} else res.redirect('/login.html')
})



//////////////
//   POST   //
//////////////

// User-related stuff
app.post('/user/login', (req, res) => {
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
		res.respond(JSON.stringify({ session: newSession }), '', 'application/json', 403)
		activeCookies.push({ cookie: newSession, expireTime: Date.now() + 3600000, userID: userID })
		saveJSON('active.cookies.json', activeCookies)
	} else res.respond(JSON.stringify({ message: 'not ok' }), '', 'application/json', 403)
})
app.post('/user/logout', (req, res) => {
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
})
app.post('/user/getInfo', (req, res) => {
	delete req.userInfo.password
	res.respond(JSON.stringify({ userInfo: req.userInfo }), '', 'application/json', 200)
})
app.post('/user/changePicture', (req, res) => {
	if (existsSync(`./users/${req.userInfo.userID}.png`)) unlinkSync(`./users/${req.userInfo.userID}.png`)
	else if (existsSync(`./users/${req.userInfo.userID}.jpg`)) unlinkSync(`./users/${req.userInfo.userID}.jpg`)
	else if (existsSync(`./users/${req.userInfo.userID}.jpeg`)) unlinkSync(`./users/${req.userInfo.userID}.jpeg`)
	else if (existsSync(`./users/${req.userInfo.userID}.webp`)) unlinkSync(`./users/${req.userInfo.userID}.webp`)
	req.files.photo.mv(`./users/${req.userInfo.userID}${extname(req.files.photo.name)}`)
	res.respond({ message: 'ok' }, '', 'application/json', 200)
})
app.post('/user/changePassword', (req, res) => {
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
	} else res.respond(JSON.stringify({ message: 'not ok' }), '', 'application/json', 403)
})

// Students
app.post('/students/marks/get', (req, res) => {
	if (req.userInfo.role != "student") return res.respond(JSON.stringify({ message: 'logout' }), '', 'application/json', 403)
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
	if (req.userInfo.role != "student") return res.respond(JSON.stringify({ message: 'logout' }), '', 'application/json', 403)
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

app.post('/students/resources/get', (req, res) => {
	let classes = importJSON('classes.json')
	let subjects = importJSON('subjects.json')
	let i = 0
	let index = importJSON('upload/resources/index.json')
	let theirFiles = []
	index.forEach(file => {
		let exists = false
		theirFiles.forEach(file2 => {
			if (file2.class.classID == file.classID && file2.subject.subjectID == file.subjectID) exists = true
		})
		if (req.userInfo.class.classID == file.classID && !exists) {
			theirFiles.push({ class: classes.find(e => e.classID == file.classID), subject: subjects.find(e => e.subjectID == file.subjectID), files: [] })
		}
	})
	theirFiles.forEach(thing => {
		index.forEach(file => {
			if (file.subjectID == thing.subject.subjectID && file.classID == thing.class.classID) {
				file.class = classes.find(e => e.classID == file.classID)
				delete file.classID
				file.subject = subjects.find(e => e.subjectID == file.subjectID)
				delete file.subjectID
				file.owner = req.userInfo
				delete file.owner.password
				delete file.ownerID
				theirFiles[i].files.push(file)
			}
		})
		i++
	})
	res.respond(JSON.stringify(theirFiles), '', 'application/json', 200)
})

app.post('/students/tests/list', (req, res) => {
	let classes = importJSON('classes.json')
	let subjects = importJSON('subjects.json')
	let tests = importJSON('tests.json')
	let theirTests = []
	tests.forEach(test => {
		if (test.classID == req.userInfo.class.classID && test.visible === true) {
			let status = 'red'
			if ((new Date(`${test.startTime.year}-${test.startTime.month}-${test.startTime.day} ${test.startTime.hours}:${test.startTime.minutes}`)).getTime() <= (new Date()).getTime() && (new Date()).getTime() <= (new Date(`${test.dueTime.year}-${test.dueTime.month}-${test.dueTime.day} ${test.dueTime.hours}:${test.dueTime.minutes}`)).getTime()) {
				status = 'green'
				if (existsSync(`test-progress/${req.userInfo.userID}/${test.testID}.json`)) {
					status = 'orange'
					if (importJSON(`test-progress/${req.userInfo.userID}/${test.testID}.json`).finished === true) status = 'blue'
				}
			}
			test.status = status
			test.subject = subjects.find(e => e.subjectID == test.subjectID)
			delete test.subjectID
			test.class = classes.find(e => e.classID == test.classID)
			delete test.classID
			theirTests.push(test)
		}
	})
	res.respond(JSON.stringify(theirTests), '', 'application/json', 200)
})
app.post('/students/tests/getQuestions', (req, res) => {
	if (req.userInfo.role != "student" ||
		!existsSync(`test-progress/${req.userInfo.userID}/${req.body.ID}.json`) ||
		importJSON(`test-progress/${req.userInfo.userID}/${req.body.ID}.json`).finished == true) return res.respond(JSON.stringify({ message: '' }), '', 'application/json', 403)
	let classes = importJSON('classes.json')
	let subjects = importJSON('subjects.json')
	let users = importJSON('users.json')
	let test = {}
	importJSON('tests.json').forEach(t => {
		if (t.classID == req.userInfo.class.classID && t.testID == req.body.ID && t.visible) test = t
	})
	test.class = classes.find(e => e.classID == test.classID)
	delete test.classID
	test.subject = subjects.find(e => e.subjectID == test.subjectID)
	delete test.subjectID
	test.owner = users.find(e => e.userID == test.ownerID)
	delete test.owner.password
	delete test.ownerID
	let i = 0
	test.questions.forEach(q => {
		if (q.type == 'single-choice') {
			test.questions[i].totalValue = test.questions[i].value
			delete test.questions[i].value
		} else if (q.type == 'multiple-choice') {
			let totalValue = 0
			q.options.forEach(o => { if (o.value > 0) totalValue += o.value })
			test.questions[i].totalValue = totalValue
		}
		delete test.questions[i].correctAnswer
		let j = 0
		if (q.type == 'multiple-choice') q.options.forEach(o => {
			delete test.questions[i].options[j].value
			j++
		})
		i++
	})
	res.respond(JSON.stringify(test), '', 'application/json', 200)
})
app.post('/students/tests/getMinimal', (req, res) => {
	if (req.userInfo.role != "student") return res.respond(JSON.stringify({ message: '' }), '', 'application/json', 403)
	let classes = importJSON('classes.json')
	let subjects = importJSON('subjects.json')
	let users = importJSON('users.json')
	let test = {}
	importJSON('tests.json').forEach(t => {
		if (t.classID == req.userInfo.class.classID && t.testID == req.body.ID && t.visible) test = t
	})
	test.class = classes.find(e => e.classID == test.classID)
	delete test.classID
	test.subject = subjects.find(e => e.subjectID == test.subjectID)
	delete test.subjectID
	test.owner = users.find(e => e.userID == test.ownerID)
	delete test.owner.password
	delete test.ownerID
	let qs = [ ...test.questions ]
	test.questions = []
	qs.forEach(() => test.questions.push(0))
	res.respond(JSON.stringify(test), '', 'application/json', 200)
})
app.post('/students/tests/getProgress', (req, res) => {
	if (req.userInfo.role != "student") return res.respond(JSON.stringify({ message: '' }), '', 'application/json', 403)
	if (!existsSync('test-progress/')) mkdirSync('test-progress')
	if (!existsSync(`test-progress/${req.userInfo.userID}`)) mkdirSync(`test-progress/${req.userInfo.userID}`)
	if (existsSync(`test-progress/${req.userInfo.userID}/${req.body.ID}.json`) && readFileSync(`test-progress/${req.userInfo.userID}/${req.body.ID}.json`) != '') res.respond(JSON.stringify(importJSON(`test-progress/${req.userInfo.userID}/${req.body.ID}.json`).progress), '', 'application/json', 200)
	else res.respond({ message: 'not started' }, '', 'application/json', 200)
})
app.post('/students/tests/start', (req, res) => {
	if (req.userInfo.role != "student") return res.respond(JSON.stringify({ message: '' }), '', 'application/json', 403)
	let test = importJSON('tests.json').find(e => e.testID == req.body.ID)
	if ((new Date(`${test.startTime.year}-${test.startTime.month}-${test.startTime.day} ${test.startTime.hours}:${test.startTime.minutes}`)).getTime() <= (new Date()).getTime() && (new Date()).getTime() <= (new Date(`${test.dueTime.year}-${test.dueTime.month}-${test.dueTime.day} ${test.dueTime.hours}:${test.dueTime.minutes}`)).getTime()) {}
	else return res.respond(JSON.stringify({ message: '' }), '', 'application/json', 403)
	if (!existsSync('test-progress/')) mkdirSync('test-progress')
	if (!existsSync(`test-progress/${req.userInfo.userID}`)) mkdirSync(`test-progress/${req.userInfo.userID}`)
	saveJSON(`test-progress/${req.userInfo.userID}/${req.body.ID}.json`, JSON.stringify({ progress: [], finished: false }))
	res.respond({ message: 'ok' }, '', 'application/json', 200)
})
app.post('/students/tests/save', (req, res) => {
	if (req.userInfo.role != "student") return res.respond(JSON.stringify({ message: '' }), '', 'application/json', 403)
	saveJSON(`test-progress/${req.userInfo.userID}/${req.body.ID}.json`, { progress: req.body.progress, finished: req.body.finish })
	res.respond({ message: 'ok' }, '', 'application/json', 200)
})

// Teachers
app.post('/teachers/marks/create', (req, res) => {
	if (req.userInfo.role != "teacher") return res.respond(JSON.stringify({ message: '' }), '', 'application/json', 403)
	let marks = importJSON('marks.json')
	req.body.markID = marks.length
	marks.push(req.body)
	saveJSON('marks.json', marks)
	req.body.marks.forEach(mark => {
		let notifications = importJSON(`notifications/${mark.studentID}.json`)
		notifications.push({ title: "[{(notification.newMark)}]", details: `${req.body.name}: ${mark.mark}%`, action: `window.location = "/marks.html?highlightID=${req.body.markID}"` })
		saveJSON(`notifications/${mark.studentID}.json`, notifications)
	})
	res.respond({ message: 'ok' }, '', 'application/json', 200)
})

app.post('/teachers/getInfo', (req, res) => {
	if (req.userInfo.role != "teacher") return res.respond(JSON.stringify({ message: '' }), '', 'application/json', 403)
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

app.post('/teachers/resources/upload', (req, res) => {
	if (req.userInfo.role != "teacher") return res.respond(JSON.stringify({ message: '' }), '', 'application/json', 403)
	req.body = JSON.parse(req.body.data)
	if (!req.files || !req.files.file || !req.body.classID || !req.body.subjectID) return res.respond({ message: 'unknown error' }, '', 'application/json', 500)
	let file = req.files.file
	let uuid = newUUID()
	let fileName = `${uuid}${file.name.slice(req.files.file.name.indexOf('.'), file.name.length)}`
	let index = importJSON('upload/resources/index.json')
	index.push({
		uuid: uuid,
		name: fileName,
		ownerID: req.userInfo.userID,
		classID: req.body.classID,
		subjectID: req.body.subjectID,
		display: {
			name: file.name,
			byteSize: file.size
		}
	})
	saveJSON('upload/resources/index.json', index)
	file.mv(`upload/resources/${fileName}`)
	res.respond({ message: 'ok' }, '', 'application/json', 200)
})
app.post('/teachers/resources/get', (req, res) => {
	if (req.userInfo.role != "teacher") return res.respond(JSON.stringify({ message: '' }), '', 'application/json', 403)
	let classes = importJSON('classes.json')
	let subjects = importJSON('subjects.json')
	let i = 0
	let index = importJSON('upload/resources/index.json')
	let theirFiles = []
	index.forEach(file => {
		let exists = false
		theirFiles.forEach(file2 => {
			if (file2.class.classID == file.classID && file2.subject.subjectID == file.subjectID) exists = true
		})
		if (req.userInfo.userID == file.ownerID && !exists) {
			theirFiles.push({ class: classes.find(e => e.classID == file.classID), subject: subjects.find(e => e.subjectID == file.subjectID), files: [] })
		}
	})
	theirFiles.forEach(thing => {
		index.forEach(file => {
			if (file.subjectID == thing.subject.subjectID && file.classID == thing.class.classID) {
				file.class = classes.find(e => e.classID == file.classID)
				delete file.classID
				file.subject = subjects.find(e => e.subjectID == file.subjectID)
				delete file.subjectID
				file.owner = req.userInfo
				delete file.owner.password
				delete file.ownerID
				theirFiles[i].files.push(file)
			}
		})
		i++
	})
	res.respond(JSON.stringify(theirFiles), '', 'application/json', 200)
})
app.post('/teachers/resources/delete', (req, res) => {
	if (req.userInfo.role != "teacher") return res.respond(JSON.stringify({ message: '' }), '', 'application/json', 403)
	let index = importJSON('upload/resources/index.json')
	unlinkSync(`upload/resources/${index.find(e => e.uuid == req.body.uuid).name}`)
	index.splice(index.findIndex(e => e.uuid == req.body.uuid), 1)
	saveJSON('upload/resources/index.json', index)
	res.respond({ message: 'ok' }, '', 'application/json', 200)
})

app.post('/teachers/tests/get', (req, res) => {
	if (req.userInfo.role != "teacher") return res.respond(JSON.stringify({ message: '' }), '', 'application/json', 403)
	let test = {}
	importJSON('tests.json').forEach(t => {
		if (t.ownerID == req.userInfo.userID && t.testID == req.body.ID) test = t
	})
	res.respond(JSON.stringify(test), '', 'application/json', 200)
})
app.post('/teachers/tests/list', (req, res) => {
	if (req.userInfo.role != "teacher") return res.respond(JSON.stringify({ message: '' }), '', 'application/json', 403)
	let classes = importJSON('classes.json')
	let subjects = importJSON('subjects.json')
	let tests = importJSON('tests.json')
	let theirTests = []
	tests.forEach(test => {
		if (test.ownerID == req.userInfo.userID) {
			test.subject = subjects.find(e => e.subjectID == test.subjectID)
			delete test.subjectID
			test.class = classes.find(e => e.classID == test.classID)
			delete test.classID
			theirTests.push(test)
		}
	})
	res.respond(JSON.stringify(theirTests), '', 'application/json', 200)
})
app.post('/teachers/tests/edit', (req, res) => {
	if (req.userInfo.role != "teacher") return res.respond(JSON.stringify({ message: '' }), '', 'application/json', 403)
	let tests = importJSON('tests.json')
	let editIndex = tests.findIndex(e => e.testID == req.body.testID)
	if (tests[editIndex].ownerID == req.userInfo.userID) {
		tests[editIndex] = req.body
		saveJSON('tests.json', tests)
		res.respond(JSON.stringify({ message: 'ok' }), '', 'application/json', 200)
	} else res.respond(JSON.stringify({ message: 'not allowed' }), '', 'application/json', 403)
})
app.post('/teachers/tests/delete', (req, res) => {
	if (req.userInfo.role != "teacher") return res.respond(JSON.stringify({ message: '' }), '', 'application/json', 403)
	let tests = importJSON('tests.json')
	if (tests.find(e => e.testID == req.body.ID).ownerID == req.userInfo.userID) {
		tests.splice(req.body.ID, 1)
		saveJSON('tests.json', tests)
		res.respond(JSON.stringify({ message: 'ok' }), '', 'application/json', 200)
	} else res.respond(JSON.stringify({ message: 'not allowed' }), '', 'application/json', 200)
})
app.post('/teachers/tests/setVisibility', (req, res) => {
	let tests = importJSON('tests.json')
	let editIndex = tests.findIndex(e => e.testID == req.body.ID)
	if (tests[editIndex].ownerID == req.userInfo.userID) {
		tests[editIndex].visible = req.body.set
		saveJSON('tests.json', tests)
		res.respond(JSON.stringify({ message: 'ok' }), '', 'application/json', 200)
	} else res.respond(JSON.stringify({ message: 'not allowed' }), '', 'application/json', 403)
})

// Misc
app.post('/misc/periods/list', (req, res) => {
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
})

app.post('/misc/notifications/get', (req, res) => {
	let content = JSON.stringify(importJSON(`notifications/${req.userInfo.userID}.json`))
	let locales = eval(`importJSON('localization.json').${settings.language}`)
	locales.forEach(locale => content = content.split(`[{(${locale.split('|')[0]})}]`).join(locale.split('|')[1]))
	res.respond(content, '', 'application/json', 200)
})
app.post('/misc/notifications/discard', (req, res) => {
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

app.post('/misc/events/create', (req, res) => {
	let events = importJSON('events.json')
	req.body.owner = req.userInfo.userID
	if (req.userInfo.role == "student") delete req.body.visibleTo
	else delete req.body.teacherMode
	if (events == []) req.body.eventID = 0
	else req.body.eventID = events[events.length - 1].eventID + 1
	events.push(req.body)
	saveJSON('events.json', events)
	res.respond(JSON.stringify({ message: 'ok' }), '', 'application/json', 200)
})
app.post('/misc/events/get', (req, res) => {
	let events = importJSON('events.json')
	let theirEvents = []
	let found = false
	let now = new Date()
	let i = 0
	events.forEach(event => {
		let eventDate = new Date(`${event.date.year}-${event.date.month}-${event.date.day}`)
		eventDate.setHours(23); eventDate.setMinutes(59); eventDate.setSeconds(59); eventDate.setMilliseconds(999)
		if (now.getTime() <= eventDate.getTime() && (event.owner == req.userInfo.userID || (event.visibleTo && event.visibleTo.findIndex(user => user == req.userInfo.userID) != -1))) {
			found = false
			i = 0
			event.owner = importJSON('users.json').find(user => user.userID == event.owner)
			delete event.owner.password
			if (event.visibleTo) {
				event.visibleTo.forEach(u => {
					event.visibleTo[i] = importJSON('users.json').find(user => user.userID == event.visibleTo[i])
					delete event.visibleTo[i].password
					i++
				})
			}
			theirEvents.forEach(tEvent => {
				if (tEvent.date.year == event.date.year && tEvent.date.month == event.date.month && tEvent.date.day == event.date.day) {
					found = true
					let event2 = Object.assign({}, event)
					delete event2.date
					theirEvents[i].events.push(event2)
				}
				i++
			})
			if (!found) {
				let event2 = Object.assign({}, event)
				delete event2.date
				theirEvents.push({ date: event.date, events: [ event2 ] })
			}
		}
	})
	res.respond(JSON.stringify(theirEvents), '', 'application/json', 200)
})
app.post('/misc/events/details', (req, res) => {
	let event = importJSON('events.json').find(event => event.eventID == req.body.eventID)
	event.owner = importJSON('users.json').find(user => user.userID == event.owner)
	delete event.owner.password
	if (event.visibleTo) {
		let i = 0
		event.visibleTo.forEach(u => {
			event.visibleTo[i] = importJSON('users.json').find(user => user.userID == event.visibleTo[i])
			delete event.visibleTo[i].password
			i++
		})
	}
	if (event.owner.userID == req.userInfo.userID || (event.visibleTo && event.visibleTo.findIndex(user => user.userID == req.userInfo.userID) != -1)) res.respond(JSON.stringify(event), '', 'application/json', 200)
	else res.respond(JSON.stringify({ message: 'not allowed' }), '', 'application/json', 403)
})
app.post('/misc/events/delete', (req, res) => {
	let event = importJSON('events.json').find(event => event.eventID == req.body.eventID)
	event.owner = importJSON('users.json').find(user => user.userID == event.owner)
	if (req.userInfo.userID == event.owner.userID) {
		let events = importJSON('events.json')
		events.splice(events.findIndex(eventF => event.eventID == eventF.eventID), 1)
		saveJSON('events.json', events)
		res.respond(JSON.stringify({ message: 'ok' }), '', 'application/json', 200)
	} else res.respond(JSON.stringify({ message: 'not allowed' }), '', 'application/json', 403)
})
app.post('/misc/events/edit', (req, res) => {
	let events = importJSON('events.json')
	let eventIndex = events.findIndex(event => event.eventID == req.body.eventID)
	if (req.userInfo.userID == events[eventIndex].owner) {
		events[eventIndex].name = req.body.name
		events[eventIndex].description = req.body.description
		events[eventIndex].date.year = parseInt(req.body.date.split('-')[0])
		events[eventIndex].date.month = parseInt(req.body.date.split('-')[1])
		events[eventIndex].date.day = parseInt(req.body.date.split('-')[2])
		saveJSON('events.json', events)
		res.respond(JSON.stringify({ message: 'ok' }), '', 'application/json', 200)
	} else res.respond(JSON.stringify({ message: 'not allowed' }), '', 'application/json', 403)
})

app.post('/misc/schedule/get', (req, res) => {
	let classes = importJSON('classes.json')
	let scheduling = importJSON('scheduling.json')
	let subjects = importJSON('subjects.json')
	let theirScheduling = []
	let users = importJSON('users.json')
	let i = 0
	scheduling.forEach(connection => {
		if (req.userInfo.role == "student" && req.userInfo.class.classID == connection.classID) theirScheduling.push(connection)
		if (req.userInfo.role == "teacher" && req.userInfo.userID == connection.teacherID) theirScheduling.push(connection)
	})
	theirScheduling.forEach(c => {
		theirScheduling[i].subject = subjects.find(e => e.subjectID == c.subjectID)
		delete theirScheduling[i].subjectID
		theirScheduling[i].class = classes.find(e => e.classID == c.classID)
		delete theirScheduling[i].classID
		theirScheduling[i].teacher = users.find(e => e.userID == c.teacherID)
		delete theirScheduling[i].teacher.password
		delete theirScheduling[i].teacherID
		i++
	})
	res.respond(JSON.stringify(theirScheduling), '', 'application/json', 200)
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