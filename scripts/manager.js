function changeTab(tabName) {
    if (!tabName || !$(`.content#${tabName}`) || !$(`.tab[value="${tabName}"]`)) return;
    if ($('.tab.selected')) $('.tab.selected').classList.remove('selected')
    $(`.tab[value="${tabName}"]`).classList.add('selected')
    $$('.content').forEach(content => content.style.display = 'none')
    $(`.content#${tabName}`).removeAttribute('style')
    history.pushState('','',`?tab=${tabName}`)
}
function logicalSort(a, b) {
    if (a > b) return 1
    else if (a < b) return -1
    return 0
}
function createSchedule(rootElement) {
    const table = rootElement.querySelector('table')
    const subjectsContainer = rootElement.querySelector('#subjects-container')
    table.innerHTML = ''
    subjectsContainer.innerHTML = ''
    if (r.length == 0) return;
    let subjects = []
    let weekdays = []
    let hours = []
    let k = 0
    const weekDaysNames = [ "[{(monday)}]", "[{(tuesday)}]", "[{(wednesday)}]", "[{(thursday)}]", "[{(friday)}]", "[{(saturday)}]", "[{(sunday)}]" ]
    r.forEach(c => {
        if (subjects.findIndex(e => e == c.subject.subjectID) == -1) subjects.push(c.subject.subjectID)
        if (weekdays.findIndex(e => e == c.time.weekDay) == -1) weekdays.push(c.time.weekDay)
        if (hours.findIndex(e => e == c.time.hours + 1) == -1) {
            if (c.time.minutes != 0 || c.time.duration.hours > 1 || (c.time.duration.hours == 1 && c.time.duration.minutes > 0)) hours.push(c.time.hours + 1)
        }
        if (hours.findIndex(e => e == c.time.hours) == -1) {
            if (c.time.minutes != 0 || c.time.duration.hours > 1 || (c.time.duration.hours == 1 && c.time.duration.minutes > 0)) hours.push(c.time.hours, c.time.hours + 1)
            else hours.push(c.time.hours)
        }
    })
    hours.sort(logicalSort)
    weekdays.sort(logicalSort)
    let trTh = document.createElement('tr')
    table.appendChild(trTh)
    trTh.innerHTML += `<td>&nbsp;</td>`
    for (i = weekdays[0]; i < (weekdays[weekdays.length - 1] + 1); i++) {
        trTh.innerHTML += `<td>${weekDaysNames[i - 1]}</td>`
    }
    for (i = hours[0]; i < (hours[hours.length - 1] + 1); i++) {
        let tr = document.createElement('tr')
        table.appendChild(tr)
        tr.innerHTML += `<td>${i}:00</td>`
        for (j = weekdays[0]; j < (weekdays[weekdays.length - 1] + 1); j++) {
            tr.innerHTML += `<td>&nbsp;</td>`
        }
    }
    r.forEach(c => {
        let element = document.createElement('div')
        subjectsContainer.appendChild(element)
        element.classList.add('subject')
        element.setAttribute('onclick', `updateDetails(${k}); toggleModal('details')`)
        let prettyMinutes = c.time.minutes
        let prettyMinutes2 = c.time.minutes + c.time.duration.minutes
        if (prettyMinutes < 10) prettyMinutes = `0${prettyMinutes}`
        if (prettyMinutes2 < 10) prettyMinutes2 = `0${prettyMinutes2}`
        element.innerHTML = `<div class="contents"><p>${c.subject.prettyName}</p></div>`
        
        const cell = table.querySelector(`tr:nth-child(${c.time.hours - hours[0] + 2}) td:nth-child(${c.time.weekDay - weekdays[0] + 2})`)
        element.style.top = cell.offsetTop + (cell.offsetHeight * c.time.minutes / 60) + window.scrollY + "px"
        element.style.left = cell.offsetLeft + "px"

        element.style.height = (cell.offsetHeight * (c.time.duration.hours + ( c.time.duration.minutes / 60))) + "px"
        element.style.width = `${cell.offsetWidth}px`
    
        k++
    })
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

    // SUBJECTS
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

    // SCHEDULING
    $('#scheduling--teacher-list').addEventListener('select', e => {
        if (!e.detail.userID) throw Error('No userID was recieved')
        const { userID: teacherID } = e.detail

        const content = $('.content#scheduling .actual-content')
        content.removeAttribute('style')

        content.querySelector('#schedule-container').style.display = 'none'
        content.querySelector('.loading-container').removeAttribute('style')

        fetch('/manager/scheduling/get', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacherID })
        }).then(r => r.json())
            .then(r => {
                window.r = r
                content.querySelector('.loading-container').style.display = 'none'
                content.querySelector('#schedule-container').removeAttribute('style')
                createSchedule(content.querySelector('#schedule-container'))
            })
    })
    window.addEventListener('resize', () => {
        if (getComputedStyle($('.content#scheduling')).display != 'none' &&
            getComputedStyle($('.content#scheduling #schedule-container')).display != 'none') {
            createSchedule($('.content#scheduling #schedule-container'))
        }
    })

    // PERIODS
    $('#periods--period-list').addEventListener('select', e => {
        if (!e.detail.periodInfo) throw Error('No periodInfo was recieved')
        const info = JSON.parse(decodeURI(e.detail.periodInfo))

        const content = $('.content#periods .actual-content')
        content.removeAttribute('style')

        content.querySelector('.prettyName-input input').value = info.periodName

        let { day: sDay, month: sMonth } = info.startDate
        let { day: eDay, month: eMonth } = info.endDate
        if (sDay < 10) sDay = `0${sDay}`
        if (sMonth < 10) sMonth = `0${sMonth}`
        if (eDay < 10) eDay = `0${eDay}`
        if (eMonth < 10) eMonth = `0${eMonth}`
        content.querySelector('.startDate-input input').value = `${(new Date()).getFullYear()}-${sMonth}-${sDay}`
        content.querySelector('.endDate-input input').value = `${(new Date()).getFullYear()}-${eMonth}-${eDay}`
        
        content.querySelector('button.submit').setAttribute('periodID', info.periodID)
    })
    periods_submit = periodID => {
        if (!periodID) throw Error('No periodID specified')
        const content = $('.content#periods .actual-content')
        let sendData = {
            periodName: content.querySelector('.prettyName-input input').value,
            periodID,
            startDate: {
                day: parseInt(content.querySelector('.startDate-input input').value.split('-')[2]),
                month: parseInt(content.querySelector('.startDate-input input').value.split('-')[1])
            },
            endDate: {
                day: parseInt(content.querySelector('.endDate-input input').value.split('-')[2]),
                month: parseInt(content.querySelector('.endDate-input input').value.split('-')[1])
            },
        }

        fetch('/manager/periods/edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sendData)
        }).then(r => r.json())
            .then(r => {
                if (r.message = 'ok') qSuccess({ message: "[{(success.manager.period.edit)}]" }).then(a => location.reload())
                else qError({ goBack: false })
            })
            .catch(e => qError({ goBack: false }))
    }

    $$('.tab').forEach(tab => tab.classList.remove('selected'))
    $$('.content').forEach(content => content.style.display = 'none')
    if ($parseURLArgs() && $parseURLArgs().tab && $(`.tab[value="${$parseURLArgs().tab}"]`) && $(`.content#${$parseURLArgs().tab}`)) changeTab($parseURLArgs().tab)
    else changeTab('users')
    $('main').classList.add('loaded')
})