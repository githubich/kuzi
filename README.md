# Kuzi
![GitHub release (latest SemVer including pre-releases)](https://img.shields.io/github/v/release/ezarcel/kuzi?include_prereleases) ![GitHub last commit](https://img.shields.io/github/last-commit/ezarcel/kuzi) ![GitHub issues by-label](https://img.shields.io/github/issues/ezarcel/kuzi/bug)  
A free alternative to make a reliable & beautiful (high)school platform

## Installation
### Install node.js & npm
***Skip this step if issuing ***`node -v`*** shows a version number***  
For Arch Linux & its derivatives: `sudo pacman -S nodejs npm`  
For Debian & Ubuntu & their derivatives: `sudo apt install nodejs npm`  
For macOS 10.10+: [Click here](https://nodejs.org/en/download/package-manager/#macos)  
For Windows 7+ or Windows Server 2008+: [Click here](https://nodejs.org/en/download/package-manager/#windows). In Windows, remove `sudo` in the commands shown below

### Get Kuzi Server on your device
#### Method 1. Using the latest release (recommended)
Go to the [releases page](https://github.com/ezarcel/kuzi/releases), look for the latest release that contains (RP) in the first lines of the description, download the zip file named `Kuzi_<version number>.zip` & unzip it

#### Method 2. Cloning the repo (aka latest & buggiest version)
[Install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) if you haven't already & run `git clone https://github.com/ezarcel/kuzi.git` in a terminal/command prompt window

### Install the dependencies
Install all of this project's dependencies with `sudo npm i`

### Customize the users
There are some pre-made users, but if you want you can add yours [here](#create-users)

### Set the language & other settings
Open `settings.json` & change the values you considering modifying. There are 3 available languages: English (en), Catalan (ca) & Spanish (es)

### Recommended step for linux users
***Run these commands as root*** (`sudo su`)***, not as sudo***
```bash
echo 'net.ipv4.ip_unprivileged_port_start=0' > /etc/sysctl.d/50-unprivileged-ports.conf
sysctl --system
```
This allows all users to run any server in any port they want, since usually port 80 is locked to be used only as root. If you run this, you won't need to type `sudo` in almost every command

### Run the server & test
Run `sudo node server.js` & open `http://localhost/` on a web browser or click [here](http://localhost/). Using HTTPS is up to you

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

About users, classes, scheduling & subjects:
* You can create as many as you wish
* Be sure not to repeat the IDs
* It's recomended to start with ID = 0

### Contributing & following the progress
First, read the [contribution guide](https://github.com/ezarcel/kuzi/blob/edge/CONTRIBUTING.md#readme)
* [Issues](https://github.com/ezarcel/kuzi/issues/)
* [Pull requests](https://github.com/ezarcel/kuzi/pulls)
* [Projects](https://github.com/ezarcel/kuzi/projects)