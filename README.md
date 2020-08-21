# Kuzi
![GitHub release (latest SemVer including pre-releases)](https://img.shields.io/github/v/release/ezarcel/kuzi?include_prereleases) ![GitHub last commit](https://img.shields.io/github/last-commit/ezarcel/kuzi) ![GitHub issues by-label](https://img.shields.io/github/issues/ezarcel/kuzi/bug)  
A free alternative to make a reliable & beautiful (high)school platform

## Installation
### Install node.js & npm
***Skip this step if issuing*** `node -v` ***shows a version number***  
For Arch Linux & its derivatives: `sudo pacman -S nodejs npm`  
For Debian & Ubuntu & their derivatives: `sudo apt install nodejs npm`  
For macOS 10.10+: [Click here](https://nodejs.org/en/download/package-manager/#macos)  
For Windows 7+ or Windows Server 2008+: [Click here](https://nodejs.org/en/download/package-manager/#windows). In Windows, remove `sudo` in the commands shown below

### Get Kuzi on your device
#### Method 1. Using the latest release (recommended)
Go to the [releases page](https://github.com/ezarcel/kuzi/releases/latest), download the zip file named `Kuzi_<version number>.zip` & unzip it

#### Method 2. Cloning the repo (aka latest & buggiest version)
Via Web Browser:
- Click [here](https://github.com/ezarcel/kuzi/archive/edge.zip)

Via Terminal:
- [Install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) if you haven't already
- Run `git clone https://github.com/ezarcel/kuzi.git` in a terminal/command prompt window

### Install the dependencies
Install all of this project's dependencies with `npm i`

### Customize the users
There are some pre-made users, but if you want you can add yours [here](#create-users)

### Set the language & other settings
Open `settings.json` & change the values you consider. There are 3 available languages: English (en), Catalan (ca) & Spanish (es)

### For linux users (recommended, but optional)
***Run these commands as root*** (`sudo su`)***, not as sudo***
```bash
echo 'net.ipv4.ip_unprivileged_port_start=0' > /etc/sysctl.d/50-unprivileged-ports.conf
sysctl --system
```
This allows all users to run any server in any port they want, since usually port 80 is locked to be used only as root. If you run this, you won't need to type `sudo` in almost every command

### Run the server & test
Run `npm start`, open `http://localhost/` on a web browser or click [here](http://localhost/) & log in (Username: `admin.teacher`, Password: `kuzi`). Using HTTPS is up to you

## Set up
### Create users, classes, subjects, the schedule & periods
Log in as an admin users and go to More > Manager or click [here](http://localhost/manager.html), then select the tab according to whatever you want to create/modify/delete & then follow the onscreen instructions  
IDs for everything are generated as UUIDs v4 by [uuid@8.3.0](https://www.npmjs.com/package/uuid)

### Contributing & following the progress
First, read the [contribution guide](https://github.com/ezarcel/kuzi/blob/edge/CONTRIBUTING.md#readme)
* [Issues](https://github.com/ezarcel/kuzi/issues/)
* [Pull requests](https://github.com/ezarcel/kuzi/pulls)
* [Projects](https://github.com/ezarcel/kuzi/projects)