console.log("[Kuzi] Starting...")

const express = require('express') // Import & define everything
const app = express()
const { extname } = require('path')
const { readFileSync, existsSync, unlinkSync, writeFileSync } = require('fs')
const { newUUID, importJSON, saveJSON } = require('./utils')
const settings = importJSON('settings.json')

app.use(express.json()); app.use(express.urlencoded({ extended: true })); app.use(require('express-fileupload')({ uriDecodeFileNames: true, createParentPath: true, preserveExtension: 4 })); app.use(require('./middleware')) // Tell express to use the middleware I say
if (!existsSync('active.cookies.json') || readFileSync('active.cookies.json') == "") writeFileSync('active.cookies.json', JSON.stringify([])) // If the file active.cookies.json does not exist, create it

app.get('/users/:id', (req, res) => { // Search for the photo & return it, if not found, return the noone.png
	try {
		let id = req.params.id
		if (existsSync(id+'.png')) res.respond('', id+'.png', 'image/png', 200)
		else if (existsSync(id+'.jpg')) res.respond('', id+'.jpg', 'image/jpeg', 200)
		else if (existsSync(id+'.jpeg')) res.respond('', id+'.jpeg', 'image/jpeg', 200)
		else if (existsSync(id+'.webp')) res.respond('', id+'.webp', 'image/webp', 200)
		else res.respond('', 'users/noone.png', 'image/png', 200)
	} catch(e) { console.error(e) }
})
app.get('/remove_menus.css', (req, res) => {
	let content = "body {}"
	if (settings.disableAnnouncements) content = `${content}\n.announcements-action { display: none !important; }`
	if (settings.disableMarks) content = `${content}\n.marks-action { display: none !important; }`
	if (settings.disableTests) content = `${content}\n.tests-action { display: none !important; }`
	if (settings.disableResources) content = `${content}\n.resources-action { display: none !important; }`
	if (settings.disableMotivationalQuotes) content = `${content}\n.motivation-dash-block { display: none !important; } .dash-container { grid-template-areas: "events notifications" "marks marks" !important; }`
	res.respond(content, '', 'text/css', 200)
})
app.get('/', (req, res) => res.redirect("/login.html")) // Show the login if path = /
app.get('*', (req, res) => { // Return the file the user wants
	try {
		if (req.userInfo != {} || req.url === "/" || req.url === "/login" || extname(req.url) !== ".html") { // If the user is logged or if they want to log in proceed, else, alert the user
		  	if (extname(req.url) == '.json' || req.url == '/base.html' || req.url == '/403.html' || req.url == '/404.html') res.respond('', '403.html', 'text/html', 200) // If they don't have permission, don't show it
			else if (!existsSync(req.file)) res.respond('', '404.html', 'text/html', 200) // If the file doesn't exists, tell the user
			else if (existsSync(req.file)) {
				if (extname(req.url) == '.html' && req.url != '/login.html') res.respond(`${readFileSync('base.html')}\n${readFileSync(req.file)}\n</div></main></body></html>`, '', 'text/html', 200) // If the file exists, respond that, but if it's an html file and it's not the login, add the base to it
				else res.respond('', req.file, '', 200)
			} else res.respond('', '404.html', 'text/html', 404) // If nothing matched, respond a 404
		} else res.respond('<script>window.location = "/"</script>', '', 'text/html', 200) // If the user wasn't logged in, alert them
	} catch(e) { console.error(e) }
})
app.post('/login', (req, res) => {
	try {
		let users = importJSON('users.json') // Declare things
		let found = false
		let userID = 0
		users.forEach(userKey => {
			if (userKey.username == req.body.username && userKey.password == req.body.password) { // If the credentials match, found = true and userID = userKey.userID
				found = true
				userID = userKey.userID
			}
		})
		if (found) {
			let activeCookies = importJSON('active.cookies.json') // Import the active cookies and create a new session UUID
			let newSession = newUUID()
			res.respond(JSON.stringify({ session: newSession, do: 'window.location = "/dashboard.html"' }), '', 'application/json', 401) // Send the UUID to the user and save it to active.cookies.json
			activeCookies.push({ cookie: newSession, expireTime: Date.now() + 3600000, userID: userID })
			saveJSON('active.cookies.json', activeCookies)
		} else res.respond(JSON.stringify({ do: 'alert("Usuari i/o contrasenya incorrectes"); document.querySelector("#kuzi-password").value = ""' }), '', 'application/json', 401) // If after all of that, the user wasn't found, alert them
	} catch(e) { console.error(e) } // Catch any errors and print them
})
app.post('/logout', (req, res) => { // Delete the cookie from the file (log out)
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
app.post('/user/getinfo', (req, res) => { // Respond with the user info
	try {
		if (req.userInfo.userID) {
			delete req.userInfo.password // Security Patch: delete the password
			res.respond(JSON.stringify({ userInfo: req.userInfo }), '', 'application/json', 200)
		} else res.respond(JSON.stringify({ message: 'logout' }), '', 'application/json', 401) // If the user is not found, tell the client to log out
	} catch(e) { console.error(e) }
})
app.post('/user/changepicture', (req, res) => { // Grab the given file and save it to the 'users' directory
	try {
		if (existsSync(`./users/${req.userInfo.userID}.png`)) unlinkSync(`./users/${req.userInfo.userID}.png`)
		else if (existsSync(`./users/${req.userInfo.userID}.jpg`)) unlinkSync(`./users/${req.userInfo.userID}.jpg`)
		else if (existsSync(`./users/${req.userInfo.userID}.jpeg`)) unlinkSync(`./users/${req.userInfo.userID}.jpeg`)
		else if (existsSync(`./users/${req.userInfo.userID}.webp`)) unlinkSync(`./users/${req.userInfo.userID}.webp`)
		req.files.photo.mv(`./users/${req.userInfo.userID}${extname(req.files.photo.name)}`)
		res.respond('<script>alert("Foto de perfil canviada existosament"); window.history.back()</script>', '', 'text/html', 200)
	} catch(e) { console.error(e) }
})
app.post('/user/changepassword', (req, res) => { // Change the password of the user
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

app.post('/marks/get', (req, res) => { // Return placeholder JSON
	res.respond(JSON.stringify(
		[
			{
				"periodName": "1r Trimestre",
				"periodID": 1,
				"subjects": [
					{
						"subjectName": "Català",
						"subjectID": 1,
						"marks": [
							{
								"item": "Test 1",
								"mark": 90
							},
							{
								"item": "Test 2",
								"mark": 100
							},
							{
								"item": "Test 3",
								"mark": 75
							}
						]
					},
					{
						"subjectName": "Math",
						"subjectID": 2,
						"marks": [
							{
								"item": "Test 1",
								"mark": 100
							},
							{
								"item": "Test 2",
								"mark": 95
							},
							{
								"item": "Test 3",
								"mark": 85
							}
						]
					}
				]
			},
			{
				"periodName": "2n Trimestre",
				"periodID": 2,
				"subjects": [
					{
						"subjectName": "Català",
						"subjectID": 1,
						"marks": [
							{
								"item": "Test 1",
								"mark": 90
							},
							{
								"item": "Test 2",
								"mark": 100
							},
							{
								"item": "Test 3",
								"mark": 75
							}
						]
					},
					{
						"subjectName": "Math",
						"subjectID": 2,
						"marks": [
							{
								"item": "Test 1",
								"mark": 100
							},
							{
								"item": "Test 2",
								"mark": 95
							},
							{
								"item": "Test 3",
								"mark": 85
							}
						]
					}
				]
			},
			{
				"periodName": "3r Trimestre",
				"periodID": 3,
				"subjects": [
					{
						"subjectName": "Català",
						"subjectID": 1,
						"marks": [
							{
								"item": "Test 1",
								"mark": 90
							},
							{
								"item": "Test 2",
								"mark": 100
							},
							{
								"item": "Test 3",
								"mark": 75
							}
						]
					},
					{
						"subjectName": "Math",
						"subjectID": 2,
						"marks": [
							{
								"item": "Test 1",
								"mark": 100
							},
							{
								"item": "Test 2",
								"mark": 95
							},
							{
								"item": "Test 3",
								"mark": 85
							}
						]
					}
				]
			}
		]
	), '', 'application/json', 200)
})

app.listen(settings.serverPort, () => console.log(`[Kuzi] Listening on port ${settings.serverPort}`)) // Listen on the specified port