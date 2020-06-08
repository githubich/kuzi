// Import libraries, define everything, import the settings and localization and get the version
console.log("Starting Kuzi...")

const express = require('express')
const server = express()
const { extname } = require('path')
const { readFileSync, existsSync, unlinkSync } = require('fs')
const { newUUID, importJSON, saveJSON, extensionToMime } = require('./utils')
const middleware = require('./middleware')
const settings = importJSON('settings.json', "Download the default settings from https://github.com/ezarcel/kuzi")
var localizationStrings = eval(`importJSON('localization.json').${settings.language}`)
var version = `GIT-${require('child_process').execSync('git rev-parse HEAD').toString('utf-8').slice(0,7)}`
//version = "1.0" Hahaha, some day...
console.log(`Using version ${version}`)
localizationStrings.push(`global.version|${version}`)

// Tell express to use the middleware I say
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(require('express-fileupload')({ uriDecodeFileNames: true, createParentPath: true, preserveExtension: 4 }))
server.use(middleware.utils)
server.use(middleware.log)

// Return the file the user wants
server.get('*', (req, res) => {
	try {
		// Define variables
		let activeCookies = importJSON('active.cookies.json', [])
		let found = false
		let session = req.cookies.session
		var resFile = ''
		var resStatus = 200
		var resContent = ''
		var resMime = ''

		// Set found to true if the user is logged in and the cookie is not expired
		activeCookies.forEach(cookie => {
			if (cookie.cookie == session && parseInt(cookie.expireTime) > parseInt(Date.now())) {
				found = true
			}
		})

		// If the user meets the previous criteria or if they want to log in proceed, else, alert the user
		if (found || req.url === "/" || req.url === "/login.html" || extname(req.url) !== ".html") {
			try {
				// Rename stuff depending on if they have a question mark
				if (req.url.includes("?")) {
					req.fullUrl = req.url.split().join()
					req.url = req.url.slice(0,req.url.indexOf("?"))
					req.file = req.file.slice(0,req.file.indexOf("?"))
				}

				if (req.url == '/') {
					// Show the login if path = /
					resFile = 'login.html'
				} else if (req.url.slice(0,7) == "/users/") {
					// If the user is asking for a user photo, search it with different extensions and respond with it
					if (existsSync(req.file+'.png')) resFile = req.file+'.png'
					else if (existsSync(req.file+'.jpg')) resFile = req.file+'.jpg'
					else if (existsSync(req.file+'.jpeg')) resFile = req.file+'.jpeg'
					else if (existsSync(req.file+'.webp')) resFile = req.file+'.webp'
					else resFile = 'users/noone.webp'
					resMime = extensionToMime(resFile)
				} else if (!existsSync(req.file)) {
					// If the file doesn't exists, tell the user
					resFile = '404.html'
					resStatus = 404
				} else if (!req.userInfo.isAdmin && (extname(req.url) == '.json' || req.url == '/base.html' || req.url == '/403.html' || req.url == '/404.html')) {
					// If they don't have permission to see the file, do not allow the user to do that
					resFile = '403.html'
					resStatus = 403
				} else if (existsSync(req.file)) {
					// If the file exists, respond that, but if it's an html file and it's not the login, add the base to it
					if (extname(req.url) == '.html' && req.url != '/login.html') {
						resContent = readFileSync('base.html')+'\n'+readFileSync(req.file)+'\n</div></main></body></html>'
					} else resFile = req.file
				} else {
					// If nothing matched, respond a 404
					resFile = '404.html'
					resStatus = 404
				}
			} catch(e) {
				// Catch any errors and print them, also scare the user :D
				console.error(e)
				resContent = e
			}
		} else {
			// If the user wasn't logged in, alert them
			resContent = '<script>alert("login.error.notloggedin"); window.location = "/"</script>'
		}
	} catch(e) {
		// Catch any errors and print them x2
		console.error(e)
		res.status(500).send()
	}
	// Manage the extensions, the Mime Type and the content, and respond that
	if (resContent) resMime = 'text/html'
	if (!resContent && existsSync(resFile)) resContent = readFileSync(resFile)
	if (!resMime && resFile) resMime = extensionToMime(resFile)
	if ((resMime == "text/html" || resMime == "text/javascript") && !req.url.includes('/users/')) {
		resContent = resContent.toString('utf8')
		localizationStrings.forEach(localizationString => {
			resContent = resContent.split(localizationString.split('|')[0]).join(localizationString.split('|')[1])
		})
	}
	res.setHeader('Content-Type', resMime)
	res.write(resContent)
	res.status(200).send()
})

