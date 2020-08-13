const { readFileSync, writeFileSync, existsSync } = require('fs')
importJSON = location => {
	if (!existsSync(location) || readFileSync(location) == '') { console.warn(`[Kuzi|Warning] ${location} is empty/is empty, writing default content`); writeFileSync(location, JSON.stringify([])); return importJSON(location) }
	else return JSON.parse(readFileSync(location).toString('utf8'))
}
saveJSON = (file, JSONobject) => writeFileSync(file, JSON.stringify(JSONobject, null, 4))
extensionToMime = ext => {
	if (ext.slice(0,2) == "./") ext = ext.slice(ext.lastIndexOf('.'), ext.length)
	if (ext == ".jpg" || ext == ".jpeg") return 'image/jpeg'
	else if (ext == ".png") return 'image/png'
	else if (ext == ".webp") return 'image/webp'
	else if (ext == '.js') return 'text/javascript'
	else if (ext == '.css') return 'text/css'
	else if (ext == '.webp') return 'image/webp'
	else if (ext == '.ico') return 'image/x-icon'
	else return 'text/html'
}
importLocale = () => {
	let { language = 'en' } = existsSync('settings.json') ? importJSON('settings.json') : {}
	let localizationStrings = importJSON('localization.json')[language]
	let version = `GIT-${require('child_process').execSync('git rev-parse HEAD').toString('utf-8').slice(0,7)}`
	console.log(`[Kuzi] Using Kuzi ${version}`)
	return [`global.version|${version}`, ...localizationStrings]
}
calcMark = (testID, studentID) => {
	if (testID == undefined || studentID == undefined) return
	let progress = importJSON(`test-progress/${studentID}/${testID}.json`)
	let answers = progress.progress || undefined
	let test = importJSON('tests.json').find(e => e.testID == testID)
	let corrections = test.questions
	if (answers == undefined || corrections == undefined || test == undefined) return

	let canBePerformed = ((new Date(`${test.startTime.year}-${test.startTime.month}-${test.startTime.day} ${test.startTime.hours}:${test.startTime.minutes}`)).getTime() <= (new Date()).getTime() && (new Date()).getTime() <= (new Date(`${test.dueTime.year}-${test.dueTime.month}-${test.dueTime.day} ${test.dueTime.hours}:${test.dueTime.minutes}`)).getTime())
	let definitive = true
	let i = 0
	let mark = 0

	corrections.forEach(correction => {
		if (correction.type == 'single-choice') { if (correction.correctAnswer == answers[i]) mark += correction.value
		} else if (correction.type == 'multiple-choice') {
			let j = 0
			correction.options.forEach(o => {
				if (answers[i].includes(j)) mark += o.value
				j++
			})
		} else if (correction.type == 'open' && typeof answers[i] == 'string') definitive = false
		else if (correction.value) mark += correction.value
		i++
	})
	if (definitive === true) canBePerformed = false

	return { canBePerformed: canBePerformed, definitive: definitive, finished: progress.finished, mark: mark }
}
sortByPrettyName = (a, b) => {
	if (a.prettyName.toLowerCase() > b.prettyName.toLowerCase()) return 1
	else if (a.prettyName.toLowerCase() < b.prettyName.toLowerCase()) return -1
	return 0
}
createNotification = ({ message, description, userID, forParentsToo, actions = undefined }) => {
	let timeStamp = (new Date()).getTime()
	let notifications = importJSON(`notifications/${userID}.json`)
	let notification = { message: message, description: description, timeStamp: timeStamp }
	if (notifications[notifications.length - 1]) notification.notificationID = notifications[notifications.length - 1].notificationID + 1
	else notification.notificationID = 0
	if (actions) notification.actions = actions
	saveJSON(`notifications/${userID}.json`, [ ...notifications, notification ])

	if (forParentsToo === true) {
		let parents = []
		let users = importJSON('users.json')
		users.forEach(user => {
			if (user.role == 'parent' && user.childrenIDs.includes(userID)) parents.push(user.userID)
		})
		parents.forEach(parent => {
			let notifications = importJSON(`notifications/${parent}.json`)
			if (notifications[notifications.length - 1]) notification.notificationID = notifications[notifications.length - 1].notificationID + 1
			else notification.notificationID = 0
			saveJSON(`notifications/${parent}.json`, [ ...notifications, notification ])
		})
	}
}
module.exports = { importJSON, saveJSON, extensionToMime, importLocale, calcMark, sortByPrettyName, createNotification }