document.cookie='session=;max-age=0'
document.cookie='selectedChild=;max-age=0'
window.addEventListener('keypress', e => {
    if (e.key == "Enter") {
        e.preventDefault()
        if (document.activeElement === $('#kuzi-username')) $('#kuzi-password').focus()
        else if (document.activeElement === $('#kuzi-password')) $('#submit').click()
    }
})
function send() {
    if ($('#kuzi-username').value != "" || $('#kuzi-password').value != "") {
        fetch('/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: $('#kuzi-username').value,
                password: $('#kuzi-password').value
            })}).then(res => res.json())
            .then(({ session }) => {
                if (session != undefined) { document.cookie=`session=${session}`; window.location = "/dashboard.html" }
                else qError({ message: "[{(error.badUsernameOrPassword)}]", goBack: false }).then( $('#kuzi-password').value = "" )
            })
            .catch(e => qError({ message: "[{(error.badUsernameOrPassword)}]" }))
    } else alert("[{(error.invalidInput)}]")
}