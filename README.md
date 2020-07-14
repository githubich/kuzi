# Kuzi
A work-in-progress open-source alternative to make a simple and reliable (high)school platform. **This software is still in development**, this might won't work as expected or not work at all, in addition **it's not adviceable to use non-RFP** (Ready For Production) versions on production, since they may contain bugs and/or security risks

## Installation 
### Install node.js and npm
For Arch Linux and its derivatives: `sudo pacman -S nodejs npm`  
For Debian and Ubuntu and their derivatives: `sudo apt install nodejs npm`  
For macOS 10.10+: [Click here](https://nodejs.org/es/download/package-manager/#macos)  
For Windows 7+ or Windows Server 2008+: [Click here](https://nodejs.org/es/download/package-manager/#windows). When using Windows, remove `sudo` in the commands shown below  

### Install the dependencies
Install all of this project's dependencies with `sudo npm i`

### Customizing users
There are some pre-made users, but if you want you can add yours [here](#creating-the-users)

### Setting the language and other settings
Open `settings.json` and change the values you considering modifying. There are 3 available languages: English, Catalan and Castillian Spanish

### Run the server and test
Run `sudo node server.js` and open `http://localhost/` on a web browser or click [here](http://localhost/)

## Setting up
### Creating the users
Users go in `users.json`. For example:
```json
[
    {
        "username": "admin.teacher",
        "password": "kuzi",
        "prettyName": "Admin Teacher",
        "userID": 1,
        "role": "teacher",
        "isAdmin": true
    },
    ...
]
```
Notes:
* You can create as many users as you wish
* Be sure not to repeat the user IDs
* It's recomended to start with ID = 0

### Creating the classes
Classes go in `classes.json`. For example:
```json
[
    {
        "classID": 1,
        "prettyName": "1st",
        "students": [ 3 ]
    },
    ...
]
```
Notes:
* You can create as many classes as you wish
* Be sure not to repeat the class IDs nor the user IDs
* It's recomended to start with ID = 0

### Creating the subjects
Subjects go in `subjects.json`. For example:
```json
[
    {
        "subjectID": 1,
        "prettyName": "Catalan"
    },
    ...
]
```
Notes:
* You can create as many classes as you wish
* Be sure not to repeat the class IDs nor the user IDs
* It's recomended to start with ID = 0

### Creating a schedule
Scheduling goes in `scheduling.json`. For example:
```json
[
    {
        "subjectID": 1,
        "classID": 1,
        "teacherID": 1,
        "time": {
            "weekDay": 1,
            "hours": 9,
            "minutes": 0,
            "duration": {
                "hours": 1,
                "minutes": 0
            }
        }
    },
    ...
]
```
In this example, Catalan would be taught by Admin Teacher in the class of 1st on Monday at 9 AM for 1 hour

### Notes
I know this is guide can be hard to follow, I'll try my best to improve this procedure

### Contributing and following the progress
First, read the [contribution guide](https://github.com/ezarcel/kuzi/blob/edge/CONTRIBUTING.md#readme)
* [Issues](https://github.com/ezarcel/kuzi/issues/)
* [Pull requests](https://github.com/ezarcel/kuzi/pulls)
* [Projects](https://github.com/ezarcel/kuzi/projects)
