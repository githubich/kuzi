window.addEventListener('load', () => {
    if ($parseURLArgs().ID == undefined) history.back()
    setActiveTab(2, true)
})
function loadTest(progress) {
    setPageTitle("clipboard-check", "[{(loading)}]")
    $('#test-info').innerHTML = ''
    fetch('/students/tests/getQuestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ID: $parseURLArgs().ID })
    })
        .then(res => res.json())
        .then(test => {
            setPageTitle("clipboard-check", `[{(performTest)}] (${test.name})`)
            let qContainer = $('#question-container')
            let i = 0
            test.questions.forEach(q => {
                let qE = document.createElement('div')
                qContainer.appendChild(qE)
                qE.classList.add('question', q.type)
                qE.id = `question-${i}`
                qE.innerHTML = `
                    <div class="question-side">
                        <p>${i + 1}</p>
                        <div class="separator"></div>
                        <p>${test.questions.length}</p>
                        <p>${(() => { if (q.type == 'open') return '?'; return q.totalValue})()}p</p>
                    </div>
                    <div class="question-content">
                        <div class="question-question">
                            <p>${q.question}</p>
                        </div>
                        <div class="answer"></div>
                    </div>
                `
                let answerE = qE.querySelector('.answer')
                let j = 0
                if (q.type == 'single-choice') {
                    q.options.forEach(o => {
                        let oE = document.createElement('div')
                        answerE.appendChild(oE)
                        oE.outerHTML = `
                            <div class="option">
                                <input type="radio" ${(() => { if (progress && progress[i] && progress[i] == j) return 'checked'; return '' })()} name="question-${i}" id="question-${i}-option-${j}"><label for="question-${i}-option-${j}">${o}</label>
                            </div>
                        `
                        j++
                    })
                } else if (q.type == 'multiple-choice') {
                    q.options.forEach(o => {
                        let oE = document.createElement('div')
                        answerE.appendChild(oE)
                        oE.outerHTML = `
                            <div class="option">
                                <input type="checkbox" ${(() => { if (progress && progress[i] && progress[i].includes(j)) return 'checked'; return '' })()} name="question-${i}" id="question-${i}-option-${j}"><label for="question-${i}-option-${j}">${o.text}</label>
                            </div>
                        `
                        j++
                    })
                } else if (q.type == 'open') {
                    let oE = document.createElement('div')
                    answerE.appendChild(oE)
                    oE.outerHTML = `
                        <div class="option">
                            <input type="text" id="question-${i}-answer"${(() => { if (progress && progress[i] && typeof progress[i] == "string") return ` value="${progress[i]}"`; return '' })()}>
                        </div>
                    `
                }
                i++
            })
            let submitBtn = document.createElement('button')
            $('#root').appendChild(submitBtn)
            submitBtn.outerHTML = `<button id="submit" onclick="save(true)"><i class="fad fa-paper-plane"></i>[{(submit)}]</button>`
            $$('input').forEach(input => input.addEventListener('input', () => { save(false)} ))
        })
        .catch(e => history.back())
}
function startTest() {
    fetch('/students/tests/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ID: $parseURLArgs().ID })
    })
    loadTest(false)
}
function save(final) {
    let answers = []
    $$('.question').forEach(q => {
        if (q.classList.contains('open')) {
            answers.push(q.querySelector('input[type=text]').value)
        } else if (q.classList.contains('single-choice')) {
            let answer = null
            let i = 0
            q.querySelectorAll('input[type=radio]').forEach(input => {
                if (input.checked) answer = i
                i++
            })
            answers.push(answer)
        } else if (q.classList.contains('multiple-choice')) {
            let answer = []
            let i = 0
            q.querySelectorAll('input[type=checkbox]').forEach(input => {
                if (input.checked) answer.push(i)
                i++
            })
            answers.push(answer)
        }
    })
    fetch('/students/tests/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: answers, finish: final, ID: $parseURLArgs().ID })
    })
        .then(res => res.json())
        .then(res => {
            if (final && res.message == 'ok') qAlert({ message: '[{(success.tests.submit)}]', mode: 'success', buttons: { cancel: { invisible: true } } }).then(a => history.back())
        })
}
function load() {
    fetch('/students/tests/getProgress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ID: $parseURLArgs().ID })
    })
        .then(progress => progress.json())
        .then(progress => {
            if (progress.message == 'not started') {
                setPageTitle("clipboard-check", "[{(testInfo)}]")
                fetch('/students/tests/getMinimal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ID: $parseURLArgs().ID })
                })
                    .then(test => test.json())
                    .then(test => {
                        let startHours = test.startTime.hours
                        let startMinutes = test.startTime.minutes
                        if (startHours < 10) startHours = `0${startHours}`
                        if (startMinutes < 10) startMinutes = `0${startMinutes}`
                        let dueHours = test.dueTime.hours
                        let dueMinutes = test.dueTime.minutes
                        if (dueHours < 10) dueHours = `0${dueHours}`
                        if (dueMinutes < 10) dueMinutes = `0${dueMinutes}`

                        $('#test-info').innerHTML = `
                            <h3 class="name">${test.name}</h3>
                            <p class="subject">${test.subject.prettyName}</p>
                            <p class="question-count">[{(questionCount)}]: ${test.questions.length}</p>
                            <p class="start">[{(startTime)}]: ${startHours}:${startMinutes} ${test.startTime.day}/${test.startTime.month}/${test.startTime.year}</p>
                            <p class="due">[{(dueTime)}]: ${dueHours}:${dueMinutes} ${test.dueTime.day}/${test.dueTime.month}/${test.dueTime.year}</p>
                            <button id="start-test" onclick="startTest()"><i class="fad fa-play"></i>[{(startTest)}]</button>
                        `
                    })
            } else loadTest(progress)
        })
        .catch(e => history.back())
}