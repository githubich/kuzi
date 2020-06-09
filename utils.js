// Import everything
const { extname } = require('path')
const { readFileSync, writeFileSync, existsSync } = require('fs')

// Function for generating a random number within a range
function random(min,max) {return Math.floor(Math.random()*(max-min+1)+min)}

// Function to create a UUID
function newUUID() {try{return random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)+random(0,15).toString(16)}catch(e){console.error(e)}}

// Function to import JSON files and parse them
importJSON = (location, createContent) => {
	if (!createContent) createContent = []
	if (!existsSync(location)) writeFileSync(location, JSON.parse(createContent))
	let fileContent = readFileSync(location).toString('utf8')
	if (fileContent == "") throw Error(`${location} is empty, try typing [] or {}`)
	else return JSON.parse(fileContent)
}

// Function to save JSON files with the formatting I want
saveJSON = (file, JSONobject) => writeFileSync(file, JSON.stringify(JSONobject, null, 4))

// Function to convert the extension of a file to its Mime Type
function extensionToMime(ext) {
	if (ext.slice(0,1) != ".") ext = extname(ext)
	if (ext == ".jpg" || ext == ".jpeg") return 'image/jpeg'
	else if (ext == ".png") return 'image/png'
	else if (ext == ".webp") return 'image/webp'
	else if (ext == '.js') return 'text/javascript'
	else if (ext == '.css') return 'text/css'
	else if (ext == '.webp') return 'image/webp'
	else if (ext == '.ico') return 'image/x-icon'
	else return 'text/html'
}

// Parse localization.json and add the version
function importLocale() {
	let settings = importJSON('settings.json', "")
	let localizationStrings = eval(`importJSON('localization.json').${settings.language}`)
	try {
		var version = `GIT-${require('child_process').execSync('git rev-parse HEAD').toString('utf-8').slice(0,7)}`
	} catch {}
	//version = "1.0" Hahaha, some day...
	console.log(`Using version ${version}`)
	return [`global.version|${version}`, ...localizationStrings]
}

// Export what I need
module.exports = { importJSON, saveJSON, newUUID, extensionToMime, importLocale }