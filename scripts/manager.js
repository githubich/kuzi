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
        const userInfo = JSON.parse(decodeURI(e.detail.userInfo))
        
        const content = $('#users .actual-content')
        content.querySelector('.password-input .reveal').removeAttribute('style')
        content.removeAttribute('style')

        content.querySelector('.prettyName-input input').value = userInfo.prettyName
        content.querySelector('.username-input input').value = userInfo.username

        const passwordInput = content.querySelector('.password-input input')
        passwordInput.setAttribute('password', userInfo.password)
        passwordInput.setAttribute('readonly', 'readonly')
        passwordInput.placeholder = '••••••••••'
        passwordInput.value = ''

        $('#users--role-chooser').value = userInfo.role
        content.querySelector('.isAdmin-input input[type=checkbox]').checked = userInfo.isAdmin
    })
})