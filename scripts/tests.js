window.addEventListener('load', () => {
    setPageTitle("clipboard-check", `[{(tests)}]`)
    setActiveTab(2)
})
function load() {
    fetch(`${userInfo.role}s/tests/list`, { method: 'POST' })
        .then(res => res.json())
        .then(res => {
            if (userInfo.role = 'student') res.sort()
            let testContainer = $('#test-container')
            res.forEach(test => {
                let testE = document.createElement('tr')
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
                        <p class="subjectAndClass">${test.subject.prettyName} | ${test.class.prettyName}</p>
                        <p class="question-count">[{(questionCount)}]: ${test.questions.length}</p>
                        <p class="start">[{(startTime)}]: ${startHours}:${startMinutes} ${test.startTime.day}/${test.startTime.month}/${test.startTime.year}</p>
                        <p class="due">[{(dueTime)}]: ${dueHours}:${dueMinutes} ${test.dueTime.day}/${test.dueTime.month}/${test.dueTime.year}</p>
                        <p class="controls"><a href="/perform-test.html?ID=${test.testID}" class="perform-test students-only" title="[{(perform)}]"><i class="fad fa-play"></i></a><a href="/edit-test.html?ID=${test.testID}" class="edit-test teachers-only" title="[{(edit)}]"><i class="fad fa-edit"></i></a><a class="delete-test teachers-only" title="[{(delete)}]"><i class="fad fa-trash"></i></a></p>
                        <div class="visibility teachers-only"><input type="checkbox" id="visibility-${test.testID}" ${(() => { if (test.visible === true) return 'checked'; else return '' })()} oninput="this.disabled = true; fetch('/teachers/tests/setVisibility', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ID: ${test.testID}, set: this.checked }) }).then(res => { this.disabled = false })"><label for="visibility-${test.testID}">Visible</label></div>
                    </div>
                `
                if ((new Date(`${test.startTime.year}-${test.startTime.month}-${test.startTime.day} ${test.startTime.hours}:${test.startTime.minutes}`)).getTime() <= (new Date()).getTime() && (new Date()).getTime() <= (new Date(`${test.dueTime.year}-${test.dueTime.month}-${test.dueTime.day} ${test.dueTime.hours}:${test.dueTime.minutes}`)).getTime()) testE.classList.add('green')
                else testE.classList.add('red')
            })
        })
}