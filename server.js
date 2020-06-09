console.log("Starting Kuzi...")

const express = require('express') // Import, define and import everything
const app = express()
const { extname } = require('path')
const { readFileSync, existsSync, unlinkSync } = require('fs')
const { newUUID, importJSON, saveJSON } = require('./utils')
const settings = importJSON('settings.json', "Download the default settings from https://github.com/ezarcel/kuzi")

/* Tell express to use the middleware I say */ app.use(express.json()); app.use(express.urlencoded({ extended: true })); app.use(require('express-fileupload')({ uriDecodeFileNames: true, createParentPath: true, preserveExtension: 4 })); app.use(require('./middleware'))

app.get('/users/:id', (req, res) => { // Search for the photo and return it, if not found, return the noone.png
	id = req.params.id
	if (existsSync(id+'.png')) res.respond('', id+'.png', 'image/png', 200)
	else if (existsSync(id+'.jpg')) res.respond('', id+'.jpg', 'image/jpeg', 200)
	else if (existsSync(id+'.jpeg')) res.respond('', id+'.jpeg', 'image/jpeg', 200)
	else if (existsSync(id+'.webp')) res.respond('', id+'.webp', 'image/webp', 200)
	else res.respond('', 'users/noone.png', 'image/png', 200)
})

app.get('*', (req, res) => { // Return the file the user wants
	if (req.userInfo != {} || req.url === "/" || req.url === "/login.html" || extname(req.url) !== ".html") { // If the user is logged or if they want to log in proceed, else, alert the user
			if (req.url == '/') {
				res.respond('', 'login.html', 'text/html', 200) // Show the login if path = /
			} else if (!existsSync(req.file)) {
				res.respond('', '404.html', 'text/html', 200) // If the file doesn't exists, tell the user
			} else if (extname(req.url) == '.json' || req.url == '/base.html' || req.url == '/403.html' || req.url == '/404.html') {
				res.respond('', '403.html', 'text/html', 200) // If they don't have permission to see the file, do not allow the user to do that
			} else if (existsSync(req.file)) {
				if (extname(req.url) == '.html' && req.url != '/login.html') { // If the file exists, respond that, but if it's an html file and it's not the login, add the base to it
					res.respond(readFileSync('base.html')+'\n'+readFileSync(req.file)+'\n</div></main></body></html>', '', 'text/html', 200)
				} else res.respond('', req.file, '', 200)
			} else {
				res.respond('', '404.html', 'text/html', 200) // If nothing matched, respond a 404
			}
	} else {
		res.respond('<script>alert("login.error.notloggedin"); window.location = "/"</script>', '', 'text/html', 200) // If the user wasn't logged in, alert them
	}
})

app.post('/login', (req, res) => {
	try {
		let users = importJSON('users.json', []) // Declare things
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
	} catch(e) { // Catch any errors and print them
		console.error(e)
		res.status(500).send()
	}
})
app.post('/logout', (req, res) => { // Delete the cookie from the file
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
app.post('/user/getinfo', (req, res) => { // Respond with the user info
	if (req.userInfo.userID) {
		req.userInfo.password = "Nice Try!" // Security Patch: replace the password with a little message ;)
		res.status(200).send(JSON.stringify({ userInfo: req.userInfo }))
	} else {
		res.status(401).send(JSON.stringify({ message: 'logout' })) // If the user is not found, tell the client to log out
	}
})
app.post('/user/changeprofilepicture', (req, res) => { // Grab the given file and save it to the 'users' directory
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
app.post('/user/changepassword', (req, res) => {
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
app.listen(settings.serverPort, () => console.log(`[Kuzi] Listening on port ${settings.serverPort}`))