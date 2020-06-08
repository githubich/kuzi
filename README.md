# Kuzi
A work-in-progress open-source alternative to make a simple and reliable (high)school platform.**This software is still in alpha**, this might not work as expected or directly not work at all, in addition **it's not adviceable to use non-RFP** (Ready For Production) versions on production, since they can (and will) contain many bugs and/or security risks

## Installation 
### Install node.js and npm
For Archlinux and its derivatives: `sudo pacman -S nodejs npm`
For Debian and Ubuntu and their derivatives: `sudo apt install nodejs npm`
For macOS 10.10+: [Click here](https://nodejs.org/es/download/package-manager/#macos)
For Windows 7+ or Windows Server 2008+: [Click here](https://nodejs.org/es/download/package-manager/#windows)
For other GNU/Linux distributions: [Click here](https://nodejs.org/en/download/package-manager/)

### Install the dependencies
Install all of the dependencies for this project with `sudo npm i` (without `sudo` for Windows)

### Customizing users
There are some pre-made users, but if you want you can add yours [here](#creating-the-users)

### Setting the language and other settings
Open `settings.json` and change the values you considering modifying. There are 3 available languages: English, Catalan and Castillian Spanish

### Run the server and test
Run `sudo node server.js` (without `sudo` for Windows) and open `http://localhost/` on a web browser or click [here](http://localhost/). Log in with the most powerful pre-made user to test everything, Username: `admin.teacher`, Password: `kuzi`

## Setting up
### Creating the users
Users go in the `users.json` file. All users must follow this syntax:
```
[
    {
        "username": "admin.teacher",
        "password": "kuzi",
        "prettyName": "Admin Teacher",
        "userID": 1,
        "role": "teacher",
        "isAdmin": true
    },
    {
        "username": "nonadmin.teacher",
        "password": "kuzi",
        "prettyName": "Non-Admin Teacher",
        "userID": 2,
        "role": "teacher",
        "isAdmin": false
    },
    {
        "username": "admin.user",
        "password": "kuzi",
        "prettyName": "Admin Student",
        "userID": 3,
        "role": "student",
        "isAdmin": true
    },
    {
        "username": "nonadmin.student",
        "password": "kuzi",
        "prettyName": "Non-Admin Student",
        "userID": 4,
        "role": "student",
        "isAdmin": false
    }
]
```
Notes:
* You can create as many users as you wish
* Be sure not to repeat the user IDs

### Creating the classes
Classes go in the `classes.json` file. All classes must follow this syntax:
```
[
    {
        "classID": 1,
        "prettyName": "1st",
        "students": [ 1, 2, 3 ]
    },
    {
        "classID": 2,
        "prettyName": "2nd",
        "students": [ 4, 5, 6 ]
    },
    {
        "classID": 3,
        "prettyName": "3rd",
        "students": [ 7, 8, 9 ]
    }
]
```
Notes:
* You can create as many classes as you wish
* Be sure not to repeat the class IDs nor the user IDs

### Notes for the future
* I'll make a GUI to make managing the web simpler

### Contributing and watching progress
* [Issues](https://github.com/ezarcel/kuzi/issues/)
* [Pull requests](https://github.com/ezarcel/kuzi/pulls)
* [Projects](https://github.com/ezarcel/kuzi/projects)
