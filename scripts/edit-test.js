function recount() {
    let i = 0
    $$('.question').forEach(q => {
        q.setAttribute('i', i)
        i++
    })
}
function editQuestion(i) {
    i = parseInt(i)
    let question = testData.questions[i]
    updateEditQuestionModal(question.type, i)
    toggleModal('edit-question')
}
function editQuestionSave(i) {
    i = parseInt(i)
}
function updateEditQuestionModal(value, readFromTestData) {
    let answersE = $('.question-answer')
    answersE.style = ''
    answersE.innerHTML = ''
    if (readFromTestData) {
        let question = testData.questions[readFromTestData]
        $('#question-type').value = question.type
        if (value == question.type) {
            if (value == "single-choice") {
                let i = 0
                question.options.forEach(option => {
                    let optionE = document.createElement('li')
                    answersE.appendChild(optionE)
                    let checked = question.correctAnswer == i ? 'checked' : ''
                    optionE.innerHTML = `
                        <input type="radio"${checked} name="edit-question-modal-single-choice" id="edit-question-modal-single-choice-${i}"><label for="edit-question-modal-single-choice">${option}</label>
                    `
                    i++
                })
            }
        }
    }
}
window.addEventListener('load', () => {
    setActiveTab(3)

    let footer = document.createElement('footer')
    document.body.appendChild(footer)
    footer.classList.add('blurry-bg')
    footer.innerHTML = `<div><i class="fad fa-check-circle"></i>[{(saved)}]</div>`
    footer.innerHTML = `<div><div class="spinner"></div>[{(saving)}]</div>`

    testData = {
        "name": "Test Test 1",
        "subjectID": 1,
        "classID": 1,
        "testID": 1,
        "startDate": {
            "year": 2020,
            "month": 7,
            "day": 22,
            "hour": 0,
            "minutes": 0
        },
        "dueDate": {
            "year": 2020,
            "month": 7,
            "day": 30,
            "hour": 23,
            "minutes": 59
        },
        "questions": [
            {
                "question": "Question 1",
                "type": "open",
                "value": 1
            },
            {
                "question": "Question 2",
                "type": "single-choice",
                "options": [ "Choice 1", "Choice 2", "Choice 3", "Choice 4", "Choice 5" ],
                "correctAnswer": 0,
                "value": 1.5
            },
            {
                "question": "Question 3",
                "type": "multiple-choice",
                "options": [
                    {
                        "text": "Choice 1",
                        "value": 0.33
                    },
                    {
                        "text": "Choice 2",
                        "value": 0.33
                    },
                    {
                        "text": "Choice 3",
                        "value": 0.33
                    },
                    {
                        "text": "Choice 4",
                        "value": 0
                    },
                    {
                        "text": "Choice 5",
                        "value": -0.33
                    }
                ]
            }
        ]
    }
    setPageTitle("clipboard-check", `[{(edit)}] ${testData.name}`)

    let i = 0
    let qContainer = $('#question-container')
    testData.questions.forEach(q => {
        let qE = document.createElement('div')
        qContainer.appendChild(qE)
        qE.outerHTML = `
            <div class="question" i="${i}" onclick="">
                <div class="question-info">
                    <p class="question-title">${q.question}</p>
                    <p class="question-type">[{(${q.type})}]</p>
                </div>
                <div class="question-controls">
                    <i title="[{(delete)}]" class="fad detele-question fa-trash" onclick="testData.questions.splice(this.parentElement.parentElement.getAttribute('i'), 1); this.parentElement.parentElement.remove(); recount()"></i>
                    <i title="[{(moveUp)}]" class="fas move-question move-question-up fa-chevron-up"></i>
                    <i title="[{(edit)}]" class="fad edit-question fa-edit" onclick="editQuestion(this.parentElement.parentElement.getAttribute('i'))"></i>
                    <i title="[{(moveDown)}]" class="fas move-question move-question-down fa-chevron-down"></i>
                </div>
            </div>
        `
        i++
    })
    $$('.question .move-question-up').forEach(el => {
        el.addEventListener('click', function() {
            let q = el.parentElement.parentElement
            if (q != q.parentElement.children[0]) {
                q.parentElement.insertBefore(q, q.previousElementSibling)
                let i = parseInt(q.getAttribute('i'))
                let a = testData.questions[i]
                testData.questions[i] = testData.questions[i - 1]
                testData.questions[i - 1] = a
                recount()
            }
        })
    })
    $$('.question .move-question-down').forEach(el => {
        el.addEventListener('click', function() {
            let q = el.parentElement.parentElement
            if (q != q.parentElement.children[q.parentElement.children.length]) {
                q.parentElement.insertBefore(q, q.nextElementSibling.nextElementSibling)
                let i = parseInt(q.getAttribute('i'))
                let a = testData.questions[i]
                testData.questions[i] = testData.questions[i + 1]
                testData.questions[i + 1] = a
                recount()
            }
        })
    })
})