function sortEventsBlocksByDate(a, b) {
    let aDate = (new Date(`${a.date.year}-${a.date.month}-${a.date.day}`)).getTime()
    let bDate = (new Date(`${b.date.year}-${b.date.month}-${b.date.day}`)).getTime()
    if (aDate > bDate) return 1
    else if (aDate < bDate) return -1
    return 0
}
function updateNotifications() {
    let notifications = $('.notifications-dash-block .dash-block-content .content')
    notifications.innerHTML = `<p style="margin: 0;" align="center">[{(loading)}]</p>`
    fetch('/misc/notifications/get', { method: 'POST' }).then(res => res.json())
        .then(res => {
            notifications.innerHTML = ''
            let months = ['[{(january)}]','[{(february)}]','[{(march)}]','[{(april)}]','[{(may)}]','[{(june)}]','[{(july)}]','[{(august)}]','[{(september)}]','[{(octover)}]','[{(november)}]','[{(december)}]']
            res.forEach(notification => {
                notificationE = document.createElement('div')
                notifications.insertBefore(notificationE, notifications.children[0])
                let action = ''
                if (notification.actions) {
                    if (notification.actions.length == 1) action = notification.actions[0].js
                    else if (notification.actions.length > 1) action = notification.actions.find(e => e.default == true).js
                }
                let submitDate = new Date(notification.timeStamp)
                notificationE.outerHTML = `
                    <div class="notification">
                        <div class="clickable" ${(() => { if (action == '') return ''; return `onclick="eval(decodeURI('${encodeURI(action)}'))"` })()} title="${submitDate.getDate()} ${months[submitDate.getMonth()]} ${submitDate.getFullYear()}">
                            <i class="fad fa-bell"></i>
                            <div class="notification-content">
                                <p class="message">${notification.message}</p>
                                <p class="description">${notification.description}</p>
                            </div>
                        </div>
                        <i class="far fa-check delete-notification" title="[{(discard)}]" onclick="discardNotification(${notification.notificationID})"></i>
                    </div>
                `
            })
        })
        .catch(e => qError({ message: e, goBack: false }))
}
function discardNotification(notificationID) {
    fetch('/misc/notifications/discard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationID: notificationID })
    })
        .then(() => updateNotifications())
        .catch(e => qError({ message: e, goBack: false }))
}
function updateEvents() {
    let events = $('.events-dash-block .dash-block-content .content')
    fetch('/misc/events/get', { method: 'POST' }).then(res => res.json())
        .then(res => {
            res.sort(sortEventsBlocksByDate)
            let months = ['[{(january)}]','[{(february)}]','[{(march)}]','[{(april)}]','[{(may)}]','[{(june)}]','[{(july)}]','[{(august)}]','[{(september)}]','[{(octover)}]','[{(november)}]','[{(december)}]']
            events.innerHTML = ''
            res.forEach(day => {
                let dayE = createElement({ type: 'div', classes: [ 'day' ] })
                events.appendChild(dayE)
                
                dayE.appendChild(createElement({ type: 'b', innerContent: { type: 'html', content: `<h4>${day.date.day} ${months[day.date.month - 1]} ${day.date.year}</h4>` } }))

                day.events.forEach(event => {
                    let hoverCard = ''
                    if (event.description) hoverCard = `${event.description}`
                    if (event.description && event.owner.userID != userInfo.userID) hoverCard += '\n'
                    if (event.owner.userID != userInfo.userID) hoverCard += `[{(owner)}]: ${event.owner.prettyName}`
                    let eventE = document.createElement('div')
                    dayE.appendChild(eventE)
                    eventE.outerHTML = `
                        <div class="event">
                            <i class="fad fa-calendar-alt"></i>
                            <a href="/event-details.html?ID=${event.eventID}"><div class="event-content" title="${hoverCard}">
                                <p class="name">${event.name}</p>
                            </div></a>
                        </div>`
                })
            })
        })
        .catch(e => qError({ message: e, goBack: false }))
}
window.addEventListener('load', () => {
    setPageTitle("chart-line", "[{(dashboard)}]")
    setActiveTab(0)
})
window.addEventListener('ready', () => {
    if (userInfo.role == 'teacher') {
        fetch('/teachers/birthdayList', { method: 'POST' }).then(res => res.json())
            .then(res => {
                $('.birthday-dash-block .dash-block-content .content').innerHTML = ''
                res.forEach(cumpleañero => {
                    $('.birthday-dash-block .dash-block-content .content').innerHTML += getTemplate('cumpleañero', { name: cumpleañero.prettyName })
                })
            })
            .catch(e => qError({ message: e, goBack: true }))
    }
    updateNotifications()
    updateEvents()
    if (getComputedStyle($('.motivation-dash-block')).display != "none") {
        fetch('https://gist.githubusercontent.com/ezarcel/5749f919b44cc4291d59bcc8e4169147/raw/b7e0b2fb4ea9c466271b562668d7edc4aa692627/enterpreneur-quotes.json').then(res => res.json())
            .then(res => {
                let quoteIndex = random(0, res.length - 1)
                $(".motivation-dash-block .title").innerText = `${res[quoteIndex].a} ~ ${res[quoteIndex].b}`
            })
            .catch(e => qError({ message: e, goBack: false }))
    }
})
window.addEventListener('toggle-modal-new-event', () => {
    if ($('#new-event-modal').style.display == "none") return
    submit = () => {
        let sendData = { name: $('#event-name').value, description: $('#event-description').value, date: {} }
        sendData.date.year = parseInt($('#event-date').value.split("-")[0])
        sendData.date.month = parseInt($('#event-date').value.split("-")[1])
        sendData.date.day = parseInt($('#event-date').value.split("-")[2])
        if (userInfo.role == "teacher") {
            if ($('#forMyStudentsAndMe').checked) {
                sendData.teacherMode = "forMyStudentsAndMe"
                sendData.visibleTo = []
                $$('#students-in-class input').forEach(e => {
                    if (e.checked) sendData.visibleTo.push(parseInt(e.getAttribute('studentID')))
                })
            } else sendData.teacherMode = "justForMe"
        }
        if (sendData.name && sendData.date.year != NaN && sendData.date.month != NaN && sendData.date.day != NaN && (!sendData.visibleTo || sendData.visibleTo.length > 0)) {
            fetch('/misc/events/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sendData)
            })
                .then(res => res.json())
                .then(res => {
                    if (res.message == 'ok') qAlert({ message: "[{(success.event.submit)}]", mode: 'success', buttons: { cancel: { invisible: true } } }).then(ans => { if (ans == true) toggleModal('new-event'); updateEvents() })
                    if (res.message == 'not ok') qAlert({ message: "[{(error.unknown)}]", mode: 'error', buttons: { ok: { text: '[{(retry)}]' }, cancel: { text: "[{(doNotRetry)}]" } } }).then(ans => { if (ans == true) submit() })
                })
                .catch(e => qError({ message: e, goBack: true }))
        } else qAlert({ message: "[{(error.invalidInput)}]", mode: 'error', buttons: { cancel: { invisible: true } } })
    }
    if (userInfo.role != "teacher") return
    fetch('/teachers/getInfo', { method: "POST" }).then(res => res.json())
        .then(res => {
            data = res
            let myClasses = $('#my-classes')
            myClasses.innerHTML = ""
            data.forEach(clas => {
                let clasE = document.createElement('li')
                myClasses.appendChild(clasE)
                clasE.outerHTML = `<li class="class"><input type="radio" oninput="update(this.value)" id="class-${clas.classID}" name="class" value="${clas.classID}"><label for="class-${clas.classID}">${clas.className}</label></li>`
            })
        })
        .catch(e => qError({ message: e, goBack: true }))
    update = updateID => {
        if (!updateID) return
        updateID = parseInt(updateID)
        data.forEach(clas => {
            if (clas.classID == updateID) {
                $('#students-in-class').innerHTML = ''
                $('.students h3').innerHTML = `<i class="fad fa-users"></i>[{(studentsIn)}] ${clas.className}`
                clas.classStudents.forEach(student => {
                    studentE = document.createElement('li')
                    $('#students-in-class').appendChild(studentE)
                    studentE.outerHTML = `<li class="student"><input type="checkbox" studentID="${student.studentID}" id="student-${student.studentID}"><label for="student-${student.studentID}">${student.studentName}</label></li>`
                })
            }
        })
        $('.students').style = ""
    }
    
})