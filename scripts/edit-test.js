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
    const question = testData.questions[i]
    $('#question-type').value = question.type
    if (question.type == "single-choice") $('#question-value').value = question.value
    $('#edit-question-modal').setAttribute('i', i)
    updateEditQuestionModal(question.type, i)
    toggleModal('edit-question')
}
function editQuestionSave(i) {
    if ($('#question-question').value && $('#question-type').value) {
        i = parseInt(i)
        let answers = []
        let anyCorrect = false
        let correct = null
        let j = 0
        let invalid = false
        const type = $('#question-type').value
        if (type == "single-choice") {
            $$('li.single-choice:not(.new-option) input[type=text]').forEach(el => {
                if (el.value) answers.push(el.value)
                else invalid = true
                if (el.previousElementSibling.checked) { anyCorrect = true; correct = j }
                j++
            })
        } else if (type == "multiple-choice") {
            $$('li.multiple-choice:not(.new-option)').forEach(el => {
                if (el.querySelector('input[type=text]').value && el.querySelector('input[type=number]').value != "") answers.push({ text: el.querySelector('input[type=text]').value, value: parseFloat(el.querySelector('input[type=number]').value) })
                else invalid = true
                if (el.querySelector('input[type=number]').value > 0) anyCorrect = true
            })
        }
        if (invalid || (type != "open" && (answers.length <= 1 || anyCorrect == false)) || ((type == "single-choice" || type == 'open') && !$('#question-value').value)) return qAlert({ message: '[{(error.invalidInput)}]', mode: 'error', buttons: { cancel: { invisible: true } } })

        delete testData.questions[i].correctAnswer
        delete testData.questions[i].options
        delete testData.questions[i].value

        testData.questions[i].question = $('#question-question').value
        testData.questions[i].type = type
        if (type != "open") testData.questions[i].options = answers
        if (type == "single-choice") testData.questions[i].correctAnswer = correct
        if (type != "multiple-choice") testData.questions[i].value = parseInt($('.question-value input').value)
        toggleModal('edit-question')
        rerender()
    } else qAlert({ message: '[{(error.invalidInput)}]', mode: 'error', buttons: { cancel: { invisible: true } } })
}
function updateEditQuestionModal(value, testDataI) {
    if (testDataI) testDataI = parseInt(testDataI)
    let answersE = $('.question-answer')
    let question = testData.questions[testDataI]
    answersE.innerHTML = ''
    $('.question-value').style.display = 'none'
    if (testDataI != undefined) $('#question-question').value = testData.questions[testDataI].question
    if (value == "single-choice") {
        $('.question-value').style.display = ''
        if (testDataI != undefined) $('#question-value').value = question.value
        if (testDataI != undefined && value == question.type) {
            let i = 0
            question.options.forEach(option => {
                let optionE = document.createElement('li')
                answersE.appendChild(optionE)
                optionE.classList.add('existing-option', 'single-choice')
                optionE.innerHTML = `
                    <input type="radio" ${question.correctAnswer == i ? 'checked' : ''} name="edit-question-modal-single-choice">
                    <input type="text" value="${option}">
                `
                i++
            })
        }
        let optionE = document.createElement('li')
        answersE.appendChild(optionE)
        optionE.classList.add('new-option', 'single-choice')
        optionE.innerHTML = `
            <input type="radio" disabled name="edit-question-modal-single-choice">
            <input type="text" placeholder="[{(typeToAddAnOption)}]...">
        `
    } else if (value == "multiple-choice") {
        if (testDataI != undefined && value == question.type) {
            let i = 0
            question.options.forEach(option => {
                let optionE = document.createElement('li')
                answersE.appendChild(optionE)
                optionE.classList.add('existing-option', 'multiple-choice')
                optionE.innerHTML = `
                    <input type="checkbox" checked oninput="this.checked = true" style="pointer-events: none;">
                    <input type="text" value="${option.text}">
                    <div class="markInput" onclick="this.children[0].focus()">
                        <input class="percent" id="question-value" type="number" value="${option.value}" min="-100" max="100">
                        <p>%</p>
                    </div>
                `
                i++
            })
        }
        let optionE = document.createElement('li')
        answersE.appendChild(optionE)
        optionE.classList.add('new-option', 'multiple-choice')
        optionE.innerHTML = `
            <input type="checkbox" oninput="this.checked = true" style="pointer-events: none;">
            <input type="text" placeholder="[{(typeToAddAnOption)}]...">
            <div class="markInput" onclick="this.children[0].focus()">
                <input class="percent" id="question-value" type="number" value=0 min="-100" max="100">
                <p>%</p>
            </div>
        `
    } else if (value == 'open') {
        $('.question-value').style.display = ''
        if (testDataI != undefined) $('#question-value').value = question.value
    }
    addFunctionality()
}
function editTest() {
    let startHours = testData.startTime.hours
    let startMinutes = testData.startTime.minutes
    let startDay = testData.startTime.day
    let startMonth = testData.startTime.month
    if (startHours < 10) startHours = `0${startHours}`
    if (startMinutes < 10) startMinutes = `0${startMinutes}`
    if (startDay < 10) startDay = `0${startDay}`
    if (startMonth < 10) startMonth = `0${startMonth}`

    let dueHours = testData.dueTime.hours
    let dueMinutes = testData.dueTime.minutes
    let dueDay = testData.dueTime.day
    let dueMonth = testData.dueTime.month
    if (dueHours < 10) dueHours = `0${dueHours}`
    if (dueMinutes < 10) dueMinutes = `0${dueMinutes}`
    if (dueDay < 10) dueDay = `0${dueDay}`
    if (dueMonth < 10) dueMonth = `0${dueMonth}`

    $('#test-name').value = testData.name
    $('#test-start-date').value = `${testData.startTime.year}-${startMonth}-${startDay}`
    $('#test-start-time').value = `${startHours}:${startMinutes}`
    $('#test-due-date').value = `${testData.dueTime.year}-${dueMonth}-${dueDay}`
    $('#test-due-time').value = `${dueHours}:${dueMinutes}`

    toggleModal('edit-test')
}
function editTestSave() {
    if ($('#test-name').value && $('#test-start-date').value && $('#test-start-time').value && $('#test-due-date').value &&
        $('#test-due-time').value && $('#edit-test-modal li.class input[type=radio]:checked') &&
        $('#edit-test-modal #subject-chooser').value && $('#edit-test-modal #period-chooser').value) {

        testData.name = $('#test-name').value
        testData.periodID = parseInt($('#edit-test-modal #period-chooser').value)
        testData.subjectID = parseInt($('#edit-test-modal #subject-chooser').value)
        testData.classID = parseInt($('#edit-test-modal li.class input[type=radio]:checked').value)
        testData.startTime.year = parseInt($('#test-start-date').value.split('-')[0])
        testData.startTime.month = parseInt($('#test-start-date').value.split('-')[1])
        testData.startTime.day = parseInt($('#test-start-date').value.split('-')[2])
        testData.startTime.hours = parseInt($('#test-start-time').value.split(':')[0])
        testData.startTime.minutes = parseInt($('#test-start-time').value.split(':')[1])
        testData.dueTime.year = parseInt($('#test-due-date').value.split('-')[0])
        testData.dueTime.month = parseInt($('#test-due-date').value.split('-')[1])
        testData.dueTime.day = parseInt($('#test-due-date').value.split('-')[2])
        testData.dueTime.hours = parseInt($('#test-due-time').value.split(':')[0])
        testData.dueTime.minutes = parseInt($('#test-due-time').value.split(':')[1])

        setPageTitle("clipboard-check", `[{(editTest)}] (${testData.name})`)
        toggleModal('edit-test')
    } else qAlert({ message: '[{(error.invalidInput)}]', mode: 'error', buttons: { cancel: { invisible: true } } })
}
function addFunctionality() {
    $$('#edit-question-modal li.new-option.single-choice > input[type=text]').forEach(el => el.addEventListener('input', function() {
        if (this.parentElement.classList.contains('new-option')) {
            let optionEnew = document.createElement('li')
            $('.question-answer').appendChild(optionEnew)
            optionEnew.classList.add('new-option', 'single-choice')
            optionEnew.innerHTML = `
                <input type="radio" disabled name="edit-question-modal-single-choice">
                <input type="text" placeholder="[{(typeToAddAnOption)}]...">
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
                <input type="checkbox" oninput="this.checked = true" style="pointer-events: none;" name="edit-question-modal-multiple-choice" id="edit-question-modal-multiple-choice-new">
                <input type="text" placeholder="[{(typeToAddAnOption)}]...">
                <div class="markInput" onclick="this.children[0].focus()">
                    <input class="percent" id="question-value" type="number" value=0 min="-100" max="100">
                    <p>%</p>
                </div>
            `
            addFunctionality()
        }
        this.placeholder = ''
        this.parentElement.classList.remove('new-option')
        this.parentElement.classList.add('added-option')
        this.previousElementSibling.checked = true
    }))
    $$('#edit-question-modal li > input[type=text]').forEach(el => el.addEventListener('blur', function() {
        if (!this.parentElement.classList.contains('new-option') && !this.value) this.parentElement.remove()
    }))
    $$('.question .move-question-up').forEach(el => {
        try {
            el.removeEventListener('click', moveUp)
        } catch {}
        el.addEventListener('click', moveUp)
    })
    $$('.question .move-question-down').forEach(el => {
        try { el.removeEventListener('click', moveDown) } catch {}
        el.addEventListener('click', moveDown)
    })
    $$('input[type=number]').forEach(e => e.addEventListener('input', () => minMaxInput(e)))
}
function save() {
    $('footer').removeAttribute('style')
    $('main').style.marginBottom = "42px"
    $('footer').innerHTML = `<div><div class="spinner"></div>[{(saving)}]...</div>`
    fetch('/teachers/tests/edit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
    }).then(res => res.json())
        .then(res => {
            if (res.message = 'ok') $('footer').innerHTML = `<div><i class="fad fa-check-circle"></i>[{(saved)}]</div>`
            else $('footer').innerHTML = `<div><i class="fad fa-times-circle"></i>[{(error.unknown)}]</div>`
            setTimeout(() => { $('footer').style.display = 'none'; $('main').style.marginBottom = "0"}, 3000)
        })
        .catch(e => {
            $('footer').innerHTML = `<div><i class="fad fa-times-circle"></i>[{(error.unknown)}]</div>`
            setTimeout(() => {
                $('footer').style.display = 'none'
                $('main').style.marginBottom = 0
            }, 3000)
        })
}
autoSave = () => setTimeout(() => { save(); autoSave() }, 10000)
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
        question: "[{(newQuestion)}]",
        type: "open",
        value: 0
    })
    addFunctionality()
    rerender()
    editQuestion($('#question-container').children[$('#question-container').children.length - 1].getAttribute('i'))
}
function moveUp(event) {
    const q = event.path[2]
    if (q != q.parentElement.children[0]) {
        q.parentElement.insertBefore(q, q.previousElementSibling)
        const i = parseInt(q.getAttribute('i'))
        const a = testData.questions[i]
        testData.questions[i] = testData.questions[i - 1]
        testData.questions[i - 1] = a
        rerender()
    }
}
function moveDown(event) {
    const q = event.path[2]
    if (q.nextElementSibling) q.nextElementSibling.querySelector('.move-question-up').click()
}
function deleteQuestion(questionE) {
    testData.questions.splice(parseInt(questionE.getAttribute('i')), 1)
    questionE.remove()
    rerender()
}
window.addEventListener('load', () => {
    setPageTitle("clipboard-check", `[{(loading)}]`)
    setActiveTab(2, true)
})
window.addEventListener('ready', () => {
    if (userInfo.role != 'teacher') return qAlert({ message: "[{(error.notAllowed)}]", mode: 'error', buttons: { cancel: { invisible: true } } }).then(a => history.back())
    if ($parseURLArgs().ID == undefined) return qAlert({ message: "[{(error.wrongID)}]", mode: 'error', buttons: { cancel: { invisible: true } } }).then(a => history.back())
    let footer = document.createElement('footer')
    document.body.appendChild(footer)
    footer.classList.add('blurry-bg')
    footer.style.display = 'none'
    $('main').style.marginBottom = 0

    fetch('/teachers/tests/get', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ID: $parseURLArgs().ID })
    }).then(res => res.json())
        .then(res => {
            testData = res
            setPageTitle("clipboard-check", `[{(editTest)}] (${res.name})`)
            let i = 0
            const qContainer = $('#question-container')
            res.questions.forEach(q => {
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
                            <i title="[{(delete)}]" class="fad delete-question fa-trash" onclick="deleteQuestion(this.parentElement.parentElement)"></i>
                            <i title="[{(moveUp)}]" class="fas move-question move-question-up fa-chevron-up"></i>
                            <i title="[{(edit)}]" class="fad edit-question fa-edit" onclick="editQuestion(this.parentElement.parentElement.getAttribute('i'))"></i>
                            <i title="[{(moveDown)}]" class="fas move-question move-question-down fa-chevron-down"></i>
                        </div>
                    </div>
                `
                i++
            })
            addFunctionality()
            autoSave()
        })
        .catch(e => qError({ message: e, goBack: true }))
})
window.addEventListener('online', save)
window.addEventListener('toggle-modal-edit-test', () => {
    if ($('#edit-test-modal').style.display == 'none') return
    fetch('/teachers/getInfo', { method: "POST" }).then(res => res.json()
        .then(res => {
            data = res
            let myClasses = $('#my-classes')
            myClasses.innerHTML = ''
            data.forEach(clas => {
                let clasE = document.createElement('li')
                myClasses.appendChild(clasE)
                clasE.outerHTML = `<li class="class"><input type="radio" oninput="update(this.value)" id="class-${clas.classID}" name="class" value="${clas.classID}"><label for="class-${clas.classID}">${clas.className}</label></li>`
            })

            $(`#my-classes li.class input[type=radio][value="${testData.classID}"]`).click()
            $('#subject-chooser').value = testData.subjectID
        }))
        .catch(e => qError({ message: e, goBack: true }))
    fetch('/misc/periods/list', { method: "POST" }).then(res => res.json()
        .then(res => {
            let periodChooser = $('#period-chooser')
            periodChooser.innerHTML = ''
            res.forEach(period => {
                let periodE = document.createElement('option')
                periodChooser.appendChild(periodE)
                let periodDisplayName = period.periodName
                if (period.current === true) { periodDisplayName = `${periodDisplayName} ([{(current)}])` }
                periodE.outerHTML = `<option value="${period.periodID}">${periodDisplayName}</option>`
                if (period.current === true) { periodChooser.value = period.periodID }
            })
        }))
        .catch(e => qError({ message: e, goBack: true }))
    update = updateID => {
        if (!updateID) return
        updateID = parseInt(updateID)
        let subjectChooser = $('#subject-chooser')
        data.forEach(clas => {
            if (clas.classID == updateID) {
                subjectChooser.innerHTML = ''
                clas.subjects.forEach(subject => {
                    subjectE = document.createElement('option')
                    subjectChooser.appendChild(subjectE)
                    subjectE.outerHTML = `<option value="${subject.subjectID}">${subject.subjectName}</option>`
                })
            }
        })
        $('.subject-chooser-div').style = ""
    }
})