const { readFileSync, writeFileSync } = require('fs')
function random(min,max) {return Math.floor(Math.random()*(max-min+1)+min)}
function newUUID() {try{return random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)}catch(e){console.error(e)}}
importJSON = (location) => {
	let fileContent = readFileSync(location).toString('utf8')
	if (fileContent == "") { console.warn(`[Kuzi|Warning] ${location} is empty, writing default content`); writeFileSync(location, JSON.stringify([])); return importJSON(location) }
	else return JSON.parse(fileContent)
}
saveJSON = (file, JSONobject) => {writeFileSync(file, JSON.stringify(JSONobject, null, 4))}
function extensionToMime(ext) {
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
function importLocale() {
	let settings = importJSON('settings.json')
	let localizationStrings = eval(`importJSON('localization.json').${settings.language}`)
	let version = ""
	try {
		version = `GIT-${require('child_process').execSync('git rev-parse HEAD').toString('utf-8').slice(0,7)}`
	} catch { version = "alpha" }
	console.log(`[Kuzi] Using version ${version}`)
	return [`global.version|${version}`, ...localizationStrings]
}
module.exports = { importJSON, saveJSON, newUUID, extensionToMime, importLocale }