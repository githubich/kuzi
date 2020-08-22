function deleteTest(element, ID) {
    qAreYouSure().then(a => {
        if (a) {
            fetch('/teachers/tests/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ID: ID })
            })
            element.parentElement.parentElement.parentElement.remove()
            if ($('#test-container').children.length == 0) $('#test-container').innerHTML = getTemplate('empty-page')
        }
    })
}
function testSort(a, b) {
    let statusA = 0
    let statusB = 0
    if (a.status == 'orange') statusA = 3
    else if (a.status == 'green') statusA = 2
    else if (a.status == 'blue') statusA = 1
    if (b.status == 'green') statusB = 1
    else if (b.status == 'orange') statusB = 2
    else if (b.status == 'blue') statusB = 3
    if (statusA > statusB) return -1
    else if (statusA < statusB) return 1

    let textA = a.name.toLowerCase
    let textB = b.name.toLowerCase
    if (textA > textB) return -1
    else if (textA > textB) return 1

    return 0
}
window.addEventListener('load', () => {
    setPageTitle("clipboard-check", `[{(tests)}]`)
    setActiveTab(2)
})
window.addEventListener('ready', () => {
    fetch(`${userInfo.role}s/tests/list`, { method: 'POST' }).then(res => res.json())
        .then(res => {
            if (userInfo.role == 'student') res.sort(testSort)
            let testContainer = $('#test-container')
            res.forEach(test => {
                let testE = document.createElement('div')
                testContainer.appendChild(testE)
                testE.classList.add('test')
                testE.setAttribute('testID', test.testID)                

                let startHours = test.startTime.hours
                let startMinutes = test.startTime.minutes
                if (startHours < 10) startHours = `0${startHours}`
                if (startMinutes < 10) startMinutes = `0${startMinutes}`
                let dueHours = test.dueTime.hours
                let dueMinutes = test.dueTime.minutes
                if (dueHours < 10) dueHours = `0${dueHours}`
                if (dueMinutes < 10) dueMinutes = `0${dueMinutes}`

                testE.innerHTML = `
                    <div class="title"><h2>${test.name}</h2></div>
                    <div class="line"></div>
                    <div class="content">
                        <p class="subjectAndClass">[{(subject)}]: ${(() => { if (userInfo.role == "teacher") return `${test.subject.prettyName} | [{(class)}]: ${test.class.prettyName}`; return test.subject.prettyName})()}</p>
                        <p class="question-count">[{(questionCount)}]: ${test.questions.length}</p>
                        <p class="submissions">[{(submissions)}]: ${test.submissions}</p>
                        <p class="start">[{(startTime)}]: ${startHours}:${startMinutes} ${test.startTime.day}/${test.startTime.month}/${test.startTime.year}</p>
                        <p class="due">[{(dueTime)}]: ${dueHours}:${dueMinutes} ${test.dueTime.day}/${test.dueTime.month}/${test.dueTime.year}</p>
                        <p class="controls">
                            <a title="[{(perform)}]" class="perform-test students-only" href="/perform-test.html?ID=${test.testID}"><i class="fad fa-play"></i></a>
                            <a title="[{(viewSubmissions)}]" ${(() => { if (test.submissions <= 0) return 'style="display: none;"'; return ''})()} class="view-test-submissions teachers-only" href="/test-submissions.html?ID=${test.testID}"><i class="fad fa-tasks"></i></a>
                            <a title="[{(edit)}]" class="edit-test teachers-only" href="/edit-test.html?ID=${test.testID}"><i class="fad fa-edit"></i></a>
                            <a title="[{(delete)}]" class="delete-test teachers-only" onclick="deleteTest(this, '${test.testID}')"><i class="fad fa-trash"></i></a></p>
                        <div class="visibility teachers-only">
                            <label class="toggle" for="visibility-${test.testID}">
                                <input type="checkbox" id="visibility-${test.testID}" ${(() => { if (test.visible === true) return 'checked'; return '' })()} oninput="this.disabled = true; fetch('/teachers/tests/setVisibility', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ID: '${test.testID}', set: this.checked }) }).then(res => { this.disabled = false })">
                                <span class="slider"></span>
                            </label>
                            <label class="label" for="visibility-${test.testID}">Visible</label>
                        </div>
                    </div>
                `
                if (userInfo.role == 'student') testE.classList.add(test.status)
                else $$('.line').forEach(line => line.remove())
            })
            if ($('#test-container').children.length == 0) $('#test-container').innerHTML = getTemplate('empty-page')
        })
        .catch(e => qError({ message: e, goBack: true }))
})