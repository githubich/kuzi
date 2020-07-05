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
                                markEName.innerHTML = `${mark.item}`

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
        fetch('/class/listmine', { method: "POST" })
            .then(res => res.json()
                .then(res => {
                    data = res
                    console.log(data)

                    let myClasses = $('#myClasses')

                    data.forEach(clas => {
                        let clasE = document.createElement('li')
                        myClasses.appendChild(clasE)
                        clasE.outerHTML = `<li class="class"><input type="radio" oninput="update(this.value)" id="class-${clas.classID}" name="class" value="${clas.classID}"><label for="class-${clas.classID}">${clas.className}</label></li>`
                    })
                }))
        $('#manager').style.display = ""
    }
}

function update(updateID) {
    if (!updateID) return
    updateID = parseInt(updateID)
    console.log(updateID)

    let studentsInClass = $('#studentsInClass')
    let subjectChooser = $('#subject-chooser')

    data.forEach(clas => {
        if (clas.classID == updateID) {
            studentsInClass.innerHTML = ''
            subjectChooser.innerHTML = ''
            $('.students-block h3').innerHTML = `<i class="fad fa-users"></i>Students in ${clas.className}`
            clas.classStudents.forEach(student => {
                studentE = document.createElement('li')
                studentsInClass.appendChild(studentE)
                studentE.outerHTML = `<li class="student"><input type="checkbox" id="student-${student.studentID}"><label for="student-${student.studentID}">${student.studentName}</label><div class="markInput"><input class="percent" id="markInput-${student.studentID}" type="number" min="0" max="100">%</div></li>`
            })
            clas.subjects.forEach(subject => {
                subjectE = document.createElement('option')
                subjectChooser.appendChild(subjectE)
                subjectE.outerHTML = `<option value="${subject.subjectID}">${subject.subjectName}</option>`
            })
        }
    })
}