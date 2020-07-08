document.cookie='session=;max-age=0'
window.addEventListener('keypress', e => {
    if (e.key == "Enter") {
        if (document.activeElement === document.querySelector('#kuzi-username')) document.querySelector('#kuzi-password').focus()
        else if (document.activeElement === document.querySelector('#kuzi-password')) document.querySelector('#login-button').click()
        return false
    }
})
function send() {
    if ($('#kuzi-username').value != "" || $('#kuzi-password').value != "") {
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: $('#kuzi-username').value,
                password: $('#kuzi-password').value
            })
        }).then(res => {
            res.json().then(res => {
                if (res.session) { document.cookie=`session=${res.session}`; window.location = "/dashboard.html" }
                if (res.message == 'not ok') qAlert({ message: "[{(error.badUsernameOrPassword)}]", mode: "error", buttons: { cancel: { invisible: true } } }).then( $('#kuzi-password').value = "" )
            })
        })
    } else alert("[{(error.invalidInput)}]")
}