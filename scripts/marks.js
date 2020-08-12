function minMaxInput(input) {
    let value = parseInt(input.value)
    let min = parseInt(input.getAttribute('min'))
    let max = parseInt(input.getAttribute('max'))
    if (value < min) input.value = min
    else if (value > max) input.value = max
}
window.addEventListener('load', () => {
    setPageTitle("calendar-check", "[{(marks)}]")
    setActiveTab(1)
})
window.addEventListener('ready', () => {
    if (userInfo.role == 'student' || userInfo.role == 'parent') {
        $('#manager').remove(); $('#period-container').removeAttribute('style')
        if (location.toString().includes("?")) URLparams = $parseURLArgs()
        let options = { method: 'POST' }
        if (userInfo.role == parent) options = { ...options, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentID: $parseCookies().selectedChild }) }
        fetch(`/${userInfo.role}s/marks/get`, options).then(res => res.json())
            .then(periods => {
                periods.forEach(period => {
                    if (period.subjects.length == 0) return;
                    let periodE = createElement({ type: 'div', classes: [ "period", `period-${period.periodID}` ] })
                    $('#period-container').appendChild(periodE)

                    periodE.appendChild(createElement({ type: 'div', classes: [ "period-title", `period-${period.periodID}-title` ], innerContent: { type: 'html', content: `<h2 class="period-title-inner">${period.periodName}</h2>` } }))

                    let periodEContent = createElement({ type: 'div', classes: [ "period-content", `period-${period.periodID}-content` ] })
                    periodE.appendChild(periodEContent)

                    period.subjects.forEach(subject => {
                        let subjectE = createElement({ type: 'div', classes: [ "subject", `subject-${subject.subjectID}` ] })
                        periodEContent.appendChild(subjectE)

                        subjectE.appendChild(createElement({ type: 'div', classes: [ "subject-title", `subject-${subject.subjectID}-title` ], innerContent: { type: 'html', content: `<h3 class="subject-title-inner">${subject.subjectName}</h3>` } }))

                        let subjectEContent = createElement({ type: 'div', classes: [ "subject-content", `subject-${subject.subjectID}-content` ] })
                        subjectE.appendChild(subjectEContent)

                        subject.marks.forEach(mark => {
                            let markE = createElement({ type: 'div', classes: [ "mark", `mark-${mark.markID}` ] })
                            subjectEContent.appendChild(markE)

                            let markEName = createElement({ type: 'div', classes: [ "mark-title" ] })
                            markE.appendChild(markEName)
                            if (mark.testID != undefined) markEName.innerHTML += `<img src="/imgs/webp/favicon.webp" class="alt-logo autogenerated-mark" title="[{(autogeneratedMark)}]"></i>`
                            markEName.innerHTML += `${mark.name}`

                            let markEContent = createElement({ type: 'div', classes: [ "mark-content" ] })
                            markE.appendChild(markEContent)
                            if (mark.testID == undefined || mark.finished === true) markEContent.innerHTML = `${mark.mark}%`
                            else if (mark.canBePerformed === true) markEContent.innerHTML = `<a href="/perform-test.html?ID=${mark.testID}"><i class="fad fa-play"></i>Perform Test</a>`
                            if (mark.definitive === false) markEContent.innerHTML += `<i class="fad fa-info-circle mark-not-definitive" title="[{(thisMarkIsntDefinitive)}]"></i>`
                        })
                    })
                })
                if ($('#period-container').children.length == 0) $('#period-container').innerHTML = getTemplate('empty-page')
                else if (location.toString().includes("?") && URLparams && URLparams.highlightID) {
                    $(`.mark-${URLparams.highlightID}`).classList.add('highlighted')
                    $('.highlighted').scrollIntoView()
                    if ($('.highlighted').getBoundingClientRect().top < 65) window.scrollBy(0, $('.highlighted').getBoundingClientRect().top - 65)
                }
            })
            .catch(e => qError({ message: e, goBack: true }))
    } else {
        $('#manager').removeAttribute('style'); $('#period-container').remove()
        myStudents = {}
        updateStudents = () => {
            $$('.student-chooser').forEach(studentChooser => {
                studentChooser.innerHTML = ''
                myStudents.students.forEach(student => studentChooser.innerHTML += getTemplate('student-chooser-option', { studentID: student.userID, name: student.prettyName, classID: student.class.classID }))
                studentChooser.parentElement.parentElement.querySelectorAll('li.student:not(.new-student)').forEach(studentLi => {
                    studentChooser.querySelector(`option[value="${studentLi.getAttribute('studentID')}"]`).remove()
                })
                if (studentChooser.children.length == 0) studentChooser.parentElement.style.display = 'none'
                else studentChooser.parentElement.removeAttribute('style')
            })
        }
        updateSubjectStudents = subjectChooser => {
            let classesWithThatSubject = []
            let subjectID = parseInt(subjectChooser.value)
            Object.keys(myStudents.subjectsByClass).forEach(subjectByClass => { if (myStudents.subjectsByClass[subjectByClass].includes(subjectID)) classesWithThatSubject.push(parseInt(subjectByClass)) })
            subjectChooser.parentElement.parentElement.nextElementSibling.querySelectorAll('li.student:not(.new-student)').forEach(studentLi => {
                if (classesWithThatSubject.includes(parseInt(studentLi.getAttribute('classID')))) studentLi.style.display = ''
                else studentLi.style.display = 'none'
            })
            updateStudents()
            subjectChooser.parentElement.parentElement.parentElement.querySelectorAll('.student-chooser').forEach(studentChooser => {
                studentChooser.querySelectorAll('option').forEach(studentOption => {
                    if (!classesWithThatSubject.includes(parseInt(studentOption.getAttribute('classID')))) studentOption.remove()
                })
                if (studentChooser.children.length == 0) studentChooser.parentElement.style.display = 'none'
                else studentChooser.parentElement.removeAttribute('style')
            })
        }
        fetch('/teachers/getInfo', { method: "POST" }).then(res => res.json())
            .then(res => {
                data = res
                data.forEach(clas => {
                    let clasE = document.createElement('li')
                    $('.my-classes-ul').appendChild(clasE)
                    clasE.outerHTML = getTemplate('class', { id: clas.classID, name: clas.className })
                })
            })
            .catch(e => qError({ message: e, goBack: true }))
        fetch('/teachers/marks/list', { method: 'POST' }).then(res => res.json())
            .then(res => {
                res.forEach(mark => {
                    $('.view-marks-ul').appendChild(createElement({ type: 'li', innerContent: { type: 'html', content: getTemplate('edit-mark', { markName: mark.name, period: mark.periodID, subject: mark.subject.subjectID, subjectName: mark.subject.prettyName, markID: mark.markID }) } }))
                    let marksE = $('.view-marks-ul').children[$('.view-marks-ul').children.length - 1].querySelector('.marks .students')
                    mark.marks.forEach(subMark => {
                        let foo = createElement({ type: 'a', innerContent: { type: 'html', content: getTemplate('edit-mark-student', { id: subMark.studentID, classID: subMark.student.class.classID, name: subMark.student.prettyName, value: subMark.mark }) } })
                        marksE.appendChild(foo)
                        foo.outerHTML = foo.innerHTML
                    })
                    let foo = createElement({ type: 'a', innerContent: { type: 'html', content: getTemplate('edit-mark-new-student') } })
                    marksE.appendChild(foo)
                    foo.outerHTML = foo.innerHTML
                })
                fetch('/teachers/listMyStudents', { method: 'POST' }).then(res => res.json())
                    .then(res => myStudents = res)
                fetch('/teachers/listMySubjects', { method: 'POST' }).then(res => res.json())
                    .then(res => {
                        $$('#view-marks .subject-chooser').forEach(subjectChooser => {
                            res.forEach(subject => {
                                let subjectE = createElement({ type: 'option', parameters: { value: subject.subjectID }, innerContent: { type: 'html', content: subject.prettyName } })
                                subjectChooser.appendChild(subjectE)
                                if (subject.current === true) { subjectE.innerHTML += " ([{(current)}])"; subjectChooser.value = subject.subjectID }
                                if (subjectChooser.getAttribute('value')) subjectChooser.value = subjectChooser.getAttribute('value')
                            })
                        })
                    })
            })
            .catch(e => qError({ message: e, goBack: true }))
        fetch('/misc/periods/list', { method: "POST" }).then(res => res.json())
            .then(res => {
                $$('.period-chooser').forEach(periodChooser => {
                    res.forEach(period => {
                        let periodE = createElement({ type: 'option', parameters: { value: period.periodID }, innerContent: { type: 'html', content: period.periodName } })
                        periodChooser.appendChild(periodE)
                        if (period.current === true) { periodE.innerHTML += " ([{(current)}])"; periodChooser.value = period.periodID }
                        if (periodChooser.getAttribute('value')) periodChooser.value = periodChooser.getAttribute('value')
                    })
                })
            })
            .catch(e => qError({ message: e, goBack: true }))
        update = updateID => {
            if (!updateID) return
            updateID = parseInt(updateID)
            let studentsInClass = $('.students-ul')
            let subjectChooser = $('#write-a-mark .subject-chooser')
            data.forEach(clas => {
                if (clas.classID == updateID) {
                    studentsInClass.innerHTML = ''; subjectChooser.innerHTML = ''
                    $('.students h3').innerHTML = `<i class="fad fa-users"></i>[{(studentsIn)}] ${clas.className}`
                    clas.classStudents.forEach(student => studentsInClass.appendChild(createElement({ type: 'li', classes: [ "student" ], innerContent: { type: 'html', content: getTemplate('student', { name: student.studentName, id: student.studentID }) } })))
                    clas.subjects.forEach(subject => subjectChooser.appendChild(createElement({ type: 'option', parameters: { value: subject.subjectID }, innerContent: { type: 'text', content: subject.subjectName } })))
                }
            })
            $('.my-classes-and-students').style = "margin-bottom: 20px;"
            $('.submit').removeAttribute('style'); $('.students').removeAttribute('style'); $('.mark-info').removeAttribute('style')
        }
        submit = () => {
            let invalid = false
            let sendData = {
                name: $('#write-a-mark .mark-name').value,
                subjectID: parseInt($('#write-a-mark .subject-chooser').value),
                periodID: parseInt($('#write-a-mark .period-chooser').value),
                marks: []
            }
            $$('#write-a-mark .students-ul .mark-input input').forEach(e => {
                if (getComputedStyle(e.parentElement).display != "none" && e.value != '') {
                    let mark = parseInt(e.value), min = parseInt(e.getAttribute('min')), max = parseInt(e.getAttribute('max'))
                    if (mark < min) mark = min
                    if (mark > max) mark = max
                    sendData.marks.push({ studentID: parseInt(e.getAttribute('studentID')), mark: mark })
                } else invalid = true
            })
            if (!sendData.name || !sendData.subjectID || !sendData.periodID || !sendData.marks.length > 0 || invalid === true) return qAlert({ message: "[{(error.invalidInput)}]", mode: 'error', buttons: { cancel: { invisible: true } } })
            fetch('/teachers/marks/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sendData) }).then(res => res.json()
                .then(() => qAlert({ message: "[{(success.markSubmit)}]", mode: 'success', buttons: { cancel: { invisible: true } } }).then(ans => { if (ans == true) location.reload() }) ))
                .catch(e => qError({ message: e, goBack: false }))
        }
        submitEdit = (elem, markID) => {
            let invalid = false
            let sendData = {
                name: elem.querySelector('.mark-name').value,
                subjectID: parseInt(elem.querySelector('.subject-chooser').value),
                periodID: parseInt(elem.querySelector('.period-chooser').value),
                marks: [],
                markID: markID
            }
            elem.querySelectorAll('li.student:not(.new-student)').forEach(studentLi => {
                if (studentLi.style.display != 'none') {
                    sendData.marks.push({
                        studentID: parseInt(studentLi.getAttribute('studentID')),
                        mark: parseInt(studentLi.querySelector('input[type=number]').value)
                    })
                    if (!studentLi.querySelector('input[type=number]').value) invalid = true
                }
            })
            if (!sendData.name || !sendData.subjectID || !sendData.periodID || sendData.marks.length == 0 || invalid === true) return qAlert({ message: '[{(error.invalidInput)}]', mode: 'error', buttons: { cancel: { invisible: true } } })
            fetch('/teachers/marks/edit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sendData) }).then(res => res.json()
                .then(() => qAlert({ message: "[{(success.markEdit)}]", mode: 'success', buttons: { cancel: { invisible: true } } }).then(ans => { if (ans == true) location.reload() }) ))
                .catch(e => qError({ message: e, goBack: false }))
        }
    }
})