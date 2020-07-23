function rerender() {
    let i = 0
    $$('.question').forEach(qE => {
        let q = testData.questions[i]
        if (q.type == 'open') type = '[{(openAnswer)}]'
        else if (q.type == 'single-choice') type = '[{(singleChoice)}]'
        else if (q.type == 'multiple-choice') type = '[{(multipleChoice)}]'
        qE.querySelector('.question-title').innerHTML = q.question
        qE.querySelector('.question-type').innerText = type
        qE.setAttribute('i', i)
        i++
    })
}
function editQuestion(i) {
    i = parseInt(i)
    let question = testData.questions[i]
    $('#question-type').value = question.type
    $('#edit-question-modal').setAttribute('i', i)
    updateEditQuestionModal(question.type, i)
    toggleModal('edit-question')
}
function editQuestionSave(i) {
    if ($('#question-question').value && $('#question-type').value) {
        i = parseInt(i)
        toggleModal('edit-question')
        testData.questions[i].question = $('#question-question').value
        testData.questions[i].type = $('#question-type').value
        rerender()
    } else qAlert({ message: '[{(error.invalidInput)}]', mode: 'error', buttons: { cancel: { invisible: true } } })
}
function addFunctionality() {
    $$('#edit-question-modal li.new-option.single-choice > input[type=text]').forEach(el => el.addEventListener('input', function() {
        if (this.parentElement.classList.contains('new-option')) {
            let optionEnew = document.createElement('li')
            $('.question-answer').appendChild(optionEnew)
            optionEnew.classList.add('new-option', 'single-choice')
            optionEnew.innerHTML = `
                <input type="radio" disabled name="edit-question-modal-single-choice" id="edit-question-modal-single-choice-new"><input type="text" placeholder="[{(typeToAddAnOption)}]...">
            `
            addFunctionality()
        }
        this.placeholder = ''
        this.parentElement.classList.remove('new-option')
        this.parentElement.classList.add('added-option')
        this.previousElementSibling.disabled = false
    }))
    $$('#edit-question-modal li.new-option.multiple-choice > input[type=text]').forEach(el => el.addEventListener('input', function() {
        if (this.parentElement.classList.contains('new-option')) {
            let optionEnew = document.createElement('li')
            $('.question-answer').appendChild(optionEnew)
            optionEnew.classList.add('new-option', 'multiple-choice')
            optionEnew.innerHTML = `
            <input type="checkbox" checked oninput="this.checked = true" style="pointer-events: none;" name="edit-question-modal-multiple-choice" id="edit-question-modal-multiple-choice-new"><input type="text" placeholder="[{(typeToAddAnOption)}]..."><input type="number" disabled placeholder="" min="-100" max="100" title="" value=0>
            `
            addFunctionality()
        }
        this.placeholder = ''
        this.parentElement.classList.remove('new-option')
        this.parentElement.classList.add('added-option')
        this.nextElementSibling.disabled = false
    }))
    $$('#edit-question-modal li > input[type=text]').forEach(el => el.addEventListener('blur', function() {
        if (!this.parentElement.classList.contains('new-option') && this.value == "") this.parentElement.remove()
    }))
    $$('input[type=number]').forEach(e => e.addEventListener('input', () => {
        let min = parseInt(e.getAttribute('min'))
        let max = parseInt(e.getAttribute('max'))
        if (e.value < min) e.value = min
        if (e.value > max) e.value = max
    }))
    $$('.question .move-question-up').forEach(el => {
        el.addEventListener('click', function() {
            let q = el.parentElement.parentElement
            if (q != q.parentElement.children[0]) {
                q.parentElement.insertBefore(q, q.previousElementSibling)
                let i = parseInt(q.getAttribute('i'))
                let a = testData.questions[i]
                testData.questions[i] = testData.questions[i - 1]
                testData.questions[i - 1] = a
                rerender()
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
                rerender()
            }
        })
    })
    $$('input[type=number]').forEach(e => e.addEventListener('input', () => {
        let min = parseInt(e.getAttribute('min'))
        let max = parseInt(e.getAttribute('max'))
        if (e.value < min) e.value = min
        if (e.value > max) e.value = max
    }))
}
function updateEditQuestionModal(value, readFromTestData) {
    if (readFromTestData) readFromTestData = parseInt(readFromTestData)
    let answersE = $('.question-answer')
    answersE.innerHTML = ''

    let qQuestion = $('#question-question')
    $('.question-value').style.display = 'none'
    qQuestion.value = testData.questions[readFromTestData].question
    let question = testData.questions[readFromTestData]
    if (value == "single-choice") {
        $('.question-value').style.display = ''
        if (value == question.type && readFromTestData) {
            let i = 0
            question.options.forEach(option => {
                let optionE = document.createElement('li')
                answersE.appendChild(optionE)
                optionE.classList.add('existing-option', 'single-choice')
                let checked = question.correctAnswer == i ? 'checked' : ''
                optionE.innerHTML = `
                    <input type="radio"${checked} name="edit-question-modal-single-choice" id="edit-question-modal-single-choice-${i}"><input type="text" value="${option}">
                `
                i++
            })
        }
        let optionE = document.createElement('li')
        answersE.appendChild(optionE)
        optionE.classList.add('new-option', 'single-choice')
        optionE.innerHTML = `
            <input type="radio" disabled name="edit-question-modal-single-choice" id="edit-question-modal-single-choice-new"><input type="text" placeholder="[{(typeToAddAnOption)}]...">
        `
    } else if (value == "multiple-choice") {
        if (value == question.type && readFromTestData) {
            let i = 0
            question.options.forEach(option => {
                let optionE = document.createElement('li')
                answersE.appendChild(optionE)
                optionE.classList.add('existing-option', 'multiple-choice')
                optionE.innerHTML = `
                    <input type="checkbox" checked oninput="this.checked = true" style="pointer-events: none;" name="edit-question-modal-multiple-choice" id="edit-question-modal-multiple-choice-${i}"><input type="text" value="${option.text}"><input type="number" placeholder="" min="-100" max="100" title="" value="${option.value}">
                `
                i++
            })
        }
        let optionE = document.createElement('li')
        answersE.appendChild(optionE)
        optionE.classList.add('new-option', 'multiple-choice')
        optionE.innerHTML = `
            <input type="checkbox" checked oninput="this.checked = true" style="pointer-events: none;" name="edit-question-modal-multiple-choice" id="edit-question-modal-multiple-choice-new"><input type="text" placeholder="[{(typeToAddAnOption)}]..."><input type="number" disabled placeholder="" min="-100" max="100" title="" value=0>
        `
    }
    addFunctionality()
}
function save() {
    $('footer').style = ''
    $('main').style.marginBottom = "42px"
    $('footer').innerHTML = `<div><div class="spinner"></div>[{(saving)}]</div>`
    fetch('/teachers/tests/edit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(testData) })
        .then(res => res.json())
        .then(res => {
            if (res.message = 'ok') $('footer').innerHTML = `<div><i class="fad fa-check-circle"></i>[{(saved)}]</div>`
            else $('footer').innerHTML = `<div><i class="fad fa-times-circle"></i>[{(error.unknown)}]</div>`
            setTimeout(() => { $('footer').style.display = 'none'; $('main').style.marginBottom = "0"}, 3000)
        })
        .catch(e => { $('footer').innerHTML = `<div><i class="fad fa-times-circle"></i>[{(error.unknown)}]</div>`; setTimeout(() => { $('footer').style.display = 'none'; $('main').style.marginBottom = "0"}, 3000) })
}
function autoSave() {
    setTimeout(() => { save(); autoSave() }, 60000)
}
autoSave()
function newQuestion() {
    let qE = document.createElement('div')
    $('#question-container').appendChild(qE)
    qE.outerHTML = `
        <div class="question">
            <div class="question-info">
                <p class="question-title">[{(newQuestion)}]</p>
                <p class="question-type">[{(newQuestion)}]</p>
            </div>
            <div class="question-controls">
                <i title="[{(delete)}]" class="fad detele-question fa-trash" onclick="testData.questions.splice(this.parentElement.parentElement.getAttribute('i'), 1); this.parentElement.parentElement.remove(); rerender()"></i>
                <i title="[{(moveUp)}]" style="cursor: pointer;" class="fas move-question move-question-up fa-chevron-up"></i>
                <i title="[{(edit)}]" class="fad edit-question fa-edit" onclick="editQuestion(this.parentElement.parentElement.getAttribute('i'))"></i>
                <i title="[{(moveDown)}]" style="cursor: pointer;" class="fas move-question move-question-down fa-chevron-down"></i>
            </div>
        </div>
    `
    testData.questions.push({
        "question": "[{(newQuestion)}]",
    })
    addFunctionality()
    rerender()
    editQuestion($('#question-container').children[$('#question-container').children.length - 1].getAttribute('i'))
}

window.addEventListener('load', () => {
    setPageTitle("clipboard-check", `[{(loading)}]`)
    setActiveTab(2)
    let footer = document.createElement('footer')
    document.body.appendChild(footer)
    footer.classList.add('blurry-bg')
    footer.style.display = 'none'
    $('main').style.marginBottom = "0"
    
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
    setPageTitle("clipboard-check", `[{(editTest)}] (${testData.name})`)
    let i = 0
    let qContainer = $('#question-container')
    testData.questions.forEach(q => {
        let qE = document.createElement('div')
        qContainer.appendChild(qE)
        let type = ''
        if (q.type == 'open') type = '[{(openAnswer)}]'
        else if (q.type == 'single-choice') type = '[{(singleChoice)}]'
        else if (q.type == 'multiple-choice') type = '[{(multipleChoice)}]'
        qE.outerHTML = `
            <div class="question" i="${i}">
                <div class="question-info">
                    <p class="question-title">${q.question}</p>
                    <p class="question-type">${type}</p>
                </div>
                <div class="question-controls">
                    <i title="[{(delete)}]" class="fad detele-question fa-trash" onclick="testData.questions.splice(this.parentElement.parentElement.getAttribute('i'), 1); this.parentElement.parentElement.remove(); rerender()"></i>
                    <i title="[{(moveUp)}]" style="cursor: pointer;" class="fas move-question move-question-up fa-chevron-up"></i>
                    <i title="[{(edit)}]" class="fad edit-question fa-edit" onclick="editQuestion(this.parentElement.parentElement.getAttribute('i'))"></i>
                    <i title="[{(moveDown)}]" style="cursor: pointer;" class="fas move-question move-question-down fa-chevron-down"></i>
                </div>
            </div>
        `
        i++
    })
})