function changeTab(tab) {
    if (!tab || $('.tab.selected') == tab) return
    $('.tab.selected').classList.remove('selected')
    tab.classList.add('selected')
    $$('.content').forEach(content => content.style.display = 'none')
    $(`.content#${tab.getAttribute('value')}`).removeAttribute('style')
}

// USERS
function users_updateInfo(userInfo) {
    if (!userInfo) throw Error('No valid userInfo specified')
    userInfo = JSON.parse(decodeURI(userInfo))
}

window.addEventListener('load', () => setPageTitle("users-cog", "[{(manager)}]"))
window.addEventListener('ready', () => {
    if (!userInfo.isAdmin) return qError({ message: "[{(error.notAllowed)}]", goBack: true })
    $('#users--user-list').addEventListener('select', e => {
        if (!e.detail.userInfo) return
        const info = JSON.parse(decodeURI(e.detail.userInfo))

        const content = $('#users .actual-content')
        content.querySelector('.password-input .reveal').removeAttribute('style')
        content.removeAttribute('style')

        content.querySelector('.prettyName-input input').value = info.prettyName
        content.querySelector('.username-input input').value = info.username

        const passwordInput = content.querySelector('.password-input input')
        passwordInput.setAttribute('password', info.password)
        passwordInput.setAttribute('readonly', 'readonly')
        passwordInput.placeholder = '••••••••••'
        passwordInput.value = ''

        const birthdayInput = content.querySelector('.birthday-input input')
        birthdayInput.value = ''
        if (info.birthday && info.birthday.day && info.birthday.month) {
            let { day, month } = info.birthday
            day = (day < 10 ? `0${day}` : day)
            month = (month < 10 ? `0${month}` : month)
            birthdayInput.value = `${(new Date()).getFullYear()}-${month}-${day}`
        }

        $('#users--role-chooser').value = info.role
        content.querySelector('.isAdmin-input input[type=checkbox]').checked = info.isAdmin
    })
})