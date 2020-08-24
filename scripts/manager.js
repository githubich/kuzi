function changeTab(tabName) {
    if (!tabName || !$(`.content#${tabName}`) || !$(`.tab[value="${tabName}"]`)) return;
    if ($('.tab.selected')) $('.tab.selected').classList.remove('selected')
    $(`.tab[value="${tabName}"]`).classList.add('selected')
    $$('.content').forEach(content => content.style.display = 'none')
    $(`.content#${tabName}`).removeAttribute('style')
    history.replaceState('','',`?tab=${tabName}`)
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
    if (!window.r || window.r.length == 0) return;
    let subjects = []
    let weekdays = []
    let hours = []
    const weekDaysNames = [ "[{(monday)}]", "[{(tuesday)}]", "[{(wednesday)}]", "[{(thursday)}]", "[{(friday)}]", "[{(saturday)}]", "[{(sunday)}]" ]
    r.forEach(c => {
        if (subjects.findIndex(e => e == c.subject.subjectID) == -1) subjects.push(c.subject.subjectID)
        if (weekdays.findIndex(e => e == c.time.weekDay) == -1) weekdays.push(c.time.weekDay)
        const iCount = (c.time.duration.hours == 0) ? 1 : c.time.duration.hours
        for (i = c.time.hours; i < (c.time.hours + iCount); i++) {
            if (!hours.includes(i)) hours.push(i)
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
        element.setAttribute('onclick', `scheduling_updateModal("${c.connectionID}")`)
        let prettyMinutes = c.time.minutes
        let prettyMinutes2 = c.time.minutes + c.time.duration.minutes
        if (prettyMinutes < 10) prettyMinutes = `0${prettyMinutes}`
        if (prettyMinutes2 < 10) prettyMinutes2 = `0${prettyMinutes2}`
        element.innerHTML = `<div class="contents"><p>${c.subject.prettyName} (${c.class.prettyName})</p></div>`
        
        const cell = table.querySelector(`tr:nth-child(${c.time.hours - hours[0] + 2}) td:nth-child(${c.time.weekDay - weekdays[0] + 2})`)
        element.style.top = cell.offsetTop + (cell.offsetHeight * c.time.minutes / 60) + "px"
        element.style.left = cell.offsetLeft + "px"

        element.style.height = (cell.offsetHeight * (c.time.duration.hours + ( c.time.duration.minutes / 60))) + "px"
        element.style.width = `${cell.offsetWidth}px`
    })
}
window.addEventListener('load', () => {
    setPageTitle("users-cog", "[{(manager)}]")
    $$('.tab').forEach(tab => tab.classList.remove('selected'))
    $$('.content').forEach(content => content.style.display = 'none')
    if ($parseURLArgs() && $parseURLArgs().tab && $(`.tab[value="${$parseURLArgs().tab}"]`) && $(`.content#${$parseURLArgs().tab}`)) changeTab($parseURLArgs().tab)
    else changeTab('users')
    $('main').classList.add('loaded')
})
window.addEventListener('ready', () => {
    if (!userInfo.isAdmin) return qError({ message: "[{(error.notAllowed)}]", goBack: true }).then(a => history.back())

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
    scheduling_update = () => {
        const teacherID = window.schedule_teacherID
        const content = $('.content#scheduling .actual-content')
        content.querySelector('#schedule-container').style.display = 'none'
        content.querySelector('.actions').style.display = 'none'
        content.querySelector('.loading-container').removeAttribute('style')

        fetch('/manager/scheduling/get', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacherID })
        }).then(r => r.json())
            .then(r => {
                window.r = r
                content.querySelector('#schedule-container').removeAttribute('style')
                content.querySelector('.actions').removeAttribute('style')
                content.querySelector('.loading-container').style.display = 'none'
                createSchedule(content.querySelector('#schedule-container'))
            })
    }
    $('#scheduling--teacher-list').addEventListener('select', e => {
        if (!e.detail.userID) throw Error('No userID was recieved')
        const { userID: teacherID } = e.detail

        window.schedule_teacherID = teacherID

        const content = $('.content#scheduling .actual-content')
        content.removeAttribute('style')

        scheduling_update()
    })
    window.addEventListener('resize', () => {
        if (getComputedStyle($('.content#scheduling')).display != 'none' &&
            getComputedStyle($('.content#scheduling #schedule-container')).display != 'none') {
            if (window.r) createSchedule($('.content#scheduling #schedule-container'))
        }
    })
    scheduling_new = () => {
        const teacherID = window.schedule_teacherID
        fetch('/manager/scheduling/new', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacherID })
        }).then(r => scheduling_update())
    }
    scheduling_updateModal = id => {
        if (!id) throw Error('No ID specified')
        const info = r.find(e => e.connectionID == id)
        if (!info) throw Error('Invalid ID')
        const modal = $('.modal.blurry-bg#scheduling-edit-modal')

        fetch('/manager/classes/list', { method: 'POST' }).then(res => res.json())
            .then(res => {
                $$('.class-chooser').forEach(classChooser => {
                    classChooser.innerHTML = ''
                    res.forEach(clas => {
                        classChooser.innerHTML += getTemplate('class-subject', { id: clas.classID, name: clas.prettyName })
                    })
                    
                })
                modal.querySelector('.class-chooser').value = info.class.classID

                fetch('/manager/subjects/list', { method: 'POST' }).then(res => res.json())
                    .then(res => {
                        $$('.subject-chooser').forEach(subjectChooser => {
                            subjectChooser.innerHTML = ''
                            res.forEach(subject => {
                                subjectChooser.innerHTML += getTemplate('class-subject', { id: subject.subjectID, name: subject.prettyName })
                            })
                        })
                        modal.querySelector('.subject-chooser').value = info.subject.subjectID
                        toggleModal('scheduling-edit')
                    })
            })
        
        let { hours: sHours, minutes: sMinutes, duration: { hours: eHours, minutes: eMinutes } } = info.time
        
        const endDate = new Date()
        endDate.setSeconds(0); endDate.setMilliseconds(0); endDate.setHours(sHours + eHours); endDate.setMinutes(sMinutes + eMinutes)
        eHours = endDate.getHours()
        eMinutes = endDate.getMinutes()

        sHours = sHours < 10 ? `0${sHours}` : sHours
        sMinutes = sMinutes < 10 ? `0${sMinutes}` : sMinutes
        eHours = eHours < 10 ? `0${eHours}` : eHours
        eMinutes = eMinutes < 10 ? `0${eMinutes}` : eMinutes

        modal.querySelector('.start-input input').value = `${sHours}:${sMinutes}`
        modal.querySelector('.end-input input').value = `${eHours}:${eMinutes}`
        modal.querySelector('.weekDay-chooser').value = info.time.weekDay

        modal.querySelectorAll('button').forEach(button => {
            button.setAttribute('connectionID', id)
        })
    }
    scheduling_submitEdit = id => {
        const modal = $('.modal.blurry-bg#scheduling-edit-modal')

        const sHours = parseInt(modal.querySelector('.start-input input').value.split(':')[0])
        const sMinutes = parseInt(modal.querySelector('.start-input input').value.split(':')[1])
        const dHours = parseInt(modal.querySelector('.end-input input').value.split(':')[0]) - sHours
        const dMinutes = parseInt(modal.querySelector('.end-input input').value.split(':')[1]) - sMinutes

        let sendData = {
            connectionID: id,
            subjectID: modal.querySelector('.subject-chooser').value,
            classID: modal.querySelector('.class-chooser').value,
            teacherID: window.schedule_teacherID,
            time: {
                weekDay: parseInt(modal.querySelector('.weekDay-chooser').value),
                hours: sHours,
                minutes: sMinutes,
                duration: {
                    hours: dHours,
                    minutes: dMinutes
                }
            }
        }
        if (dHours < 0 || dMinutes < 0 || (dHours == 0 && dMinutes == 0) ||
            !sendData.connectionID || !sendData.subjectID || !sendData.classID || !sendData.teacherID ||
            sendData.time.weekDay == undefined && sendData.time.hours == undefined || sendData.time.minutes == undefined ||
            sendData.time.duration.hours == undefined || sendData.time.duration.minutes == undefined) return qError({ message: '[{(error.invalidInput)}]' })
        
        fetch('/manager/scheduling/edit', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sendData)
        }).then(r => r.json())
            .then(res => {
                if (res.message = 'ok') qSuccess({ message: "[{(success.manager.scheduling.edit)}]" })
                else qError()
                scheduling_update()
                toggleModal('scheduling-edit')
            })
    }
    scheduling_delete = connectionID => {
        qAreYouSure().then(a => {
            if (a) fetch('/manager/scheduling/delete', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teacherID: window.schedule_teacherID, connectionID })
            }).then(r => r.json())
                .then(res => {
                    if (res.message = 'ok') qSuccess({ message: "[{(success.manager.scheduling.delete)}]" })
                    scheduling_update()
                })
                .catch(e => qError({ message: e, goBack: false }))
        })
    }
    scheduling_deleteAll = () => {
        qAreYouSure().then(a => {
            if (a) fetch('/manager/scheduling/deleteAll', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teacherID: window.schedule_teacherID })
            }).then(r => r.json())
                .then(res => {
                    if (res.message = 'ok') qSuccess({ message: "[{(success.manager.scheduling.deleteAll)}]" })
                    scheduling_update()
                })
                .catch(e => qError({ message: e, goBack: false }))
        })
    }

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
})