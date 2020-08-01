const { readFileSync, writeFileSync, existsSync } = require('fs')
const { finished } = require('stream')
random = (min,max) => {return Math.floor(Math.random()*(max-min+1)+min)}
ran16 = () => {return random(0,15).toString(16)}
newUUID = () => {return ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()}
importJSON = location => {
	if (!existsSync(location)) { console.warn(`[Kuzi|Warning] ${location} is empty, writing default content`); writeFileSync(location, JSON.stringify([])); return importJSON(location) }
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
	let { language } = importJSON('settings.json')
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
module.exports = { importJSON, saveJSON, newUUID, extensionToMime, importLocale, calcMark }