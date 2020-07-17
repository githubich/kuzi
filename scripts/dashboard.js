function random(min,max) {return Math.floor(Math.random()*(max-min+1)+min)}
function updateNotifications() {
    let notifications = $('.notifications-dash-block .dash-block-content')
    notifications.innerHTML = '<p style="margin: 0;" align=center>[{(loading)}]</p>'
    fetch('/misc/notifications/get', { method: 'POST' })
        .then(res => res.json())
        .then(res => {
            let i = 0
            notifications.innerHTML = ''
            res.forEach(notification => {
                notificationE = document.createElement('div')
                notifications.insertBefore(notificationE, notifications.children[0])
                notificationE.outerHTML = `
                    <div class="notification">
                        <div class="clickable" onclick='${notification.action}'>
                            <i class="fad fa-bell"></i>
                            <div class="notification-content">
                                <p class="title">${notification.title}</p>
                                <p class="details">${notification.details}</p>
                            </div>
                        </div>
                        <i class="far fa-check delete-notification" title="[{(discard)}]" onclick="discardNotification(${i})"></i>
                    </div>
                `
                i++
            })
        })
        .catch(e => console.error(e))
}
function discardNotification(index) {
    fetch('/misc/notifications/discard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            notificationI: index
        })
    })
        .then(res => res.json())
        .then(res => {
            if (res.message = 'ok') updateNotifications()
            else qAlert({ message: '[{(error.unknown.doNotRetry)}]', mode: 'error', buttons: { cancel: { invisible: true } } })
        })
        .catch(e => console.error(e))
}
window.addEventListener('load', () => {
    setPageTitle("chart-line", "[{(dashboard)}]")
    setActiveTab(0)
    if (getComputedStyle($('.dash-block.motivation-dash-block')).display != "none") {
        fetch('https://gist.githubusercontent.com/ezarcel/5749f919b44cc4291d59bcc8e4169147/raw/b7e0b2fb4ea9c466271b562668d7edc4aa692627/enterpreneur-quotes.json')
            .then(res => res.json())
            .then(res => {
                let quoteIndex = random(0, res.length - 1)
                $(".motivation-dash-block .title").innerText = `${res[quoteIndex].a} ~ ${res[quoteIndex].b}`
            })
            .catch(e => console.error(e))
    }
    updateNotifications()
})
window.addEventListener('onresize', () => {
    $('#markGraph').width = $('#markGraph').offsetWidth
    $('#markGraph').height = $('#markGraph').offsetHeight
})
window.addEventListener('toggle-modal-new-event', () => {
    if (userInfo.role == "teacher") {
        fetch('/teachers/getInfo', { method: "POST" })
            .then(res => res.json()
            .then(res => {
                data = res
                let myClasses = $('#my-classes')
                myClasses.innerHTML = ""
                data.forEach(clas => {
                    let clasE = document.createElement('li')
                    myClasses.appendChild(clasE)
                    clasE.outerHTML = `<li class="class"><input type="radio" oninput="update(this.value)" id="class-${clas.classID}" name="class" value="${clas.classID}"><label for="class-${clas.classID}">${clas.className}</label></li>`
                })
            }))
            .catch(e => console.error(e))
    }
    update = updateID => {
        if (!updateID) return
        updateID = parseInt(updateID)
        let studentsInClass = $('#students-in-class')
        data.forEach(clas => {
            if (clas.classID == updateID) {
                studentsInClass.innerHTML = ''
                $('.students h3').innerHTML = `<i class="fad fa-users"></i>[{(studentsIn)}] ${clas.className}`
                clas.classStudents.forEach(student => {
                    studentE = document.createElement('li')
                    studentsInClass.appendChild(studentE)
                    studentE.outerHTML = `<li class="student"><input type="checkbox" id="student-${student.studentID}"><label for="student-${student.studentID}">${student.studentName}</label></li>`
                })
            }
        })
        $('.students').style = ""
    }
    submit = () => {
        let sendData = { name: $('#event-name').value, description: $('#event-description'), date: $('#period-chooser') }
        if (sendData.name && sendData.description && sendData.date) {
            fetch('/teachers/event/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sendData)
            })
                .then(res => res.json()
                .then(res => {
                    if (res.message == 'ok') qAlert({ message: "[{(success.markSubmit)}]", mode: 'success', buttons: { cancel: { invisible: true } } }).then(ans => { if (ans == true) location.reload() })
                    if (res.message == 'not ok') qAlert({ message: "[{(error.unknown)}]", mode: 'error', buttons: { ok: { text: '[{(retry)}]' }, cancel: { text: "[{(doNotRetry)}]" } } }).then(ans => { if (ans == true) submit() })
                }))
                .catch(() => { qAlert({ message: "[{(error.unknown.retry)}]", mode: 'error', buttons: { ok: { text: '[{(retry)}]' }, cancel: { text: "[{(doNotRetry)}]" } } }).then(ans => { if (ans == true) submit() })})
        } else qAlert({ message: "[{(error.invalidInput)}]", mode: 'error', buttons: { cancel: { invisible: true } } })
    }
})