function logicalSort(a, b) {
    if (a > b) return 1
    else if (a < b) return -1
    return 0
}
function updateDetails(i) {
    i = parseInt(i)
    let { subject, teacher, time } = r[i]
    $('#details-modal .subject-name').innerText = `[{(subject)}]: ${subject.prettyName}`
    $('#details-modal .teacher-name').innerText = `[{(teacher)}]: ${teacher.prettyName}`
    $('#details-modal .class-name').innerText = `[{(class)}]: ${r[i]["class"].prettyName}`
    if (userInfo.role == "student") $('#details-modal .class-name').style.display = "none"
    else $('#details-modal .teacher-name').style.display = "none"

    let prettyMinutes = time.minutes
    let prettyMinutes2 = time.minutes + time.duration.minutes
    if (prettyMinutes < 10) prettyMinutes = `0${prettyMinutes}`
    if (prettyMinutes2 < 10) prettyMinutes2 = `0${prettyMinutes2}`
    $('#details-modal .start-time').innerText = `[{(startTime)}] ${time.hours}:${(prettyMinutes)}`
    $('#details-modal .end-time').innerText = `[{(endTime)}] ${time.hours + time.duration.hours}:${prettyMinutes2}`
}
function createSchedule() {
    $('table').innerHTML = ''
    $('#subjects-container').innerHTML = ''
    let subjects = []
    let weekdays = []
    let hours = []
    let k = 0
    let weekDaysNames = [ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" ]
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
    $('table').appendChild(trTh)
    trTh.innerHTML += `<td>&nbsp;</td>`
    for (i = weekdays[0]; i < (weekdays[weekdays.length - 1] + 1); i++) {
        trTh.innerHTML += `<td>${weekDaysNames[i - 1]}</td>`
    }
    for (i = hours[0]; i < (hours[hours.length - 1] + 1); i++) {
        let tr = document.createElement('tr')
        $('table').appendChild(tr)
        tr.innerHTML += `<td>${i}:00</td>`
        for (j = weekdays[0]; j < (weekdays[weekdays.length - 1] + 1); j++) {
            tr.innerHTML += `<td>&nbsp;</td>`
        }
    }
    r.forEach(c => {
        let element = document.createElement('div')
        $('#subjects-container').appendChild(element)
        element.classList.add('subject')
        element.setAttribute('onclick', `updateDetails(${k}); toggleModal('details')`)
        let prettyMinutes = c.time.minutes
        let prettyMinutes2 = c.time.minutes + c.time.duration.minutes
        if (prettyMinutes < 10) prettyMinutes = `0${prettyMinutes}`
        if (prettyMinutes2 < 10) prettyMinutes2 = `0${prettyMinutes2}`
        element.innerHTML = `<div class="contents"><p>${c.subject.prettyName}</p></div>`
        element.title = `${c.time.hours}:${(prettyMinutes)} - ${c.time.hours + c.time.duration.hours}:${prettyMinutes2}\n[{(teacher)}]: ${c.teacher.prettyName}`

        element.style.top = $(`tr:nth-child(${c.time.hours - hours[0] + 2})`).getBoundingClientRect().top + ($(`tr:nth-child(${c.time.hours - hours[0] + 2})`).offsetHeight * c.time.minutes / 60) + window.scrollY + "px"
        element.style.left = $(`tr:nth-child(2) td:nth-child(${c.time.weekDay - weekdays[0] + 2})`).getBoundingClientRect().left + "px"

        element.style.height = ($(`tr:nth-child(${c.time.hours - hours[0] + 2})`).offsetHeight * (c.time.duration.hours + ( c.time.duration.minutes / 60))) + "px"
        element.style.width = ($(`tr:nth-child(2) td:nth-child(${c.time.weekDay - weekdays[0] + 2})`).offsetWidth) + "px"
    
        k++
    })
}
function load() {
    $('#schedule-container').addEventListener('scroll', createSchedule)
    fetch('/misc/schedule/get', { method: 'POST' })
        .then(res => res.json())
        .then(res => {
            r = res
            createSchedule()
        })
}
window.addEventListener('load', () => { setPageTitle("clock", "[{(mySchedule)}]") })
window.addEventListener('click', createSchedule)
window.addEventListener('resize', createSchedule)