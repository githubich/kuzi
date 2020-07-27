window.addEventListener('load', () => {
    if ($parseURLArgs().studentID == undefined || $parseURLArgs().testID == undefined) history.back()
    setActiveTab(2, true)
})
function load() {
    setPageTitle("clipboard-check", "[{(loading)}]")
    fetch('/teachers/tests/getAnswers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentID: $parseURLArgs().studentID, testID: $parseURLArgs().testID })
    })
        .then(res => res.json())
        .then(test => {
            console.log(test)
            setPageTitle("clipboard-check", `[{(testAnswers)}] (${test.name}, ${test.student.prettyName})`)
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
                                <input type="radio" onclick="event.preventDefault()" ${(() => { if (test.answers[i] == j) return 'checked'; return '' })()} name="question-${i}" id="question-${i}-option-${j}"><label for="question-${i}-option-${j}">${o}</label>
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
                                <input type="checkbox" onclick="event.preventDefault()" ${(() => { if (test.answers[i].includes(j)) return 'checked'; return '' })()} name="question-${i}" id="question-${i}-option-${j}"><label for="question-${i}-option-${j}">${o.text}</label>
                            </div>
                        `
                        j++
                    })
                } else if (q.type == 'open') {
                    let oE = document.createElement('div')
                    answerE.appendChild(oE)
                    oE.outerHTML = `
                        <div class="option">
                            <input type="text" value="${(() => { if (typeof test.answers[i] == 'object') return test.answers[i][0]; return test.answers[i] })()}" id="question-${i}-answer" disabled>
                            <div class="markInput" onclick="this.children[0].focus()"><input class="percent" id="question-value" type="number" min="-100" max="100"><p>%</p></div>
                        </div>
                    `
                }
                i++
            })
        })
}