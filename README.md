# Kuzi
A work-in-progress open-source alternative to make a simple and reliable (high)school platform. **This software is still in alpha**, this might not work as expected or directly not work at all, in addition **it's not adviceable to use non-RFP** (Ready For Production) versions on production, since they can (and will) contain many bugs and/or security risks

## Usage
### Install node.js and npm
For proper usage, you must install node.js and npm from [this link](https://nodejs.org/en/download/)

### Install the dependencies
Install all of the depencies for this project with `npm install` (use it with `sudo` for Linux and macOS)

### Create users and teachers
Add your users in the file `users.json`, respecting the JSON syntax. This is more detailed [here](#creating-the-users-and-teachers)

### Run the server and test
Run `node server.js` (use it with `sudo` for Linux and macOS) and open `http://localhost` on a web browser or click [here](http://localhost)

## Setting up
### Creating the users and teachers
Users go in the `users.json` file. All users must follow this syntax:
```
[
    {
        "username": "linus.torvals",
        "password": "randomStringOfCharacters",
        "prettyName": "Linux Torvals",
        "userID": 1,
	    "role": "teacher"
    },
	{
        "username": "my.aunt",
        "password": "randomStringOfCharacters",
        "prettyName": "My Aunt",
        "userID": 2,
	    "role": "student"
    },
    {
        "username": "some.one",
        "password": "randomStringOfCharacters",
        "prettyName": "Some One",
        "userID": 3,
	    "role": "admin"
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
* You can classes as many users as you wish
* Be sure not to repeat the class IDs

### Notes for the future
* I'll make a GUI to make this process simpler
