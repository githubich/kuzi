document.cookie='session=;max-age=0'
window.onkeypress = (e) => {
    if (e.keyCode == 13) {
        if (document.activeElement === document.querySelector('#kuzi-username')) {
            document.querySelector('#kuzi-password').focus()
        } else if (document.activeElement === document.querySelector('#kuzi-password')) {
            document.querySelector('#login-button').click()
        }
        return false;
    }
}
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
                if (res.session) document.cookie=`session=${res.session}`
                if (res.do) eval(res.do)
            })
        })
    } else alert("[{(error.invalidInput)}]")
}