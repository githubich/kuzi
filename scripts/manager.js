function changeTab(tab) {
    if (!tab || $('.tab.selected') == tab) return
    $('.tab.selected').classList.remove('selected')
    tab.classList.add('selected')
    $$('.content').forEach(content => content.style.display = 'none')
    $(`.content#${tab.getAttribute('value')}`).removeAttribute('style')
}
window.addEventListener('load', () => setPageTitle("users-cog", "[{(manager)}]"))
window.addEventListener('ready', () => {
    if (!userInfo.isAdmin) return qError({ message: "[{(error.notAllowed)}]", goBack: true })

    // USERS
    $('#users--user-list').addEventListener('select', e => {
        if (!e.detail.userInfo) throw Error('No userInfo was recieved')
        const info = JSON.parse(decodeURI(e.detail.userInfo))

        const content = $('.content#users .actual-content')
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

        users_updateBottom(info)
        
        content.querySelector('button.submit').setAttribute('userID', info.userID)
    })
    users_submit = userID => {
        if (!userID) throw Error('No userID specified')
        const content = $('.content#users .actual-content')
        let sendData = {
            username: content.querySelector('.username-input input').value,
            password: content.querySelector('.password-input input').value || content.querySelector('.password-input input').getAttribute('password'),
            prettyName: content.querySelector('.prettyName-input input').value,
            userID,
            role: content.querySelector('.role-input select').value,
            isAdmin: content.querySelector('.isAdmin-input input').checked
        }

        let birthday = content.querySelector('.birthday-input input').value
        if (birthday) sendData.birthday = {
            day: parseInt(birthday.split('-')[2]),
            month: parseInt(birthday.split('-')[1])
        }

        if (sendData.role == 'parent') sendData.childrenIDs = content.querySelector('.children-input iframe').contentWindow.getSelected()

        fetch('/manager/users/edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sendData)
        }).then(r => r.json())
            .then(r => {
                if (r.message = 'ok') qSuccess({ message: "[{(success.manager.user.edit)}]" }).then(a => location.reload())
                else qError({ goBack: false })
            })
            .catch(e => qError({ goBack: false }))
    }
    users_updateBottom = info => {
        const content = $('.content#users .actual-content')
        content.querySelector('.class-input').style.display = 'none'
        content.querySelector('.children-input').style.display = 'none'

        if (info.role == 'student') {
            content.querySelector('.class-input').removeAttribute('style')
            if (info.role == 'student' && info.class != undefined) content.querySelector('.class-input span').innerText = info.class.prettyName
            else content.querySelector('.class-input span').innerText = '[{(noClassSelected)}]'
        } else if (info.role == 'parent') {
            content.querySelector('.children-input').removeAttribute('style')
            content.querySelector('.children-input iframe').contentWindow.select([])
            if (info.childrenIDs) content.querySelector('.children-input iframe').contentWindow.select(info.childrenIDs)
        }
    }

    // CLASSES
    $('#classes--class-list').addEventListener('select', e => {
        if (!e.detail.classInfo) throw Error('No classInfo was recieved')
        const info = JSON.parse(decodeURI(e.detail.classInfo))

        const content = $('.content#classes .actual-content')
        content.removeAttribute('style')

        content.querySelector('.prettyName-input input').value = info.prettyName

        content.querySelector('.students-input iframe').contentWindow.set(info.classID)
        
        content.querySelector('button.submit').setAttribute('classID', info.classID)
    })
    classes_submit = classID => {
        if (!classID) throw Error('No classID specified')
        const content = $('.content#classes .actual-content')
        let sendData = {
            prettyName: content.querySelector('.prettyName-input input').value,
            classID
        }
        sendData.students = content.querySelector('.students-input iframe').contentWindow.getSelected()

        fetch('/manager/classes/edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sendData)
        }).then(r => r.json())
            .then(r => {
                if (r.message = 'ok') qSuccess({ message: "[{(success.manager.class.edit)}]" }).then(a => location.reload())
                else qError({ goBack: false })
            })
            .catch(e => qError({ goBack: false }))
    }

    $('#subjects--subject-list').addEventListener('select', e => {
        if (!e.detail.subjectInfo) throw Error('No subjectInfo was recieved')
        const info = JSON.parse(decodeURI(e.detail.subjectInfo))

        const content = $('.content#subjects .actual-content')
        content.removeAttribute('style')

        content.querySelector('.prettyName-input input').value = info.prettyName
        
        content.querySelector('button.submit').setAttribute('subjectID', info.subjectID)
    })
    subjects_submit = subjectID => {
        if (!subjectID) throw Error('No subjectID specified')
        const content = $('.content#subjects .actual-content')
        let sendData = {
            prettyName: content.querySelector('.prettyName-input input').value,
            subjectID
        }

        fetch('/manager/subjects/edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sendData)
        }).then(r => r.json())
            .then(r => {
                if (r.message = 'ok') qSuccess({ message: "[{(success.manager.subject.edit)}]" }).then(a => location.reload())
                else qError({ goBack: false })
            })
            .catch(e => qError({ goBack: false }))
    }
})