server.post('/login', (req, res) => {
	try {
		// Declare things
		let users = importJSON('users.json', [])
		let found = false
		let userID = 0
		users.forEach(userKey => {
			if (userKey.username == req.body.username && userKey.password == req.body.password) {
				// If the credentials match, found = true and userID = userKey.userID
				found = true
				userID = userKey.userID
			}
		})
		if (found) {
			// Import the active cookies and create a new session UUID
			let activeCookies = importJSON('active.cookies.json', [])
			let newSession = newUUID()

			// Send the UUID to the user and save the UUID to active.cookies.json
			res.status(200).send(JSON.stringify({ session: newSession, do: 'window.location = "/dashboard.html"' }))
			activeCookies.push({ cookie: newSession, expireTime: Date.now() + 3600000, userID: userID })
			saveJSON('active.cookies.json', activeCookies)
		} else {
			// If after all of that, the user wasn't found, alert them
			res.status(401).send(JSON.stringify({ do: 'alert("Usuari i/o contrasenya incorrectes");document.querySelector("#kuzi-password").value=""' }))
		}
	} catch(e) {
		// Catch any errors and print them
		console.error(e)
		res.status(500).send()
	}
})
server.post('/logout', (req, res) => {
	// Delete the cookie from the file and send 200 OK
	let activeCookies = importJSON('active.cookies.json',[])
	let i = 0
	activeCookies.forEach(cookie => {
		if (cookie.cookie == req.cookies.session) {
			activeCookies.splice(i,1)
			saveJSON('active.cookies.json', activeCookies)
		}
		i++
	})
	res.status(200).send()
})
server.post('/user/getinfo', (req, res) => {
	// Respond with the user info
	try {
		if (req.userInfo.userID) {
			// Security Patch: replace the password with a little message ;)
			req.userInfo.password = "Nice Try!"
			res.status(200).send(JSON.stringify({ userInfo: req.userInfo }))
		} else {
			// If the user is not found, tell the client to log out
			res.status(401).send(JSON.stringify({ message: 'logout' }))
		}
	} catch(e) {
		// Catch any errors and print them
		console.error(e)
		res.status(500).send()
	}
})
server.post('/user/changeprofilepicture', (req, res) => {
	// Grab the given file and save it to the 'users' directory
	try {
		if (req.files == undefined || req.files.photo == undefined) {
			res.write('<script>alert("E500: Internal Server Error"); window.history.back()</script>')
		} else {
			if (!req.userInfo.userID) throw Error()
			if (existsSync(`./users/${req.userInfo.userID}.png`)) unlinkSync(`./users/${req.userInfo.userID}.png`)
			else if (existsSync(`./users/${req.userInfo.userID}.jpg`)) unlinkSync(`./users/${req.userInfo.userID}.jpg`)
			else if (existsSync(`./users/${req.userInfo.userID}.jpeg`)) unlinkSync(`./users/${req.userInfo.userID}.jpeg`)
			else if (existsSync(`./users/${req.userInfo.userID}.webp`)) unlinkSync(`./users/${req.userInfo.userID}.webp`)
			req.files.photo.mv(`./users/${req.userInfo.userID}${extname(req.files.photo.name)}`)
			res.write('<script>alert("Foto de perfil canviada existosament"); window.history.back()</script>')
		}
	} catch(e) {console.error(e); res.write('<script>alert("E500: Internal Server Error"); window.history.back()</script>')}
})
server.post('/user/changepassword', (req, res) => {
	// NOT IMPLEMENTED!!!
	try {
		let users = importJSON('users.json')
		let changed = false
		let i = 0
		users.forEach((userKey) => {
			if (userKey.userID == req.body.userID && userKey.password == req.body.oldpassword) {
				changed = true
				userID = userKey.userID
				users[i].password = req.body.newpassword
			}
			i++
		})
		if (changed) {
			res.status(200).send(JSON.stringify({ do: `alert('Contrasenya canviada correctament');document.querySelector("#kuzi-password").value="";document.querySelector("#kuzi-newpassword").value="";document.querySelector("#kuzi-newpassword2").value=""` }))
		} else {
			res.status(401).send(JSON.stringify({ do: 'alert("Contrasenya incorrecte");document.querySelector("#kuzi-password").value="";document.querySelector("#kuzi-newpassword").value="";document.querySelector("#kuzi-newpassword2").value=""' }))
		}
	} catch(e) {
		console.error(e)
		res.status(500).send()
	}
})
server.listen(settings.serverPort, () => {
	console.log(`[Kuzi] Listening on port ${settings.serverPort}`)
})