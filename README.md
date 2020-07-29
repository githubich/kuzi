# Kuzi
 ![GitHub release (latest SemVer including pre-releases)](https://img.shields.io/github/v/release/ezarcel/kuzi?include_prereleases) ![GitHub last commit](https://img.shields.io/github/last-commit/ezarcel/kuzi) ![GitHub issues by-label](https://img.shields.io/github/issues/ezarcel/kuzi/bug)  
A work-in-progress open-source alternative to make a simple and reliable (high)school platform. **This software is still in development**, this might won't work as expected or not work at all, in addition **it's not adviceable to use non-RFP** (Ready For Production) versions on production, since they may contain bugs and/or security risks

## Installation 
### Install node.js and npm
For Arch Linux and its derivatives: `sudo pacman -S nodejs npm`  
For Debian and Ubuntu and their derivatives: `sudo apt install nodejs npm`  
For macOS 10.10+: [Click here](https://nodejs.org/es/download/package-manager/#macos)  
For Windows 7+ or Windows Server 2008+: [Click here](https://nodejs.org/es/download/package-manager/#windows). In Windows, remove `sudo` in the commands shown below  

### Install the dependencies
Install all of this project's dependencies with `sudo npm i`

### Customize the users
There are some pre-made users, but if you want you can add yours [here](#create-users)

### Set the language and other settings
Open `settings.json` and change the values you considering modifying. There are 3 available languages: English, Catalan and Castillian Spanish

### Recommended step for linux users
***Run these commands as root*** (`sudo su`)***, not as sudo***
```bash
echo 'net.ipv4.ip_unprivileged_port_start=0' > /etc/sysctl.d/50-unprivileged-ports.conf
sysctl --system
```
This allows non-root users to run any server in any port they want, since usually port 80 is locked to be used only as root.

### Run the server and test
Run `sudo node server.js` (run without `sudo` if you are on Windows or if you followed [this](#recommended-step-for-linux-users)) and open `http://localhost/` on a web browser or click [here](http://localhost/)

## Set up
### Create users
The file `users.json` contains the users. For example:
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

### Create classes
The file `classes.json` contains the classes. For example:
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

### Create the subjects
The file `subjects.json` contains the subjects. For example:
```json
[
    {
        "subjectID": 1,
        "prettyName": "Catalan"
    },
    ...
]
```

### Create the schedule
The file `scheduling.json` contains the scheduling. For example:
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
* I know this is guide can be hard to follow, I'll try my best to improve this procedure

About users, classes, scheduling and subjects:
* You can create as many as you wish
* Be sure not to repeat the IDs
* It's recomended to start with ID = 0

### Contributing and following the progress
First, read the [contribution guide](https://github.com/ezarcel/kuzi/blob/edge/CONTRIBUTING.md#readme)
* [Issues](https://github.com/ezarcel/kuzi/issues/)
* [Pull requests](https://github.com/ezarcel/kuzi/pulls)
* [Projects](https://github.com/ezarcel/kuzi/projects)
