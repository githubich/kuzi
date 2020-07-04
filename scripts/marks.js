setPageTitle("calendar-check", "marks.title")
setActiveTab(2)

window.addEventListener('load', () => {
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
            .catch(e => console.error(e))
        )
        .catch(e => console.error(e))
})