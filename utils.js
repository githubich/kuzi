const { readFileSync, writeFileSync, existsSync } = require('fs')
random = (min,max) => {return Math.floor(Math.random()*(max-min+1)+min)}
ran16 = () => {return random(0,15).toString(16)}
newUUID =() => {return ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()+ran16()}
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