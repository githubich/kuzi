setPageTitle("calendar-check", "marks.title")
setActiveTab(2)

function load() {
    if (userInfo.role == "student") {
        $('#manager').remove()
        fetch('/marks/get', { method: "POST" })
            .then(res => res.json()
                .then(periods => {
                    let periodContainer = document.createElement('div')
                    $('#root').appendChild(periodContainer)
                    periodContainer.id = "period-container"

                    periods.forEach(period => {
                        let periodE = document.createElement('div')
                        periodContainer.appendChild(periodE)
                        periodE.classList.add("period", `period-${period.periodID}`)

                        let periodETitle = document.createElement('div')
                        periodE.appendChild(periodETitle)
                        periodETitle.classList.add("period-title", `period-${period.periodID}-title`)
                        periodETitle.innerHTML = `<h2 class="period-title-inner">${period.periodName}</h2>`

                        let periodEContent = document.createElement('div')
                        periodE.appendChild(periodEContent)
                        periodEContent.classList.add("period-content", `period-${period.periodID}-content`)

                        period.subjects.forEach(subject => {
                            let subjectE = document.createElement('div')
                            periodEContent.appendChild(subjectE)
                            subjectE.classList.add("subject", `subject-${subject.subjectID}`)

                            let subjectETitle = document.createElement('div')
                            subjectE.appendChild(subjectETitle)
                            subjectETitle.classList.add("subject-title", `subject-${subject.subjectID}-title`)
                            subjectETitle.innerHTML = `<h3 class="subject-title-inner">${subject.subjectName}</h3>`

                            let subjectEContent = document.createElement('div')
                            subjectE.appendChild(subjectEContent)
                            subjectEContent.classList.add("subject-content", `subject-${subject.subjectID}-content`)

                            subject.marks.forEach(mark => {
                                let markE = document.createElement('div')
                                subjectEContent.appendChild(markE)
                                markE.classList.add("mark")

                                let markEName = document.createElement('div')
                                markE.appendChild(markEName)
                                markEName.classList.add("mark-title")
                                markEName.innerHTML = `${mark.name}`

                                let markEContent = document.createElement('div')
                                markE.appendChild(markEContent)
                                markEContent.classList.add("mark-content")
                                markEContent.innerHTML = `${mark.mark}%`
                            })
                        })
                    })
                })
            )
    } else {
        $$('.tab').forEach(tab => tab.setAttribute('onclick', `$('.tab.selected').classList.remove('selected'); this.classList.add('selected')`))
        fetch('/teachers/marks/getInfo', { method: "POST" })
            .then(res => res.json()
                .then(res => {
                    data = res
                    let myClasses = $('#my-classes')
                    data.forEach(clas => {
                        let clasE = document.createElement('li')
                        myClasses.appendChild(clasE)
                        clasE.outerHTML = `<li class="class"><input type="radio" oninput="update(this.value)" id="class-${clas.classID}" name="class" value="${clas.classID}"><label for="class-${clas.classID}">${clas.className}</label></li>`
                    })
                }))
        fetch('/periods/list', { method: "POST" })
            .then(res => res.json()
                .then(res => {
                    let periodChooser = $('#period-chooser')
                    res.forEach(period => {
                        let periodE = document.createElement('option')
                        periodChooser.appendChild(periodE)
                        let periodDisplayName = period.periodName
                        if (period.current === true) { periodDisplayName = `${periodDisplayName} marks.teacher.currentPeriod` }
                        periodE.outerHTML = `<option value="${period.periodID}">${periodDisplayName}</option>`
                        if (period.current === true) { periodChooser.value = period.periodID }
                    })
                }))
        update = (updateID) => {
            if (!updateID) return
            updateID = parseInt(updateID)
        
            let studentsInClass = $('#students-in-class')
            let subjectChooser = $('#subject-chooser')
        
            data.forEach(clas => {
                if (clas.classID == updateID) {
                    studentsInClass.innerHTML = ''
                    subjectChooser.innerHTML = ''
                    $('.students-block h3').innerHTML = `<i class="fad fa-users"></i>marks.teacher.studentsIn ${clas.className}`
                    clas.classStudents.forEach(student => {
                        studentE = document.createElement('li')
                        studentsInClass.appendChild(studentE)
                        studentE.outerHTML = `<li class="student"><input type="checkbox" id="student-${student.studentID}"><label for="student-${student.studentID}">${student.studentName}</label><div class="markInput"><input class="percent" studentID="${student.studentID}" id="markInput-${student.studentID}" type="number" min="0" max="100">%</div></li>`
                    })
                    clas.subjects.forEach(subject => {
                        subjectE = document.createElement('option')
                        subjectChooser.appendChild(subjectE)
                        subjectE.outerHTML = `<option value="${subject.subjectID}">${subject.subjectName}</option>`
                    })
                }
            })
            $$('.markInput input[type=number]').forEach(e => e.addEventListener('input', () => {
                let value = parseInt(e.value)
                let min = parseInt(e.getAttribute('min'))
                let max = parseInt(e.getAttribute('max'))
                if (value < min) e.value = min
                if (value > max) e.value = max
            }))
        }
        $('#manager').style.display = ""
        submit = () => {
            let sendData = { name: $('#mark-name').value, subjectID: parseInt($('#subject-chooser').value), periodID: parseInt($('#period-chooser').value), marks: [] }
            $$('#students-in-class .markInput input').forEach(e => {
                if (getComputedStyle(e.parentElement).display != "none" && parseInt(e.value).toString() != 'NaN') {
                    let mark = parseInt(e.value)
                    let min = parseInt(e.getAttribute('min'))
                    let max = parseInt(e.getAttribute('max'))
                    if (mark < min) mark = min
                    if (mark > max) mark = max
                    sendData.marks.push({ studentID: parseInt(e.getAttribute('studentID')), mark: mark })
                }
            })
            if (sendData.name && sendData.subjectID && sendData.marks.length > 0) {
                fetch('marks/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sendData)
                })
                    .then(res => res.json()
                        .then(res => {
                            if (res.message == 'ok') qAlert({ message: "marks.teacher.submitSuccess", mode: 'success', buttons: { cancel: { invisible: true } } }).then(ans => { if (ans) location.reload() })
                            if (res.message == 'not ok') qAlert({ message: "marks.teacher.unknownError", mode: 'error', buttons: { ok: { text: 'marks.teacher.retry' }, cancel: { text: "marks.teacher.donNotRetry" } } }).then(ans => { if (ans) submit() })
                        }))
                    .catch(() => { qAlert({ message: "marks.teacher.unknownError", mode: 'error', buttons: { ok: { text: 'marks.teacher.retry' }, cancel: { text: "marks.teacher.donNotRetry" } } }).then(ans => { if (ans) submit() })})
            } else { qAlert({ message: "marks.teacher.invalidInfo", mode: 'error', buttons: { cancel: { invisible: true } } }).then(ans => { if (ans) submit() }) }
        }
    }
}